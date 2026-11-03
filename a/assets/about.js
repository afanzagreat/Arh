/* ARH Design: About page. Words of the belief statement light up as they scroll in. */
(function(){
  var el=document.getElementById('belief'); if(!el) return;
  var words=el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label',words.join(' '));
  el.innerHTML=words.map(function(w){return '<span class="w" aria-hidden="true">'+w+'</span>';}).join(' ');
  var spans=[].slice.call(el.querySelectorAll('.w'));
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM||!('IntersectionObserver' in window)){spans.forEach(function(s){s.classList.add('on');});return;}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});
  },{rootMargin:'0px 0px -22% 0px'});
  spans.forEach(function(s){io.observe(s);});
  setTimeout(function(){spans.forEach(function(s){s.classList.add('on');});},15000);
})();
