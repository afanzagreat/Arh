/* ARH Design: Services page. Rows get marked up as they scroll into view. */
(function(){
  var rows=[].slice.call(document.querySelectorAll('.sv'));
  if(!rows.length) return;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(RM||!('IntersectionObserver' in window)){rows.forEach(function(r){r.classList.add('on');});return;}
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target);}});
  },{threshold:.35});
  rows.forEach(function(r){io.observe(r);});
  setTimeout(function(){rows.forEach(function(r){r.classList.add('on');});},12000); /* safety net */
})();
