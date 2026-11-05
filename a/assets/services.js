/* ARH Design: Services. Rows mark themselves up on scroll; the compare slider is native range input. */
(function(){
  var secs=[].slice.call(document.querySelectorAll('.sx,.sx-deal'));
  var cmp=document.getElementById('cmp');
  if(cmp){var r=cmp.querySelector('input');r.addEventListener('input',function(){cmp.style.setProperty('--pos',r.value+'%');});}
  if(!secs.length) return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM||!('IntersectionObserver' in window)){secs.forEach(function(s){s.classList.add('on');});return;}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});
  },{threshold:.25,rootMargin:'0px 0px -8% 0px'});
  secs.forEach(function(s){io.observe(s);});
  setTimeout(function(){secs.forEach(function(s){s.classList.add('on');});},15000);
})();
