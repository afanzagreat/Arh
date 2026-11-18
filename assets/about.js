/* ARH Design: About. The small envelope opens a note; the treasure-hunt items tick off. */
(function(){
  var hero=document.getElementById('aHero'), btn=document.getElementById('envBtn'), letter=document.getElementById('letter');
  if(hero&&btn&&letter){
    function place(){ var h=hero.getBoundingClientRect(), b=btn.getBoundingClientRect(); letter.style.setProperty('--ltop',Math.round(b.bottom-h.top+18)+'px'); }
    function set(v){
      hero.classList.toggle('open',v); btn.setAttribute('aria-expanded',v?'true':'false');
      btn.setAttribute('aria-label',v?"Close Afan's note":"Open Afan's note");
      if(v){ place(); letter.hidden=false; } else letter.hidden=true;
    }
    btn.addEventListener('click',function(e){ e.stopPropagation(); set(letter.hidden); });
    document.addEventListener('click',function(e){ if(!letter.hidden&&!letter.contains(e.target)&&!btn.contains(e.target)) set(false); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!letter.hidden){ set(false); btn.focus(); } });
    addEventListener('resize',function(){ if(!letter.hidden) place(); });
  }
})();
