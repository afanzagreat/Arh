/* ARH Design: footer wordmark made of dots. The cursor (or a finger) scatters them; they spring back. */
(function(){
  var p=document.querySelector('.f-giant'); if(!p||!p.parentNode) return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html=document.documentElement, TEXT='ARH DESIGN';
  var cv=document.createElement('canvas'); cv.className='f-dots'; cv.setAttribute('aria-hidden','true');
  var ctx=cv.getContext('2d'); if(!ctx) return;
  p.parentNode.insertBefore(cv,p);
  var parts=[],W=0,H=0,dpr=1,mx=-9999,my=-9999,R=110,rad=2.4,running=false,visible=true,cDot='#fff',cHi='#f00';

  function colors(){var s=getComputedStyle(html);cDot=s.getPropertyValue('--dot').trim()||'#fff';cHi=s.getPropertyValue('--dot-hi').trim()||'#f00';}
  function build(){
    W=Math.floor(cv.getBoundingClientRect().width); if(W<50) return;
    dpr=Math.min(window.devicePixelRatio||1,2);
    var off=document.createElement('canvas'), o=off.getContext('2d');
    o.font='400 100px Anton, Impact, sans-serif';
    var m=o.measureText(TEXT), fs=100*W/m.width;
    o.font='400 '+fs+'px Anton, Impact, sans-serif';
    m=o.measureText(TEXT);
    var asc=Math.ceil(m.actualBoundingBoxAscent), desc=Math.ceil(m.actualBoundingBoxDescent);
    H=asc+desc+8;
    off.width=W; off.height=H; o.font='400 '+fs+'px Anton, Impact, sans-serif'; o.textBaseline='alphabetic';
    o.fillStyle='#000'; o.fillText(TEXT,(W-m.width)/2,asc+4);
    var data=o.getImageData(0,0,W,H).data;
    var step=Math.max(4,Math.round(W/170)); rad=step*0.3; R=Math.max(70,Math.min(150,W*.085));
    parts=[];
    for(var y=step/2;y<H;y+=step) for(var x=step/2;x<W;x+=step){
      if(data[((Math.floor(y)*W)+Math.floor(x))*4+3]>128) parts.push({x:x,y:y,hx:x,hy:y,vx:0,vy:0});
    }
    cv.width=W*dpr; cv.height=H*dpr; cv.style.height=H+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    colors(); draw();
  }
  function step(){
    var moving=false,R2=R*R,i,q,dx,dy,d2,d,f;
    for(i=0;i<parts.length;i++){
      q=parts[i]; dx=q.x-mx; dy=q.y-my; d2=dx*dx+dy*dy;
      if(d2<R2){ d=Math.sqrt(d2)||1; f=1-d/R; f=f*f*11; q.vx+=dx/d*f; q.vy+=dy/d*f; }
      q.vx+=(q.hx-q.x)*.05; q.vy+=(q.hy-q.y)*.05; q.vx*=.85; q.vy*=.85;
      q.x+=q.vx; q.y+=q.vy;
      if(Math.abs(q.vx)>.01||Math.abs(q.vy)>.01||Math.abs(q.x-q.hx)>.05||Math.abs(q.y-q.hy)>.05) moving=true;
    }
    return moving;
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    var i,q,dx,dy;
    ctx.fillStyle=cDot; ctx.beginPath();
    for(i=0;i<parts.length;i++){q=parts[i];dx=q.x-q.hx;dy=q.y-q.hy; if(dx*dx+dy*dy<9){ctx.moveTo(q.x+rad,q.y);ctx.arc(q.x,q.y,rad,0,6.2832);} }
    ctx.fill();
    ctx.fillStyle=cHi; ctx.beginPath();
    for(i=0;i<parts.length;i++){q=parts[i];dx=q.x-q.hx;dy=q.y-q.hy; if(dx*dx+dy*dy>=9){ctx.moveTo(q.x+rad*1.15,q.y);ctx.arc(q.x,q.y,rad*1.15,0,6.2832);} }
    ctx.fill();
  }
  function frame(){
    if(!visible){running=false;return;}
    var mv=step(); draw();
    if(mv||mx>-9000) requestAnimationFrame(frame); else running=false;
  }
  function kick(){ if(!running&&visible&&!RM){running=true;requestAnimationFrame(frame);} }
  function point(cx,cy){
    var r=cv.getBoundingClientRect(); mx=cx-r.left; my=cy-r.top;
    if(mx<-R||mx>W+R||my<-R||my>H+R){mx=my=-9999;} else kick();
  }
  function init(){
    build(); if(!parts.length) return;
    p.classList.add('off');
    if(RM) return;
    addEventListener('mousemove',function(e){point(e.clientX,e.clientY);},{passive:true});
    addEventListener('touchmove',function(e){var t=e.touches[0];if(t)point(t.clientX,t.clientY);},{passive:true});
    addEventListener('touchstart',function(e){var t=e.touches[0];if(t)point(t.clientX,t.clientY);},{passive:true});
    addEventListener('touchend',function(){mx=my=-9999;kick();},{passive:true});
    document.addEventListener('mouseleave',function(){mx=my=-9999;kick();});
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)kick();}).observe(cv);
    new MutationObserver(function(){colors();draw();}).observe(html,{attributes:true,attributeFilter:['data-theme']});
    var lw=W,rt=0;
    addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(Math.abs(cv.getBoundingClientRect().width-lw)>2){build();lw=W;}},200);});
  }
  var go=function(){init();};
  if(document.fonts&&document.fonts.load) document.fonts.load('400 100px Anton','ARH DESIGN').then(go,go); else go();
})();
