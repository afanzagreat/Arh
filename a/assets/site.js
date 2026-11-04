/* ===================================================================
   ARH Design: shared behaviour (every page)
   =================================================================== */
(function(){
  var html=document.documentElement, body=document.body;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE=matchMedia('(hover:hover) and (pointer:fine)').matches;
  var hasG=!!window.gsap;
  var ARH=window.ARH={ready:body.getAttribute('data-page')!=='home',menuOpen:false};
  if(RM) html.classList.add('rm');

  /* ---------------- theme toggle (dark <-> light) ---------------- */
  var tb=document.getElementById('themeBtn');
  function setTheme(t,persist){
    html.setAttribute('data-theme',t);
    var meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',t==='light'?'#F7E1DB':'#000F08');
    if(tb){
      tb.setAttribute('aria-pressed',t==='light'?'true':'false');
      tb.setAttribute('aria-label',t==='light'?'Switch to dark theme':'Switch to light theme');
    }
    if(persist){try{localStorage.setItem('arh-theme',t);}catch(e){}}
  }
  setTheme(html.getAttribute('data-theme')==='light'?'light':'dark',false);
  if(tb) tb.addEventListener('click',function(){
    var next=html.getAttribute('data-theme')==='light'?'dark':'light';
    var r=tb.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    var big=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y))+40;
    if(!RM && document.startViewTransition){
      html.classList.add('theme-vt');
      var vt=document.startViewTransition(function(){ setTheme(next,true); });
      vt.ready.then(function(){
        html.animate({clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+big+'px at '+x+'px '+y+'px)']},
          {duration:1500,easing:'cubic-bezier(.77,0,.175,1)',pseudoElement:'::view-transition-new(root)'});
      });
      vt.finished.then(function(){html.classList.remove('theme-vt');},function(){html.classList.remove('theme-vt');});
    }else{
      html.classList.add('theming');
      setTheme(next,true);
      setTimeout(function(){html.classList.remove('theming');},1600);
    }
  });

  /* ---------------- full-screen menu (slow, calm) ---------------- */
  var btn=document.getElementById('menuBtn'), menu=document.getElementById('menu');
  var linksEl=[].slice.call(menu.querySelectorAll('.m-link'));
  var isOpen=false, lastFocus=null;
  function setOpen(v){
    isOpen=v; ARH.menuOpen=v;
    btn.setAttribute('aria-expanded',v); btn.setAttribute('aria-label',v?'Close menu':'Open menu');
    html.classList.toggle('menu-open',v);
    var main=document.getElementById('main'); if(main) main.setAttribute('aria-hidden',v?'true':'false');
    var r=btn.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    var big=Math.hypot(innerWidth,innerHeight)+40;
    if(v){
      lastFocus=document.activeElement; menu.classList.add('on'); body.style.overflow='hidden';
      if(hasG&&!RM){
        gsap.killTweensOf(menu);
        gsap.fromTo(menu,{clipPath:'circle(0px at '+x+'px '+y+'px)'},{clipPath:'circle('+big+'px at '+x+'px '+y+'px)',duration:1.5,ease:'power3.inOut'});
        gsap.fromTo('.m-link .in',{yPercent:112},{yPercent:0,duration:1.15,stagger:.13,delay:.7,ease:'power4.out'});
        gsap.fromTo('.m-foot',{opacity:0},{opacity:.8,duration:.8,delay:1.6});
      }
      setTimeout(function(){linksEl[0].focus();},RM?0:900);
    }else{
      body.style.overflow='';
      if(hasG&&!RM){
        gsap.killTweensOf(menu);
        gsap.to(menu,{clipPath:'circle(0px at '+x+'px '+y+'px)',duration:1.0,ease:'power3.inOut',onComplete:function(){menu.classList.remove('on');}});
      }else{menu.classList.remove('on');}
      (lastFocus||btn).focus();
    }
  }
  btn.addEventListener('click',function(){setOpen(!isOpen);});
  document.addEventListener('keydown',function(e){
    if(!isOpen) return;
    if(e.key==='Escape'){setOpen(false);return;}
    if(e.key==='Tab'){
      var f=[tb,btn].concat(linksEl).filter(Boolean), i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus();}
      else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus();}
    }
  });
  linksEl.forEach(function(a){a.addEventListener('click',function(){ if(isOpen){ setOpen(false);} });});

  /* ---------------- slow, looping shuffle on the menu words ----------------
     letters break away one by one, flicker slowly, come back one by one, rest, repeat */
  var pool='0123456789#%&*ABCDEFGHJKLMNPRSTUVWXYZ';
  function rc(){return pool[Math.floor(Math.random()*pool.length)];}
  function startShuffle(a){
    if(RM||a._on) return;
    a._on=true;
    var el=a.querySelector('.in'), fin=a.getAttribute('data-text'), n=fin.length;
    var broken=[], chars=fin.split(''), mode='out', hold=0, mixed=0, i;
    for(i=0;i<n;i++) broken.push(false);
    function draw(){
      for(i=0;i<n;i++){
        if(!broken[i]) chars[i]=fin[i];
        else if(Math.random()<.55) chars[i]=rc();
      }
      el.textContent=chars.join('');
    }
    function tick(){
      if(!a._on) return;
      var idx=[];
      if(mode==='out'){
        for(i=0;i<n;i++) if(!broken[i]) idx.push(i);
        if(idx.length){ var k=idx[Math.floor(Math.random()*idx.length)]; broken[k]=true; chars[k]=rc(); } else { mode='mixed'; mixed=0; }
      }else if(mode==='mixed'){
        if(++mixed>5) mode='back';
      }else if(mode==='back'){
        for(i=0;i<n;i++) if(broken[i]){ broken[i]=false; break; }
        var left=0; for(i=0;i<n;i++) if(broken[i]) left++;
        if(!left){ mode='hold'; hold=0; }
      }else{
        if(++hold>8) mode='out';
      }
      draw();
      a._t=setTimeout(tick,260);
    }
    tick();
  }
  function stopShuffle(a){
    a._on=false; clearTimeout(a._t);
    a.querySelector('.in').textContent=a.getAttribute('data-text');
  }
  linksEl.forEach(function(a){
    a.addEventListener('mouseenter',function(){startShuffle(a)});
    a.addEventListener('mouseleave',function(){stopShuffle(a)});
    a.addEventListener('focus',function(){startShuffle(a)});
    a.addEventListener('blur',function(){stopShuffle(a)});
  });


  /* ---------------- menu badge: centre word changes with the hovered link ---------------- */
  var badge=document.querySelector('.badge'), bword=badge&&badge.querySelector('.word');
  var WORDS={home:'HELLO',work:'LOOK',services:'MAKE',about:'HI',contact:'SAY HI',prices:'PRICE'};
  function setWord(w){ if(!bword||bword.textContent===w) return; bword.textContent=w; bword.style.fontSize=(w.length<=4?40:w.length<=5?32:26)+'px'; badge.classList.remove('pop'); void badge.getBoundingClientRect(); badge.classList.add('pop'); }
  linksEl.forEach(function(a){
    var w=WORDS[(a.getAttribute('data-text')||'').toLowerCase()]||'ARH';
    a.addEventListener('mouseenter',function(){setWord(w);});
    a.addEventListener('focus',function(){setWord(w);});
    a.addEventListener('mouseleave',function(){setWord('ARH');});
    a.addEventListener('blur',function(){setWord('ARH');});
  });

  /* ---------------- custom cursor (mouse only) ---------------- */
  var dot=document.getElementById('curDot'), lab=document.getElementById('curLabel');
  if(dot&&FINE&&!RM){
    html.classList.add('has-cursor');
    var tx=-100,ty=-100,cx=-100,cy=-100;
    addEventListener('mousemove',function(e){tx=e.clientX;ty=e.clientY;},{passive:true});
    (function loop(){ cx+=(tx-cx)*.28; cy+=(ty-cy)*.28; dot.style.transform='translate('+cx+'px,'+cy+'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover',function(e){
      var t=e.target.closest&&e.target.closest('a,button,[data-cursor]');
      dot.classList.toggle('cta',!!(t&&t.classList.contains('btn')));
      if(t){
        lab.textContent=t.getAttribute('data-cursor')||(t.id==='menuBtn'?(isOpen?'Close':'Menu'):(t.id==='themeBtn'?'Theme':(t.classList.contains('m-link')?'Open':'Go')));
        dot.classList.add('big');
      }else dot.classList.remove('big');
    });
  }

  /* ---------------- page reveal: new page grows from the middle (not used for menu links) ---------------- */
  if(html.classList.contains('reveal')){
    if(RM||!body.animate){ html.classList.remove('reveal'); }
    else{
      var rcx=innerWidth/2, rcy=innerHeight/2, rR=Math.hypot(rcx,rcy)+60;
      var ran=body.animate({clipPath:['circle(0px at '+rcx+'px '+rcy+'px)','circle('+rR+'px at '+rcx+'px '+rcy+'px)']},{duration:1500,easing:'cubic-bezier(.77,0,.175,1)',fill:'forwards'});
      var rdone=function(){ html.classList.remove('reveal'); try{ran.cancel();}catch(x){} };
      ran.onfinish=rdone; setTimeout(rdone,2400);
    }
  }
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey) return;
    var a=e.target.closest&&e.target.closest('a[href]'); if(!a||a.closest('#menu')) return;
    if((a.target&&a.target!=='_self')||a.hasAttribute('download')) return;
    if(a.protocol!==location.protocol||a.host!==location.host||a.pathname===location.pathname) return;
    try{sessionStorage.setItem('arh-reveal',String(Date.now()));}catch(x){}
  });

  /* ---------------- the ghost (easter egg) ---------------- */
  var gh=document.getElementById('ghost');
  if(gh&&(matchMedia('(pointer:coarse)').matches||innerWidth<=760)){gh.remove();gh=null;}
  if(gh&&!RM){
    var bub=document.getElementById('ghBub'), pl1=document.getElementById('pl1'), pl2=document.getElementById('pl2');
    var hits=0, busy=false, caught=0, hideT=0, bubT=0;
    var lines=['you found me','no templates here','psst. start a project','catch me if you can','waka waka! +100 curiosity points','boo!'];
    function say(txt,ms){ bub.textContent=txt; bub.classList.add('show'); clearTimeout(bubT); bubT=setTimeout(function(){bub.classList.remove('show');},ms||1800); }
    function loop(first){
      setTimeout(function(){
        if(document.hidden||isOpen||busy||!ARH.ready||html.classList.contains('show-loader')){ loop(false); return; }
        showGhost();
      }, first?5500:(8000+Math.random()*9000));
    }
    function showGhost(){
      busy=true; hits=0;
      gh.dataset.side=Math.random()<.5?'l':'r';
      gh.style.top=(22+Math.random()*50)+'vh';
      gh.style.left='';gh.style.right='';gh.style.transform='';
      gh.classList.remove('run'); void gh.offsetWidth; gh.classList.add('peek');
      clearTimeout(hideT); hideT=setTimeout(hideGhost,4800);
    }
    function hideGhost(){
      gh.classList.remove('peek'); bub.classList.remove('show');
      setTimeout(function(){busy=false; loop(false);},900);
    }
    gh.addEventListener('mouseenter',function(){ clearTimeout(hideT); say('boo!',1300); });
    gh.addEventListener('mouseleave',function(){ clearTimeout(hideT); hideT=setTimeout(hideGhost,1800); });
    addEventListener('mousemove',function(e){
      if(!gh.classList.contains('peek')&&!gh.classList.contains('run')) return;
      var r=gh.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
      var dx=e.clientX-cx, dy=e.clientY-cy, d=Math.hypot(dx,dy)||1, k=Math.min(1,d/160);
      var ox=(dx/d)*2.4*k, oy=(dy/d)*2.6*k;
      pl1.style.transform=pl2.style.transform='translate('+ox.toFixed(2)+'px,'+oy.toFixed(2)+'px)';
    },{passive:true});
    gh.addEventListener('click',function(){
      caught++; hits++; clearTimeout(hideT);
      if(hits<2){ say('again?',1500); hideT=setTimeout(hideGhost,4200); return; }
      hits=0;
      if(window.ARH_DOODLE){ say('here, take this pen. draw!',2600); ARH_DOODLE.start(); }
      else say(lines[Math.floor(Math.random()*lines.length)],1500);
      flee();
    });
    function flee(){
      var r=gh.getBoundingClientRect(), left=gh.dataset.side==='l';
      var x0=r.left, y0=r.top, x1=left?innerWidth+30:-r.width-30, w=r.width, h=r.height;
      gh.classList.add('run'); gh.classList.remove('peek');
      gh.style.left='0px'; gh.style.right='auto'; gh.style.transform='translate3d('+x0+'px,0,0)';
      var t0=performance.now(), dur=1900, lastDot=0;
      function step(now){
        var p=Math.min(1,(now-t0)/dur), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
        var x=x0+(x1-x0)*e, y=Math.sin(p*Math.PI*4)*34-Math.sin(p*Math.PI)*50;
        gh.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
        if(now-lastDot>70&&p<.97){
          lastDot=now;
          var d=document.createElement('div'); d.className='pdot';
          d.style.left=(x+w*.45)+'px'; d.style.top=(y0+y+h*.55)+'px';
          body.appendChild(d); setTimeout(function(){d.remove();},1500);
        }
        if(p<1) requestAnimationFrame(step);
        else{
          gh.classList.remove('run'); gh.style.left='';gh.style.right='';gh.style.transform='';
          bub.classList.remove('show');
          setTimeout(function(){busy=false; loop(false);},1200);
        }
      }
      requestAnimationFrame(step);
    }
    loop(true);
  }

  /* ---------------- reveal on scroll + progress bar ---------------- */
  var items=[].slice.call(document.querySelectorAll('[data-s]'));
  if(RM||!('IntersectionObserver' in window)){ items.forEach(function(el){el.classList.add('on');}); }
  else{
    var io=new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target);} });
    },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    items.forEach(function(el,i){ el.style.transitionDelay=(i%3)*90+'ms'; io.observe(el); });
  }
  var prog=document.getElementById('prog');
  function onScroll(){
    var max=(html.scrollHeight-innerHeight)||1;
    if(prog) prog.style.transform='scaleX('+Math.max(0,Math.min(1,html.scrollTop/max))+')';
    if(ARH.onScroll) ARH.onScroll();
  }
  var tick2=false;
  addEventListener('scroll',function(){ if(!tick2){tick2=true;requestAnimationFrame(function(){tick2=false;onScroll();});} },{passive:true});
  addEventListener('resize',onScroll); onScroll();
  ARH.setReady=function(){ARH.ready=true;};
})();
