/* ===================================================================
   ARH Design: home page behaviour
   =================================================================== */
(function(){
  var html=document.documentElement, ARH=window.ARH;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG=!!window.gsap;
  var heroDone=false;

  /* ---------- hero: headline is visible at once; marker, text and arrow follow ---------- */
  function revealHero(delay){
    if(heroDone) return; heroDone=true;
    ARH.setReady();
    if(RM||!hasG){ html.classList.add('ready'); startTyping(true); return; }
    var tl=gsap.timeline({delay:delay||0,defaults:{ease:'power4.out'}});
    tl.to('.mark',{'--mk':1,duration:.6,ease:'power3.inOut'})
      .fromTo('[data-r]',{opacity:0,y:16},{opacity:1,y:0,duration:.55,stagger:.07,clearProps:'transform'},'-=.35')
      .add(function(){startTyping(false);},'-=.5');
  }

  /* ---------- audience word: readable at once, then it cycles ---------- */
  var words=['bakeries','law firms','gyms','florists','startups','caf\u00e9s','salons','clinics','restaurants'];
  function startTyping(staticMode){
    var ty=document.getElementById('ty'), caret=document.getElementById('caret');
    if(!ty||staticMode) return;
    var wi=0;
    function swap(){
      var next=words[wi++%words.length], cur=ty.textContent, ci=cur.length;
      caret.hidden=false;
      (function erase(){ if(ci>0){ ci--; ty.textContent=cur.slice(0,ci); setTimeout(erase,26);} else type(0); })();
      function type(k){
        if(k<=next.length){ ty.textContent=next.slice(0,k); setTimeout(function(){type(k+1);},52); }
        else{ caret.hidden=true; setTimeout(swap,2200); }
      }
    }
    setTimeout(swap,2600);
  }


  /* ---------- live demo: actual scrollable websites, plus a contact CTA ---------- */
  (function initDemo(){
    var screen=document.getElementById('dfScreen'); if(!screen) return;
    var D=[
      {url:'shabibi-juice.store',src:'https://www.shabibi-juice.store/',title:'Live website preview: Shabibi Juice'},
      {url:'arhdesign.tech/a/',src:'https://arhdesign.tech/a/',title:'Live website preview: former ARH homepage'},
      {url:'arhdesign.tech/contact',cta:true,title:'YOUR WEBSITE contact preview'}
    ];
    var els={url:document.getElementById('dfUrl'),frame:document.getElementById('dfLiveFrame'),cta:document.getElementById('dfCta'),box:document.getElementById('dfFrame'),expand:document.getElementById('dfExpand'),close:document.getElementById('dfClose'),backdrop:document.getElementById('dfBackdrop')};
    if(!els.url||!els.frame||!els.cta) return;
    var demo=els.box&&els.box.closest('.demo');
    var chips=[].slice.call(document.querySelectorAll('.demo-chips button')),cur=0;
    var canExpand=els.box&&els.expand&&els.close&&els.backdrop;
    var inertNodes=[],previousOverflow='',rotationTimer=null,nextAt=Date.now()+5000,pauseUntil=0,hoverPaused=false,touchViewing=false;
    var touchDevice=matchMedia('(hover: none) and (pointer: coarse)').matches;
    function clearRotation(){if(rotationTimer){clearTimeout(rotationTimer);rotationTimer=null;}}
    function scheduleRotation(){
      clearRotation();
      if(document.hidden||hoverPaused||touchViewing||html.classList.contains('preview-open')||document.activeElement===els.frame) return;
      var wait=Math.max(0,nextAt-Date.now(),pauseUntil-Date.now());
      rotationTimer=setTimeout(function(){rotationTimer=null;if(document.hidden||hoverPaused||html.classList.contains('preview-open')){scheduleRotation();return;}show((cur+1)%D.length);},wait);
    }
    function pauseFor(ms){var now=Date.now();nextAt=Math.max(nextAt,now+5000);pauseUntil=Math.max(pauseUntil,now+ms);scheduleRotation();}
    function expand(){
      if(!canExpand||D[cur].cta||html.classList.contains('preview-open')) return;
      var hero=demo.closest('.hero'),main=hero.parentElement;
      clearRotation();inertNodes=[];
      function makeInert(el){inertNodes.push({el:el,inert:el.inert});el.inert=true;}
      [].slice.call(document.body.children).forEach(function(el){if(el!==main) makeInert(el);});
      [].slice.call(main.children).forEach(function(el){if(el!==hero) makeInert(el);});
      [].slice.call(hero.children).forEach(function(el){if(el!==demo) makeInert(el);});
      [].slice.call(demo.children).forEach(function(el){if(el!==els.box&&el!==els.backdrop) makeInert(el);});
      previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
      els.backdrop.hidden=false;els.expand.hidden=true;els.close.hidden=false;
      els.box.setAttribute('role','dialog');els.box.setAttribute('aria-modal','true');els.box.setAttribute('aria-label',D[cur].title);
      html.classList.add('preview-open');els.close.focus({preventScroll:true});
    }
    function close(){
      if(!canExpand||!html.classList.contains('preview-open')) return;
      html.classList.remove('preview-open');
      els.box.removeAttribute('role');els.box.removeAttribute('aria-modal');els.box.removeAttribute('aria-label');
      els.backdrop.hidden=true;els.close.hidden=true;els.expand.hidden=!!D[cur].cta;
      document.body.style.overflow=previousOverflow;
      inertNodes.forEach(function(item){item.el.inert=item.inert;});inertNodes=[];
      if(!els.expand.hidden) els.expand.focus({preventScroll:true});
      nextAt=Date.now()+5000;scheduleRotation();
    }
    if(canExpand){
      els.expand.hidden=false;
      els.expand.addEventListener('click',expand);els.close.addEventListener('click',close);els.backdrop.addEventListener('click',close);
      document.addEventListener('keydown',function(e){
        if(!html.classList.contains('preview-open')) return;
        if(e.key==='Escape'){e.preventDefault();close();}
        else if(e.key==='Tab'&&e.shiftKey&&document.activeElement===els.close){e.preventDefault();els.frame.focus();}
      });
    }
    function show(i){
      cur=i;var d=D[i];
      screen.classList.remove('swap');void screen.offsetWidth;
      screen.setAttribute('data-t',i);
      els.url.textContent=d.url;
      if(d.cta){els.frame.hidden=true;els.cta.hidden=false;}
      else{els.cta.hidden=true;els.frame.hidden=false;if(els.frame.getAttribute('src')!==d.src) els.frame.src=d.src;els.frame.title=d.title;}
      if(canExpand) els.expand.hidden=!!d.cta;
      if(!RM) screen.classList.add('swap');
      chips.forEach(function(c,k){c.setAttribute('aria-pressed',k===i?'true':'false');});
      nextAt=Date.now()+5000;scheduleRotation();
    }
    chips.forEach(function(c){c.addEventListener('click',function(){show(+c.getAttribute('data-i'));});});
    if(demo){
      demo.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'||e.pointerType==='pen'){hoverPaused=true;scheduleRotation();}});
      demo.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse'||e.pointerType==='pen'){hoverPaused=false;nextAt=Date.now()+5000;scheduleRotation();}});
      demo.addEventListener('pointerdown',function(){pauseFor(2500);},{passive:true});
      demo.addEventListener('pointerup',function(){pauseFor(2500);},{passive:true});
      demo.addEventListener('touchstart',function(){pauseFor(2500);},{passive:true});
      demo.addEventListener('touchend',function(){pauseFor(2500);},{passive:true});
      demo.addEventListener('wheel',function(){pauseFor(2500);},{passive:true});
    }
    window.addEventListener('scroll',function(){
      if(touchDevice){var r=screen.getBoundingClientRect();touchViewing=r.bottom>0&&r.top<window.innerHeight;}
      pauseFor(2500);
    },{passive:true});
    document.addEventListener('visibilitychange',function(){if(document.hidden) clearRotation();else{nextAt=Date.now()+5000;scheduleRotation();}});
    els.frame.addEventListener('focus',clearRotation);
    els.frame.addEventListener('blur',function(){nextAt=Date.now()+5000;scheduleRotation();});
    els.frame.addEventListener('load',function(){try{els.frame.contentWindow.addEventListener('scroll',function(){pauseFor(2500);},{passive:true});}catch(e){}});
    scheduleRotation();
  })();

  /* ---------- loader: numbers jumble, then lock into ARH DESIGN ---------- */
  var L=document.getElementById('loader');
  function finishLoader(){
    html.classList.remove('show-loader');
  }
  function runLoader(){
    var W=document.getElementById('ldWord'), word='ARH DESIGN', digits='0123456789';
    var bar=document.getElementById('ldBar'), pct=document.getElementById('ldPct'), seq=document.getElementById('ldSeq'), status=document.getElementById('ldStatus');
    function rnd(){return digits[Math.floor(Math.random()*digits.length)];}
    var slots=[], seqEls=[];
    word.split('').forEach(function(ch){
      if(ch===' '){var g=document.createElement('span');g.className='gap';W.appendChild(g);return;}
      var s=document.createElement('span');s.className='slot';
      s.innerHTML='<span class="fin">'+ch+'</span><span class="cur">'+rnd()+'</span>';
      W.appendChild(s);
      var q=document.createElement('span'); q.textContent=ch; seq.appendChild(q); seqEls.push(q);
      slots.push({el:s,cur:s.querySelector('.cur'),ch:ch,locked:false,last:0,q:q});
    });
    /* squeeze digits so every scrambling slot is exactly as wide as the letter it will become */
    var probe=document.createElement('span');probe.className='cur';probe.style.cssText='position:absolute;visibility:hidden;left:0;top:0;transform:none';probe.textContent='0';W.appendChild(probe);
    var dw=probe.getBoundingClientRect().width||1; W.removeChild(probe);
    slots.forEach(function(s){var w=s.el.getBoundingClientRect().width; s.cur.style.setProperty('--sx',Math.min(1,w/dw).toFixed(3));});
    var start=performance.now(), lockBase=240, lockStep=45, lastLock=lockBase+(slots.length-1)*lockStep, endAt=lastLock+110;
    var lifted=false, over=false;
    var skip=document.getElementById('ldSkip'); skip.focus({preventScroll:true});
    function setProgress(p){
      bar.style.transform='scaleX('+p.toFixed(3)+')';
      pct.textContent=String(Math.round(p*100)).padStart(3,'0')+'%';
    }
    function lift(fast){
      if(lifted) return; lifted=true;
      setProgress(1); status.textContent='Ready';
      L.style.transitionDuration=fast?'.5s':'.54s';
      L.classList.add('lift');
      revealHero(fast?.05:.15);
      setTimeout(finishLoader,fast?520:560);
    }
    skip.addEventListener('click',function(){over=true;lift(true);});
    function frame(now){
      if(lifted||over) return;
      var t=now-start;
      slots.forEach(function(s,i){
        if(s.locked) return;
        var lockAt=lockBase+i*lockStep;
        if(t>=lockAt){
          s.locked=true; s.cur.textContent=s.ch; s.cur.style.setProperty('--sx','1');
          s.el.classList.add('lock'); s.q.classList.add('on'); return;
        }
        /* numbers flicker fast at first and slow down as their moment to lock approaches */
        var iv=40+Math.max(0,1-(lockAt-t)/800)*95;
        if(now-s.last>iv){s.last=now;s.cur.textContent=rnd();}
      });
      var p=Math.min(1,t/endAt); setProgress(1-Math.pow(1-p,1.6));
      if(t>endAt+100){ lift(false); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- visitor's own local time (a studio without a zip code) ---------- */
  var lt=document.getElementById('localtime');
  try{
    var f=new Intl.DateTimeFormat([], {hour:'2-digit',minute:'2-digit'});
    var upd=function(){ lt.textContent="It's "+f.format(new Date())+" where you are. Plenty of time to start a project."; };
    upd(); setInterval(upd,20000);
  }catch(e){}

  /* ---------- scroll-driven: how-it-works line ---------- */
  var hiw=document.querySelector('.hiw'), line=document.querySelector('.hiw-line');
  ARH.onScroll=function(){
    if(RM) return;
    if(hiw&&line){
      var hr=hiw.getBoundingClientRect();
      var lp=Math.max(0,Math.min(1,(innerHeight*.8-hr.top)/(hr.height*.9)));
      line.style.setProperty('--lp',lp.toFixed(3));
    }
  };
  ARH.onScroll();

  /* ---------- start ---------- */
  var started=false;
  function start(){
    if(started) return;started=true;
    if(html.classList.contains('show-loader')&&!RM){ runLoader(); }
    else { revealHero(.1); }
  }
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(start,start);setTimeout(start,250);}else{start();}
  setTimeout(function(){ if(!heroDone){ html.classList.add('ready'); ARH.setReady(); } },12000);
})();
