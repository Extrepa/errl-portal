registerPaint('sparkle', class {
  static get inputProperties(){ return ['--twinkle','--seed']; }
  paint(ctx, geom, props){
    const t = parseFloat(props.get('--twinkle').toString()||'0');
    const seed = parseFloat(props.get('--seed').toString()||'0');
    function rand(n){ const x = Math.sin(n*999+seed*123.456)*43758.5453; return x - Math.floor(x); }
    const N = 140;
    for(let i=0;i<N;i++){
      const x = rand(i*7.1)*geom.width;
      const y = rand(i*11.2)*geom.height;
      const r = 0.6 + rand(i*13.3)*2.2;
      const a = 0.12 + 0.55*Math.abs(Math.sin(t*2 + i));
      ctx.fillStyle = 'rgba(255,255,255,'+a.toFixed(3)+')';
      ctx.beginPath(); ctx.arc(x,y,r,0,6.283); ctx.fill();
    }
  }
});