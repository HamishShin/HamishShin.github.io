// Small DOM helpers for the portfolio
(function(){
  'use strict';
  // set current year in footer
  var yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // mobile nav toggle (if you add a button later)
  var btn = document.getElementById('nav-toggle');
  var nav = document.querySelector('header nav');
  // No longer need to track compact state or dropdown logic
  // CSS media query handles the responsive layout naturally
  
  // GSAP entrance animations (graceful if gsap isn't loaded)
  function runAnimations(){
    if(typeof window.gsap === 'undefined') return;
    var gs = window.gsap;

    try{
      // header: leave static (no entrance animation)

      // PAGE FADE-IN: hide everything except header, then fade in
      var pageRoot = document.querySelector('main');
      var pageTargets = pageRoot ? pageRoot : document.querySelectorAll('body > *:not(header)');
      // set initial hidden state for page content, then fade in
      gs.set(pageTargets, {opacity:0});
      gs.to(pageTargets, {opacity:1, duration:0.6, ease:'power2.out'});

      // hero (if present) - exaggerated entrance
      if(document.querySelector('.hero')){
        gs.from('.hero h2', {y:40, opacity:0, duration:1.0, delay:0.1, ease:'elastic.out(1,0.6)'});
        gs.from('.hero p', {y:28, opacity:0, duration:0.9, delay:0.35, ease:'power4.out'});
      }

      // project cards
      var cards = document.querySelectorAll('.projects-grid .card');
      if(cards.length){
        // stronger stagger and larger movement
        gs.from(cards, {y:36, opacity:0, duration:0.9, stagger:0.18, delay:0.45, ease:'back.out(1.7)'});
      }

      // about page elements
      if(document.querySelector('.about-article')){
        // explicitly set initial hidden states with gs.set, then animate to visible
        gs.set('.about-avatar', {scale:0.9, opacity:0});
        gs.set(['.about-title', '.about-article p', '.about-sidebox'], {y:18, opacity:0});
        var tl = gs.timeline();
        tl.to('.about-avatar', {scale:1, opacity:1, duration:1.0, ease:'elastic.out(1,0.5)'});
        tl.to('.about-title', {y:0, opacity:1, duration:0.8, ease:'back.out(1.2)'}, '-=0.6');
        tl.to('.about-article p', {y:0, opacity:1, duration:0.7, stagger:0.12, ease:'power3.out'}, '-=0.45');
        tl.to('.about-sidebox', {y:0, opacity:1, duration:0.6, ease:'power3.out'}, '-=0.6');
      }

      // contact panel
      if(document.querySelector('.contact-panel')){
        gs.from('.contact-panel', {y:28, opacity:0, duration:0.9, ease:'back.out(1.4)'});
      }
    }catch(e){
      // fail silently if animation errors occur
      console.warn('GSAP animation failed', e);
    }
  }

  // Try to run immediately; if gsap is loaded later, wait for it
  runAnimations();
  if(typeof window.gsap === 'undefined'){
    // poll briefly for gsap to load (useful if script tag later)
    var tries = 0;
    var interval = setInterval(function(){
      tries++;
      if(window.gsap){ clearInterval(interval); runAnimations(); }
      if(tries>10){ clearInterval(interval); }
    }, 200);
  }
  
  // Page transition: intercept internal link clicks, animate out content (excluding header), then navigate
  function setupPageTransitions(){
    document.addEventListener('click', function(e){
      var anchor = e.target.closest && e.target.closest('a');
      if(!anchor) return;
      var href = anchor.getAttribute('href');
      if(!href) return;
      // Ignore hashes, mailto, tel, javascript, downloads, and external/blank targets
      if(href.indexOf('#') === 0 || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return;
      if(anchor.target && anchor.target === '_blank') return;
      // Resolve URL to detect same-origin
      var targetUrl;
      try{ targetUrl = new URL(href, location.href); }catch(err){ return; }
      if(targetUrl.origin !== location.origin) return; // external
      // If it's the same page with only a hash, let default behavior
      if(targetUrl.pathname === location.pathname && targetUrl.search === location.search && targetUrl.hash) return;

      // Internal navigation: animate out then navigate
      e.preventDefault();
      var dest = targetUrl.href;

      // If GSAP isn't available, navigate immediately
      if(typeof window.gsap === 'undefined'){
        location.href = dest;
        return;
      }

      var gs = window.gsap;

      // Determine content to animate out: prefer <main>, otherwise all body children except header
      var main = document.querySelector('main');
      var targets;
      if(main){
        targets = main.querySelectorAll('*');
      }else{
        targets = document.querySelectorAll('body > *:not(header)');
      }

      // quick guard to avoid animating the header
      // disable pointer events while animating
      document.documentElement.style.pointerEvents = 'none';

      // run exit animation
      try{
        gs.to(targets, {y:24, opacity:0, stagger:0.03, duration:0.6, ease:'power2.in', onComplete:function(){ location.href = dest; }});
        // safety fallback in case navigation is blocked
        setTimeout(function(){ document.documentElement.style.pointerEvents = ''; }, 1200);
      }catch(err){
        // fallback navigation
        document.documentElement.style.pointerEvents = '';
        location.href = dest;
      }
    }, false);
  }

  setupPageTransitions();
})();
