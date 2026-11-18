/* ARH Design: marker mode. The ghost hands it over (see site.js). Ink fades; scrolling wipes it fast. */
(function(){
  var html=document.documentElement;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv=document.createElement('canvas'); cv.id='doodle'; cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;z-index:28;pointer-events:none;touch-action:none';
  document.body.appendChild(cv);
  var done=document.createElement('button'); done.type='button'; done.className='pen-done'; done.textContent='Done drawing'; done.hidden=true;
  document.body.appendChild(done);
  var ctx=cv.getContext('2d'), dpr=1, W=0, H=0, strokes=[], cur=null, on=false, raf=0;
  var FADE_AFTER=4500, FADE_FOR=3000, FAST=450;
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
  size(); addEventListener('resize',size);
  function cs(n,fb){return getComputedStyle(html).getPropertyValue(n).trim()||fb;}
  function draw(){
    ctx.clearRect(0,0,W,H);
    var now=performance.now(), col=cs('--accent-text','#FB3640'), halo=cs('--bg','#000F08'), alive=[], i,s,a,j,pass;
    ctx.lineCap='round'; ctx.lineJoin='round';
    for(i=0;i<strokes.length;i++){
      s=strokes[i]; a=1;
      if(s.fast){ a=1-(now-s.fast)/FAST; }
      else if(!RM && s.done){ var age=now-s.t; if(age>FADE_AFTER) a=1-(age-FADE_AFTER)/FADE_FOR; }
      if(a<=0) continue;
      alive.push(s); ctx.globalAlpha=a;
      for(pass=0;pass<2;pass++){
        ctx.strokeStyle=pass?col:halo; ctx.lineWidth=pass?6:13;
        ctx.beginPath(); ctx.moveTo(s.p[0].x,s.p[0].y);
        for(j=1;j<s.p.length-1;j++){var m={x:(s.p[j].x+s.p[j+1].x)/2,y:(s.p[j].y+s.p[j+1].y)/2}; ctx.quadraticCurveTo(s.p[j].x,s.p[j].y,m.x,m.y);}
        if(s.p.length>1) ctx.lineTo(s.p[s.p.length-1].x,s.p[s.p.length-1].y); else ctx.lineTo(s.p[0].x+.1,s.p[0].y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha=1; strokes=alive;
    raf=strokes.length?requestAnimationFrame(draw):0;
  }
  function kick(){if(!raf) raf=requestAnimationFrame(draw);}
  /* scrolling wipes the ink quickly */
  addEventListener('scroll',function(){
    var now=performance.now(); strokes.forEach(function(s){ if(!s.fast) s.fast=now; }); if(strokes.length) kick();
  },{passive:true});
  function pt(e){return {x:e.clientX,y:e.clientY};}
  cv.addEventListener('pointerdown',function(e){
    if(!on) return; cv.setPointerCapture(e.pointerId);
    cur={p:[pt(e)],done:false,t:performance.now()}; strokes.push(cur); kick(); e.preventDefault();
  });
  cv.addEventListener('pointermove',function(e){ if(cur){cur.p.push(pt(e));cur.t=performance.now();kick();} });
  function end(){ if(cur){cur.done=true;cur.t=performance.now();cur=null;kick();} }
  cv.addEventListener('pointerup',end); cv.addEventListener('pointercancel',end);
  function set(v){
    on=v; cv.style.pointerEvents=v?'auto':'none'; cv.style.cursor=v?'crosshair':'';
    html.classList.toggle('doodling',v); done.hidden=!v;
    if(!v){ end(); if(RM){strokes=[];ctx.clearRect(0,0,W,H);} }
  }
  done.addEventListener('click',function(){set(false);});
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&on) set(false); });
  window.ARH_DOODLE={start:function(){set(true);},stop:function(){set(false);}};
})();
