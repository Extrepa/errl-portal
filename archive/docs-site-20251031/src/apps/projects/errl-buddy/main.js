// Errl Buddy main logic — Pixi + Matter (no bundler)
const { Engine, World, Bodies, Body, Runner, Mouse, MouseConstraint, Composite, Constraint } = Matter;

const stageEl = document.getElementById('stage');
const DPR = Math.max(1, window.devicePixelRatio || 1);
const W = () => stageEl.clientWidth || window.innerWidth;
const H = () => stageEl.clientHeight || window.innerHeight - 52;

// PIXI app
const app = new PIXI.Application({
  resizeTo: stageEl,
  antialias: true,
  backgroundAlpha: 0,
});
stageEl.appendChild(app.view);

// Matter engine
const engine = Engine.create({ enableSleeping: true });
engine.world.gravity.y = 0.9;
const runner = Runner.create();
Runner.run(runner, engine);

// Collision categories
const CAT = { BUDDY: 0x0001, MISC: 0x0002, WALL: 0x0004 };

// Simple game state and display mapping
const State = { money: 0 };
const displays = new Map(); // body.id -> PIXI.DisplayObject
const buddyPartIds = new Set(); // for collision checks

// Scene containers
const scene = new PIXI.Container();
app.stage.addChild(scene);

// HUD refs
const moneyHud = document.getElementById('moneyHud');
function setMoney(v){ State.money = Math.max(0, Math.floor(v)); if(moneyHud) moneyHud.textContent = `$${State.money}`; }
setMoney(0);

// Load Errl SVG sprite
const ERRL_SVG = '../../../portal/assets/L4_Central/errl-face-2.svg';
const errlSprite = await loadErrlSprite(ERRL_SVG);
scene.addChild(errlSprite);

// Buddy ragdoll (head + torso + limbs)
const buddy = createBuddy(W()*0.5, H()*0.45);
World.add(engine.world, buddy.composite);

// track part ids
for(const b of buddy.parts){ buddyPartIds.add(b.id); }

fitSpriteToBody(errlSprite, buddy.head, 1.0); // align sprite to head

// Bounds
function buildWalls() {
  const thick = 80;
  const w = W();
  const h = H();
  const make = (x,y,wid,hei,opts={}) => Bodies.rectangle(x,y,wid,hei, Object.assign({ isStatic:true, collisionFilter:{ category: CAT.WALL } }, opts));
  const walls = [
    make(w/2, h + thick/2, w, thick, { restitution: 0.8 }), // floor
    make(w/2, -thick/2, w, thick), // ceiling
    make(-thick/2, h/2, thick, h), // left
    make(w + thick/2, h/2, thick, h), // right
  ];
  return Composite.create({ bodies: walls });
}
let walls = buildWalls();
World.add(engine.world, walls);

// Mouse drag support (use Pixi canvas element)
const mouse = Mouse.create(app.view);
mouse.pixelRatio = DPR;
const mConstraint = MouseConstraint.create(engine, {
  mouse,
  constraint: {
    stiffness: 0.3,
    damping: 0.15,
    render: { visible: false },
    collisionFilter: { category: CAT.BUDDY, mask: CAT.BUDDY }
  },
});
World.add(engine.world, mConstraint);

// Sync Pixi sprite with physics body and dynamic displays
const tickListeners = new Set();
app.ticker.add(() => {
  errlSprite.position.set(buddy.head.position.x, buddy.head.position.y);
  errlSprite.rotation = buddy.head.angle;
  // sync simple displays
  for (const [id, gfx] of displays) {
    const body = Composite.get(engine.world, id, 'body');
    if(!body){ // removed elsewhere
      if(gfx.parent) gfx.parent.removeChild(gfx);
      displays.delete(id); continue;
    }
    gfx.position.set(body.position.x, body.position.y);
    gfx.rotation = body.angle;
    // auto-despawn if far below
    if(body.position.y > H() + 300){ World.remove(engine.world, body); if(gfx.parent) gfx.parent.removeChild(gfx); displays.delete(id); }
  }
  // user scripts
  for(const fn of tickListeners){ try{ fn(); }catch(e){} }
});

// Resize handling
window.addEventListener('resize', () => {
  // Rebuild walls to new size
  World.remove(engine.world, walls);
  walls = buildWalls();
  World.add(engine.world, walls);
});

// Controls
const btnSpawnBall = document.getElementById('spawnBall');
const btnSpawnCoin = document.getElementById('spawnCoin');
const btnPoke = document.getElementById('poke');
const btnGravity = document.getElementById('toggleGravity');
const btnReset = document.getElementById('reset');
const btnLoadCoinRain = document.getElementById('loadCoinRain');
const shop = document.getElementById('shop');
const btnShopToggle = document.getElementById('shopToggle');
const btnShopClose = document.getElementById('closeShop');

btnSpawnBall?.addEventListener('click', () => spawnBall());
btnSpawnCoin?.addEventListener('click', () => spawnCoin());
btnPoke?.addEventListener('click', () => pokeErrl());
btnGravity?.addEventListener('click', () => toggleGravity());
btnReset?.addEventListener('click', () => resetScene());
btnLoadCoinRain?.addEventListener('click', () => loadScript('./scripts/coin_rain.js'));
btnShopToggle?.addEventListener('click', () => toggleShop());
btnShopClose?.addEventListener('click', () => toggleShop(false));
shop?.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('button.buy');
  if(!b) return;
  const item = b.dataset.item; const cost = parseInt(b.dataset.cost||'0',10);
  purchase(item, cost);
});

function makeCircleGfx(radius, fill=0xffdd55){
  const g = new PIXI.Graphics();
  g.beginFill(fill, 0.9).drawCircle(0,0, radius).endFill();
  g.alpha = 0.95; g.pivot.set(0,0); g.position.set(0,0); g.zIndex = 0;
  scene.addChild(g);
  return g;
}

function spawnBall() {
  const r = 10 + Math.random()*14;
  const x = 40 + Math.random()*(W()-80);
  const y = -20;
  const ball = Bodies.circle(x, y, r, {
    restitution: 0.8,
    friction: 0.02,
    frictionAir: 0.003,
    density: 0.0009,
    label: 'ball',
    collisionFilter: { category: CAT.MISC, mask: CAT.WALL | CAT.BUDDY | CAT.MISC }
  });
  World.add(engine.world, ball);
  const gfx = makeCircleGfx(r, 0x66ccff);
  displays.set(ball.id, gfx);
}

function spawnCoin(x = 40 + Math.random()*(W()-80), y = -20, r = 10 + Math.random()*10){
  const coin = Bodies.circle(x, y, r, {
    restitution: 0.2,
    friction: 0.15,
    frictionAir: 0.004,
    density: 0.0007,
    label: 'coin',
    collisionFilter: { category: CAT.MISC, mask: CAT.WALL | CAT.BUDDY | CAT.MISC }
  });
  coin.plugin = { type: 'coin', value: Math.max(1, Math.round(r/4)) };
  World.add(engine.world, coin);
  const gfx = makeCircleGfx(r, 0xffd966);
  displays.set(coin.id, gfx);
  return coin;
}

function pokeErrl() {
  // Apply a quick impulse in a random direction
  const magnitude = 0.02;
  const angle = Math.random()*Math.PI*2;
  const force = { x: Math.cos(angle)*magnitude, y: Math.sin(angle)*magnitude };
  Body.applyForce(errlBody, { x: errlBody.position.x, y: errlBody.position.y }, force);
}

function toggleGravity() {
  const on = engine.world.gravity.y !== 0;
  engine.world.gravity.y = on ? 0 : 1.0;
  if (btnGravity) {
    btnGravity.setAttribute('aria-pressed', String(!on));
    btnGravity.textContent = `Gravity: ${on ? 'Off' : 'On'}`;
  }
}

function resetScene() {
  const x = W()*0.5, y = H()*0.45;
  // reposition buddy parts
  Body.setPosition(buddy.head, { x, y: y-110 }); Body.setAngle(buddy.head, 0); Body.setVelocity(buddy.head, {x:0,y:0}); Body.setAngularVelocity(buddy.head, 0);
  Body.setPosition(buddy.torso, { x, y }); Body.setAngle(buddy.torso, 0); Body.setVelocity(buddy.torso, {x:0,y:0}); Body.setAngularVelocity(buddy.torso, 0);
  for(const limb of [buddy.armL, buddy.armR, buddy.legL, buddy.legR]){
    Body.setVelocity(limb, {x:0,y:0}); Body.setAngularVelocity(limb, 0);
  }
}

function toggleShop(force){
  const on = typeof force === 'boolean' ? force : !shop.classList.contains('visible');
  shop.classList.toggle('visible', on);
  btnShopToggle?.setAttribute('aria-pressed', String(on));
}

function canAfford(cost){ return State.money >= cost; }
function spend(cost){ setMoney(State.money - cost); }
function purchase(item, cost){
  if(!canAfford(cost)) return;
  spend(cost);
  switch(item){
    case 'coinpack': {
      const c = errlBody.position;
      for(let i=0;i<5;i++) spawnCoin(c.x - 60 + Math.random()*120, c.y - 180 - Math.random()*40, 10 + Math.random()*8);
      break;
    }
    case 'bomb': {
      const c = errlBody.position; Tools.explode ? Tools.explode(c.x, c.y, 0.08) : explodeLocal(c.x, c.y, 0.08); break;
    }
    case 'ball10': {
      for(let i=0;i<10;i++) spawnBall(); break;
    }
    case 'zerog5': {
      const prev = engine.world.gravity.y;
      engine.world.gravity.y = 0;
      setTimeout(()=>{ engine.world.gravity.y = prev; }, 5000);
      break;
    }
  }
}

// local explode fallback if script Tools not in scope here
function explodeLocal(x,y,power=0.03){
  const all = Composite.allBodies(engine.world);
  for(const b of all){
    if(b.isStatic) continue;
    const dx = b.position.x - x, dy = b.position.y - y;
    const d2 = dx*dx + dy*dy; if(d2 > 400*400) continue;
    const d = Math.max(10, Math.sqrt(d2));
    const f = power / d;
    Body.applyForce(b, b.position, { x: dx/d * f, y: dy/d * f });
  }
}

// Collisions: coin pickup + script hooks
Matter.Events.on(engine, 'collisionStart', (ev) => {
  for(const pair of ev.pairs){
    const { bodyA, bodyB } = pair;
const aBuddy = buddyPartIds.has(bodyA.id); const bBuddy = buddyPartIds.has(bodyB.id);
    if(aBuddy || bBuddy){
      const other = aBuddy ? bodyB : bodyA;
      if(other && other.label === 'coin'){
        const val = (other.plugin && other.plugin.value) || 1;
        setMoney(State.money + val);
        // remove coin
        World.remove(engine.world, other);
        const gfx = displays.get(other.id); if(gfx && gfx.parent) gfx.parent.removeChild(gfx); displays.delete(other.id);
      }
    }
    // notify scripts
    for(const fn of hookSets.collide){ try{ fn({ pair, bodyA, bodyB }); }catch(e){} }
  }
});

// Helpers
async function loadErrlSprite(url) {
  const texture = await PIXI.Assets.load(url);
  const sprite = new PIXI.Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.alpha = 0.98;
  return sprite;
}

function fitSpriteToBody(sprite, body, scaleOverRadius = 1.0) {
  const texW = sprite.texture.width || 512;
  const targetW = (body.circleRadius || 80) * scaleOverRadius * 2;
  const s = targetW / texW;
  sprite.scale.set(s);
}

// Build a simple ragdoll buddy
function createBuddy(x,y){
  const group = -1;
  const head = Bodies.circle(x, y-110, 80, {
    restitution: 0.6, friction: 0.02, frictionAir: 0.012, density: 0.002,
    collisionFilter: { group, category: CAT.BUDDY, mask: CAT.WALL | CAT.MISC | CAT.BUDDY },
    label: 'buddy-head'
  });
  const torso = Bodies.rectangle(x, y, 120, 160, {
    chamfer: { radius: 30 }, restitution: 0.2, friction: 0.2, frictionAir: 0.02, density: 0.003,
    collisionFilter: { group, category: CAT.BUDDY, mask: CAT.WALL | CAT.MISC | CAT.BUDDY },
    label: 'buddy-torso'
  });
  const armL = Bodies.rectangle(x-90, y-10, 20, 120, {
    chamfer: { radius: 10 }, collisionFilter: { group, category: CAT.BUDDY, mask: CAT.WALL | CAT.MISC | CAT.BUDDY },
    density: 0.0015, frictionAir: 0.02, label: 'buddy-armL'
  });
  const armR = Bodies.rectangle(x+90, y-10, 20, 120, {
    chamfer: { radius: 10 }, collisionFilter: { group, category: CAT.BUDDY, mask: CAT.WALL | CAT.MISC | CAT.BUDDY },
    density: 0.0015, frictionAir: 0.02, label: 'buddy-armR'
  });
  const legL = Bodies.rectangle(x-35, y+150, 26, 130, {
    chamfer: { radius: 10 }, collisionFilter: { group, category: CAT.BUDDY, mask: CAT.WALL | CAT.MISC | CAT.BUDDY },
    density: 0.002, friction: 0.9, label: 'buddy-legL'
  });
  const legR = Bodies.rectangle(x+35, y+150, 26, 130, {
    chamfer: { radius: 10 }, collisionFilter: { group, category: CAT.BUDDY, mask: CAT.WALL | CAT.MISC | CAT.BUDDY },
    density: 0.002, friction: 0.9, label: 'buddy-legR'
  });

  const joints = [
    Constraint.create({ bodyA: head, pointA: {x:0,y:80}, bodyB: torso, pointB: {x:0,y:-70}, stiffness: 0.8, damping: 0.2 }),
    Constraint.create({ bodyA: torso, pointA: {x:-60,y:-40}, bodyB: armL, pointB: {x:0,y:-50}, stiffness: 0.6, damping: 0.2 }),
    Constraint.create({ bodyA: torso, pointA: {x: 60,y:-40}, bodyB: armR, pointB: {x:0,y:-50}, stiffness: 0.6, damping: 0.2 }),
    Constraint.create({ bodyA: torso, pointA: {x:-30,y: 80}, bodyB: legL, pointB: {x:0,y:-60}, stiffness: 0.8, damping: 0.2 }),
    Constraint.create({ bodyA: torso, pointA: {x: 30,y: 80}, bodyB: legR, pointB: {x:0,y:-60}, stiffness: 0.8, damping: 0.2 }),
  ];

  const comp = Composite.create({ label: 'buddy' });
  Composite.add(comp, [head, torso, armL, armR, legL, legR, ...joints]);
  return { composite: comp, head, torso, armL, armR, legL, legR, parts: [head, torso, armL, armR, legL, legR] };
}

// Basic script system (very lightweight, unsafe for untrusted code)
const hookSets = {
  collide: new Set(),
  mouseDown: new Set(),
  mouseUp: new Set(),
};

// Pointer events → script hooks
app.view.addEventListener('pointerdown', (e) => {
  const rect = app.view.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (app.renderer.width / rect.width);
  const y = (e.clientY - rect.top) * (app.renderer.height / rect.height);
  for(const fn of hookSets.mouseDown){ try{ fn({ x, y, button: e.button }); }catch(err){} }
});
app.view.addEventListener('pointerup', (e) => {
  const rect = app.view.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (app.renderer.width / rect.width);
  const y = (e.clientY - rect.top) * (app.renderer.height / rect.height);
  for(const fn of hookSets.mouseUp){ try{ fn({ x, y, button: e.button }); }catch(err){} }
});

// Basic script system (very lightweight, unsafe for untrusted code)
async function loadScript(url){
  const res = await fetch(url, { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load script: '+url);
  const code = await res.text();
  const api = Function('Buddy','Tools','State','onTick','View', code);
  const Buddy = {
    body: buddy.head,
    center(){ return { x: buddy.head.position.x, y: buddy.head.position.y }; },
    applyImpulse(x,y){ Body.applyForce(buddy.head, buddy.head.position, { x, y }); },
    setGravity(on){ engine.world.gravity.y = on ? 0.9 : 0; }
  };
  const Tools = {
    spawnBall,
    spawnCoin,
    explode(x,y,power=0.03){
      const all = Composite.allBodies(engine.world);
      for(const b of all){
        if(b.isStatic) continue;
        const dx = b.position.x - x, dy = b.position.y - y;
        const d2 = dx*dx + dy*dy; if(d2 > 400*400) continue;
        const d = Math.max(10, Math.sqrt(d2));
        const f = power / d;
        Body.applyForce(b, b.position, { x: dx/d * f, y: dy/d * f });
      }
    },
  };
  const View = { width: () => W(), height: () => H() };
  const On = function onTick(fn){ if(typeof fn === 'function') tickListeners.add(fn); };
  On.onCollide = (fn) => { if(typeof fn === 'function') hookSets.collide.add(fn); };
  On.onMouseDown = (fn) => { if(typeof fn === 'function') hookSets.mouseDown.add(fn); };
  On.onMouseUp = (fn) => { if(typeof fn === 'function') hookSets.mouseUp.add(fn); };
  api(Buddy, Tools, State, On, View);
}
