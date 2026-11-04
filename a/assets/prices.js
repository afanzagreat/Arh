/* ARH Design: Prices. The (i) opens a small note on hover, focus or tap. Esc or an outside tap closes it. */
(function(){
  var wrap=document.querySelector('.p-info'), btn=document.getElementById('infoBtn'), tip=document.getElementById('infoTip');
  if(!wrap||!btn||!tip) return;
  var hoverOK=matchMedia('(hover:hover)').matches, closeT=0;
  function setOpen(v){
    clearTimeout(closeT);
    wrap.classList.toggle('open',v); tip.hidden=!v; btn.setAttribute('aria-expanded',v?'true':'false');
    if(v){ var b=btn.getBoundingClientRect(), p=tip.offsetParent?tip.offsetParent.getBoundingClientRect():{left:0}; tip.style.setProperty('--ix',Math.max(14,b.left+b.width/2-p.left-10)+'px'); }
  }
  btn.addEventListener('click',function(e){ e.stopPropagation(); setOpen(tip.hidden); });
  if(hoverOK){
    wrap.addEventListener('mouseenter',function(){setOpen(true);});
    wrap.addEventListener('mouseleave',function(){closeT=setTimeout(function(){setOpen(false);},180);});
  }
  document.addEventListener('click',function(e){ if(!wrap.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!tip.hidden){ setOpen(false); btn.focus(); } });
})();
