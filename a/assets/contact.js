/* ARH Design: Contact page. Sends through FormSubmit (free). Falls back to the visitor's email app. */
(function(){
  var f=document.getElementById('kform'); if(!f) return;
  var st=document.getElementById('kstatus'), done=document.getElementById('kdone');
  var EMAIL='founder@arhdesign.tech';
  function mailto(d){
    var body='Name: '+d.name+'\nBusiness: '+d.business+'\nNeed: '+(d.need||'')+'\nCurrent site: '+(d.site||'')+'\nEmail: '+d.email+'\n\n'+d.message;
    return 'mailto:'+EMAIL+'?subject='+encodeURIComponent('New project enquiry')+'&body='+encodeURIComponent(body);
  }
  f.addEventListener('submit',function(e){
    e.preventDefault();
    if(!f.reportValidity()) return;
    var fd=new FormData(f), d={};
    fd.forEach(function(v,k){d[k]=v;});
    if(d._honey) return;
    f.classList.add('busy'); st.className='k-status'; st.textContent='Sending...';
    fetch('https://formsubmit.co/ajax/'+EMAIL,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(d)})
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
