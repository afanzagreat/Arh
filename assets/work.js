/* ===================================================================
   ARH Design: work pages behaviour
   =================================================================== */
(function(){
  var ARH=window.ARH||{};
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---------- project list: a preview image follows the cursor ---------- */
  var peek=document.getElementById('peek');
  if(peek&&FINE&&!RM){
    var img=peek.querySelector('img'), tx=0,ty=0,cx=0,cy=0,on=false,rot=0;
    document.addEventListener('mousemove',function(e){ tx=e.clientX+36; ty=e.clientY-90; },{passive:true});
    (function loop(){
      cx+=(tx-cx)*.14; cy+=(ty-cy)*.14;
      rot+=(((tx-cx)*.06)-rot)*.12;
      peek.style.transform='translate('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px) rotate('+Math.max(-8,Math.min(8,rot)).toFixed(2)+'deg)';
      requestAnimationFrame(loop);
    })();
    [].slice.call(document.querySelectorAll('[data-peek]')).forEach(function(a){
      a.addEventListener('mouseenter',function(){ img.src=a.getAttribute('data-peek'); peek.classList.add('on'); });
      a.addEventListener('mouseleave',function(){ peek.classList.remove('on'); });
    });
  }

  /* ---------- case study: photo eases from zoomed to full as you scroll past it ---------- */
  var full=document.querySelector('.c-full');
  if(full&&!RM){
    ARH.onScroll=function(){
      var r=full.getBoundingClientRect(), p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));
      full.style.setProperty('--z',(1.1-p*.1).toFixed(3));
    };
    ARH.onScroll();
  }
})();
