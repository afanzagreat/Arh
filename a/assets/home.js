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
      .to('#arrow',{strokeDashoffset:0,duration:.8,ease:'power2.inOut'},'-=.2')
      .add(function(){startTyping(false);},'-=.5');
  }

  /* ---------- typing line ---------- */
  var words=['bakery','law firm','gym','florist','startup','caf\u00e9'];
  function startTyping(staticMode){
    var ty=document.getElementById('ty'), caret=document.getElementById('caret');
    if(staticMode){ ty.textContent='your business'; return; }
    caret.hidden=false; ty.textContent='';
    var wi=0,ci=0,del=false;
    function tick(){
      var w=words[wi];
      if(!del){
        ci++; ty.textContent=w.slice(0,ci);
        if(ci===w.length){del=true; return setTimeout(tick,950);}
        return setTimeout(tick,75);
      }else{
        ci--; ty.textContent=w.slice(0,ci);
        if(ci===0){del=false; wi++;
          if(wi===words.length){ setTimeout(finalize,250); return; }
          return setTimeout(tick,200);}
        return setTimeout(tick,38);
      }
    }
    function finalize(){
      var full='ARH makes it yours.', k=0;
      ty.parentNode.querySelectorAll('.br').forEach(function(b){b.style.display='none';});
      ty.textContent='';
      (function t(){ k++; ty.textContent=full.slice(0,k); if(k<full.length) setTimeout(t,55); else setTimeout(function(){caret.hidden=true;},1200); })();
    }
    tick();
  }

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
    var start=performance.now(), lockBase=620, lockStep=175, lastLock=lockBase+(slots.length-1)*lockStep, endAt=lastLock+170;
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
      setTimeout(finishLoader,fast?520:1000);
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
      if(t>endAt+420){ lift(false); return; }
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
