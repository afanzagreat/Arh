/* ARH Design: Contact page. Sends through Web3Forms (free). Falls back to the visitor's email app. */
(function(){
  var f=document.getElementById('kform'); if(!f) return;
  var st=document.getElementById('kstatus'), done=document.getElementById('kdone');
  var EMAIL='founder@arhdesign.tech';
  var plan=new URLSearchParams(location.search).get('plan');
  if(plan){
    var hid=document.createElement('input'); hid.type='hidden'; hid.name='plan'; hid.value=plan.slice(0,80); f.appendChild(hid);
    var pn=document.createElement('p'); pn.className='k-plan'; pn.appendChild(document.createTextNode('Asking about: ')); var bb=document.createElement('b'); bb.textContent=plan.slice(0,80); pn.appendChild(bb);
    var send=f.querySelector('.k-send'); f.insertBefore(pn,send);
  }
  function mailto(d){
    var body=(d.plan?'Plan: '+d.plan+'\n':'')+'Name: '+d.name+'\nBusiness: '+d.business+'\nNeed: '+(d.need||'')+'\nCurrent site: '+(d.site||'')+'\nEmail: '+d.email+'\n\n'+d.message;
    return 'mailto:'+EMAIL+'?subject='+encodeURIComponent('New project enquiry')+'&body='+encodeURIComponent(body);
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.reportValidity()) return;
    var fd=new FormData(f), d={};
    fd.forEach(function(v,k){d[k]=v;});
    if(fd.get('botcheck')) return;
    delete d.botcheck;
    f.classList.add('busy'); st.className='k-status'; st.textContent='Sending...';
    fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)})
      .then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
      .then(function(x){
        if(x.ok&&(x.j.success===true||x.j.success==='true')){
          f.hidden=true; done.hidden=false; done.focus(); window.scrollTo(0,0);
        }else throw new Error('no');
      })
      .catch(function(){
        f.classList.remove('busy'); st.className='k-status err';
        st.innerHTML='That did not go through. <a href="'+mailto(d)+'">Send it from your email app instead</a>, or write to '+EMAIL+'.';
      });
  });
})();
