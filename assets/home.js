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
      {url:'arhdesign.tech/contact',cta:true}
    ];
    var els={url:document.getElementById('dfUrl'),frame:document.getElementById('dfLiveFrame'),cta:document.getElementById('dfCta')};
    if(!els.url||!els.frame||!els.cta) return;
    var chips=[].slice.call(document.querySelectorAll('.demo-chips button')), cur=0;
    function show(i){
      cur=i; var d=D[i];
      screen.classList.remove('swap'); void screen.offsetWidth;
      screen.setAttribute('data-t',i);
      els.url.textContent=d.url;
      if(d.cta){els.frame.hidden=true;els.cta.hidden=false;}
      else{els.cta.hidden=true;els.frame.hidden=false;if(els.frame.getAttribute('src')!==d.src) els.frame.src=d.src;els.frame.title=d.title;}
      if(!RM) screen.classList.add('swap');
      chips.forEach(function(c,k){c.setAttribute('aria-pressed',k===i?'true':'false');});
    }
    chips.forEach(function(c){ c.addEventListener('click',function(){ show(+c.getAttribute('data-i')); }); });
  })();

  /* ---------- loader: numbers jumble, then lock into ARH DESIGN ---------- */
  var L=document.getElementById('loader');
  function finishLoader(){
    try{sessionStorage.setItem('arh-loader','1');}catch(e){}
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
    var start=performance.now(), lockBase=300, lockStep=55, lastLock=lockBase+(slots.length-1)*lockStep, endAt=lastLock+170;
    var lifted=false, over=false;
    var skip=document.getElementById('ldSkip'); skip.focus({preventScroll:true});
    function setProgress(p){
      bar.style.transform='scaleX('+p.toFixed(3)+')';
      pct.textContent=String(Math.round(p*100)).padStart(3,'0')+'%';
    }
    function lift(fast){
      if(lifted) return; lifted=true;
      setProgress(1); status.textContent='Ready';
      L.style.transitionDuration=fast?'.5s':'';
      L.classList.add('lift');
      revealHero(fast?.05:.15);
      setTimeout(finishLoader,fast?520:720);
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

  /* ---------- scroll-driven: template wall + how-it-works line ---------- */
  var wall=document.getElementById('wall'), hiw=document.querySelector('.hiw'), line=document.querySelector('.hiw-line');
  var rows=[].slice.call(wall.querySelectorAll('.wrow')), yours=wall.querySelector('.yours'), note=wall.querySelector('.wnote'), hint=wall.querySelector('.whint');
  function sm(a,b,x){x=(x-a)/(b-a);x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
  ARH.onScroll=function(){
    if(RM) return;
    var r=wall.getBoundingClientRect(), total=r.height-innerHeight, p=Math.max(0,Math.min(1,-r.top/total)), w=innerWidth;
    rows.forEach(function(row,i){
      var dir=(i%2)?1:-1, sp=.6+i*.11, base=((i%2)?-1:1)*w*.09*i-w*.12;
      row.style.transform='translate3d('+(base+dir*p*w*sp).toFixed(1)+'px,0,0)';
      row.style.opacity=(1-sm(.5,.66,p)*.93).toFixed(3);
    });
    var t=sm(.56,.8,p);
    yours.style.opacity=t.toFixed(3);
    yours.style.transform='translate(-50%,-50%) scale('+(.7+.3*t).toFixed(3)+') rotate('+(-4*(1-t)).toFixed(2)+'deg)';
    note.style.opacity=sm(.76,.92,p).toFixed(3);
    hint.style.opacity=(1-sm(.04,.22,p)).toFixed(3);
    if(hiw&&line){
      var hr=hiw.getBoundingClientRect();
      var lp=Math.max(0,Math.min(1,(innerHeight*.8-hr.top)/(hr.height*.9)));
      line.style.setProperty('--lp',lp.toFixed(3));
    }
  };
  ARH.onScroll();

  /* ---------- start ---------- */
  function start(){
    if(html.classList.contains('show-loader')&&!RM){ runLoader(); }
    else { revealHero(.1); }
  }
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(start);}else{start();}
  setTimeout(function(){ if(!heroDone){ html.classList.add('ready'); ARH.setReady(); } },12000);
})();
