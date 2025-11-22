
(()=>{
  // Simple emitter
  const bus = document.createElement('div');
  window.ErrlShared = {
    on: (evt, fn)=> bus.addEventListener(evt, fn),
    emit: (evt, detail)=> bus.dispatchEvent(new CustomEvent(evt, {detail})),
    glowToggle: ()=> document.documentElement.classList.toggle('glow'),
  };
  addEventListener('keydown', e=>{
    if(e.key.toLowerCase()==='g') window.ErrlShared.glowToggle();
    if(e.key.toLowerCase()==='r') { try { const ifr=document.querySelector('iframe'); if(ifr) ifr.contentWindow.location.reload(); else location.reload(); } catch(_){ location.reload(); } }
  });
})();
