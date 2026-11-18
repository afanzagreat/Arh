/* ARH Design: Prices.
   1) The (i) near the toggle opens a small note.
   2) Each plan's "Full details" button opens the long terms drawer.
   >>> Anything in [SQUARE BRACKETS] below is a blank you still have to fill in. <<< */
(function(){
  /* ===================== YOUR TERMS (edit here) =====================
     Anything left in [SQUARE BRACKETS] is a blank you still have to fill in. */
  var REV_DEF='A revision round means one organised list of changes submitted together.';
  var CFG={
    monthly:{
      pages:{Essential:'Up to 5 pages.',Pro:'Up to 10 pages.',Custom:'Scoped with you first and written into your quote.'},
      revisions:{Essential:'2 rounds of revisions. '+REV_DEF,Pro:'4 rounds of revisions. '+REV_DEF,Custom:'Agreed in your quote. '+REV_DEF},
      support:{Essential:'Email support for technical issues and minor website updates. Available during normal working hours, not 24/7.',
               Pro:'Priority email support, technical assistance, and minor content and website updates. Available during normal working hours, not 24/7.',
               Custom:'Priority support, defined in your quote.'},
      commitment:'No minimum commitment.',
      billing:'Billed monthly in advance.',
      cancel:'You can cancel at any time, preferably with 7 days\u2019 notice before your next billing date.',
      afterCancel:'Hosting and ongoing services included in your plan end after your current paid period. You keep your domain, your content and your business materials. You can ask for a handover of the website files.',
      hosting:'Hosting and ongoing services included in your plan end after your current paid period. Hosting, domain renewals and third-party service costs are only included if your plan explicitly says so.',
      refunds:'Payments already made for the current billing period are generally non-refundable.'
    },
    onetime:{
      pages:{Essential:'[PAGE COUNT FOR ONE-TIME ESSENTIAL]',Pro:'[PAGE COUNT FOR ONE-TIME PRO]',Custom:'Scoped with you first and written into your quote.'},
      revisions:'The number of revision rounds is agreed in your project quotation before work begins. '+REV_DEF+' Additional changes outside the agreed scope may cost extra.',
      support:'After delivery, the 7-day review period covers bugs and minor changes within the agreed scope. Ongoing support and renewal terms are explained before you commit.',
      pay:'50% deposit before development begins. The remaining 50% is due after completion and your approval, before final handover.',
      handover:'Once the final payment is received, you get: the completed website, the agreed website source files, the relevant access and deployment information, and ownership of the completed custom website work (subject to third-party licences and dependencies).',
      hosting:'Hosting arrangements and renewal costs are agreed before the project begins. Hosting is not automatically included in the one-time project price.'
    },
    domainOwner:'Your domain is registered in your name and stays under your ownership.',
    review:'After delivery, you have 7 days to review the website and report bugs or request minor changes within the agreed project scope. This period does not allow unlimited revisions, major scope changes, or automatic refunds.',
    general:[
      'You own your domain and the business content you provide.',
      'Third-party services, paid plugins, software licences, domain registration and hosting are separate costs unless explicitly included.',
      'Any additional work outside the agreed scope is discussed and quoted before we proceed.',
      'Project deliverables and ownership are transferred after all agreed payments have been completed.'
    ]
  };
  var PRICE={Essential:{monthly:'$35 USD / month','one-time':'$129 USD, once'},Pro:{monthly:'$49 USD / month','one-time':'$269 USD, once'},Custom:{monthly:'Quoted after we scope it','one-time':'Quoted after we scope it'}};
  /* =============================================================== */

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function val(s){ return /\[[^\]]+\]/.test(s)? esc(s).replace(/\[([^\]]+)\]/g,'<span class="ph">[$1]</span>') : esc(s); }
  function row(k,v){ return '<div class="t-row"><dt>'+esc(k)+'</dt><dd>'+v+'</dd></div>'; }
  function sec(n,title,rows,lead){ return '<section class="t-sec"><h3><span>'+n+'</span> '+esc(title)+'</h3>'+(lead?'<p class="t-lead">'+lead+'</p>':'')+'<dl>'+rows+'</dl></section>'; }

  function build(plan,mode,feats){
    var monthly=mode==='monthly', n=0, out='', M=CFG.monthly, O=CFG.onetime;
    var f=feats.map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    out+=sec(++n,'What is included',
      row('Price',esc(PRICE[plan][mode]))+
      row('Pages',val(monthly?M.pages[plan]:O.pages[plan]))+
      row('Features','<ul class="t-ul">'+f+'</ul>')+
      row('Revisions',val(monthly?M.revisions[plan]:O.revisions))+
      row('Support',val(monthly?M.support[plan]:O.support)));
    if(monthly){
      out+=sec(++n,'Monthly commitment',
        row('Price','Billed every month at '+esc(PRICE[plan][mode].replace(' / month',''))+'.')+
        row('Minimum term',val(M.commitment))+
        row('Billing',val(M.billing))+
        row('Refunds',val(M.refunds)),
        'The monthly plan is optional. You can choose a one-time build instead.');
      out+=sec(++n,'Cancelling',
        row('How',val(M.cancel))+
        row('After you cancel',val(M.afterCancel)));
    }else{
      out+=sec(++n,'Paying once',
        row('Price','One-time build: '+esc(PRICE[plan][mode])+'.')+
        row('Schedule',val(O.pay)),
        'A one-time build has no subscription to cancel.');
      out+=sec(++n,'Handover',row('You receive',val(O.handover)));
    }
    out+=sec(++n,'Domain and hosting',
      row('Domain',val(CFG.domainOwner))+
      row('Hosting',val(monthly?M.hosting:O.hosting))+
      row('Separate costs','Third-party services, paid plugins, software licences, domain registration and hosting are separate costs unless explicitly included.')+
      row('Premium domains','Quoted separately.'));
    out+=sec(++n,'The 7-day review period',
      row('What it means',val(CFG.review)));
    out+=sec(++n,'Time',
      row('Replies','We reply within one business day.')+
      row('Build time',plan==='Custom'?'Agreed in your quote.':'Most sites launch in 2 to 4 weeks after content and design direction are approved.'));
    out+=sec(++n,'Quoted separately',
      row('Always separate',monthly?'Major design changes, additional pages, new features and premium domains.':'Additional work outside the agreed scope, and premium domains.')+
      (plan==='Custom'?row('Custom plan','Media and campaign work is scoped first, then quoted clearly.'):''));
    out+=sec(++n,'General conditions','<div class="t-row"><dt>For every plan</dt><dd><ul class="t-ul">'+CFG.general.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></dd></div>');
    return out;
  }

  /* ---------- the long details drawer ---------- */
  var dlg=document.getElementById('terms');
  if(dlg){
    var body=document.getElementById('termsBody'), title=document.getElementById('termsTitle'), kick=document.getElementById('termsKicker'), pick=document.getElementById('termsPick'), last=null;
    function openFor(btn){
      var plan=btn.getAttribute('data-plan'), mode=btn.getAttribute('data-mode'), art=btn.closest('.plan'); if(mode==='one-time') mode='one-time';
      var feats=[].slice.call(art.querySelectorAll('.plan-list li')).map(function(li){return li.textContent.trim();});
      title.textContent=plan+' plan'; kick.textContent=(mode==='monthly'?'Monthly':'One-time')+' · full details and rules';
      body.innerHTML=build(plan,mode,feats); body.scrollTop=0;
      var a=art.querySelector('.btn'); pick.setAttribute('href',a?a.getAttribute('href'):'../contact/index.html'); pick.textContent=a?a.textContent.trim():'Start a project';
      last=btn;
      if(typeof dlg.showModal==='function') dlg.showModal(); else dlg.setAttribute('open','');
      document.documentElement.classList.add('t-lock');
    }
    function closeIt(){ if(dlg.close) dlg.close(); else dlg.removeAttribute('open'); }
    dlg.addEventListener('close',function(){ document.documentElement.classList.remove('t-lock'); if(last) last.focus(); });
    document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.det'); if(b) openFor(b); });
    document.getElementById('termsClose').addEventListener('click',closeIt);
    dlg.addEventListener('click',function(e){ if(e.target===dlg) closeIt(); });
  }

  /* ---------- the small (i) near the toggle ---------- */
  var wrap=document.querySelector('.p-info'), btn=document.getElementById('infoBtn'), tip=document.getElementById('infoTip');
  if(wrap&&btn&&tip){
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
  }
})();
