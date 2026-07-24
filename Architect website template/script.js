document.getElementById('year').textContent = new Date().getFullYear();

/* ============================================================
   PRELOADER
   ============================================================ */
window.addEventListener('load', () => {
  gsap.to('#loadbarFill', {width:'100%', duration:1.1, ease:'power2.inOut'});
  gsap.to('#preloader', {
    opacity:0, duration:.9, delay:1.15, ease:'power2.inOut', pointerEvents:'none',
    onComplete: () => { document.getElementById('preloader').style.display='none'; playHeroIntro(); }
  });
  setTimeout(()=> document.getElementById('waFloat').classList.add('show'), 1800);
});

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0,my=0, cx=0, cy=0, rx=0, ry=0;
window.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; }, {passive:true});
function cursorLoop(){
  cx += (mx-cx)*0.5; cy += (my-cy)*0.5;
  rx += (mx-rx)*0.15; ry += (my-ry)*0.15;
  cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
  ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
  requestAnimationFrame(cursorLoop);
}
cursorLoop();
document.querySelectorAll('a,button,.mason-item,.ba-handle,.wa-float').forEach(el=>{
  el.addEventListener('mouseenter', ()=>{ ring.classList.add('big'); });
  el.addEventListener('mouseleave', ()=>{ ring.classList.remove('big'); });
});

/* ============================================================
   LENIS SMOOTH SCROLL
   ============================================================ */
let lenis;
if (window.Lenis) {
  lenis = new Lenis({ duration:1.0, easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true, wheelMultiplier:1 });
  lenis.on('scroll', ScrollTrigger.update);
  // Drive Lenis from GSAP's single ticker only — running a second requestAnimationFrame
  // loop alongside this double-ticks the scroll and is what was causing the choppiness.
  gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
  gsap.ticker.lagSmoothing(0);
}

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize:true });

/* ============================================================
   HEADER STATE
   ============================================================ */
const header = document.getElementById('siteHeader');
ScrollTrigger.create({ start:80, end:99999, onUpdate:(self)=>{ header.classList.toggle('scrolled', self.scroll()>80); } });

/* ============================================================
   HERO INTRO TIMELINE
   ============================================================ */
function playHeroIntro(){
  const tl = gsap.timeline({defaults:{ease:'power4.out'}});
  tl.to('.hero-kicker span', {y:'0%', duration:1, ease:'power3.out'})
    .to('.hero-headline .line span', {y:'0%', duration:1.2, stagger:0.12}, '-=0.7')
    .to('.hero-sub', {opacity:1, y:0, duration:1}, '-=0.6')
    .to('.hero-ctas', {opacity:1, y:0, duration:1}, '-=0.7')
    .to('.hero-scroll', {opacity:1, duration:1}, '-=0.6')
    .to('#hero-canvas', {opacity:1, duration:1.4}, '-=1.4');
}

/* ============================================================
   THREE.JS HERO PARTICLES + WIREFRAME ORNAMENT
   ============================================================ */
(function initHeroScene(){
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 100);
  camera.position.set(0,0,9);

  // Floating gold particles
  const count = 260;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    positions[i*3] = (Math.random()-0.5)*18;
    positions[i*3+1] = (Math.random()-0.5)*10;
    positions[i*3+2] = (Math.random()-0.5)*10;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({color:0xc9a876, size:0.028, transparent:true, opacity:0.75});
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mouseX=0, mouseY=0;
  window.addEventListener('mousemove', (e)=>{
    mouseX = (e.clientX/window.innerWidth - 0.5);
    mouseY = (e.clientY/window.innerHeight - 0.5);
  });

  function animate(){
    requestAnimationFrame(animate);
    points.rotation.y += 0.0009;
    points.rotation.x += 0.0002;
    camera.position.x += (mouseX*1.1 - camera.position.x)*0.02;
    camera.position.y += (-mouseY*0.7 - camera.position.y)*0.02;
    camera.lookAt(0,0,0);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================
   SCROLL REVEALS
   ============================================================ */
document.querySelectorAll('.reveal').forEach((el)=>{
  gsap.to(el, {
    opacity:1, y:0, duration:1.1, ease:'power3.out',
    scrollTrigger:{ trigger:el, start:'top 85%' }
  });
});

/* ============================================================
   BLUEPRINT SPINE
   ============================================================ */
(function initSpine(){
  if(window.innerWidth < 900) return;
  const spineFill = document.getElementById('spineFill');
  const sections = ['hero','rooms','stats','portfolio','services','process','testimonials','contact'];
  const labels = ['Home','Rooms','Numbers','Portfolio','Services','Process','Reviews','Contact'];
  const spineEl = document.getElementById('spine');
  sections.forEach((id,i)=>{
    const node = document.createElement('div'); node.className='spine-node'; node.dataset.id=id;
    const label = document.createElement('div'); label.className='spine-label'; label.textContent=labels[i];
    document.body.appendChild(node); document.body.appendChild(label);
    function place(){
      const target = document.getElementById(id);
      if(!target) return;
      const r = target.getBoundingClientRect();
      const y = r.top + Math.min(140, r.height*0.08);
      node.style.top = y+'px'; label.style.top=y+'px';
    }
    place();
    window.addEventListener('resize', place);
    ScrollTrigger.create({ trigger:'#'+id, start:'top 60%', end:'bottom 40%',
      onToggle:(self)=>{ node.classList.toggle('active', self.isActive); }
    });
    ScrollTrigger.addEventListener('refresh', place);
  });
  ScrollTrigger.create({
    trigger:document.body, start:'top top', end:'bottom bottom',
    onUpdate:(self)=>{ spineFill.setAttribute('y2', (self.progress*100)+'%'); }
  });
})();

/* ============================================================
   ROOM EXPERIENCE — AUTO-PLAYING SLIDESHOW
   ============================================================ */
(function initRooms(){
  const wrap = document.getElementById('rooms-pin');
  const panels = Array.from(document.querySelectorAll('.room-panel'));
  const dots = document.querySelectorAll('#roomDots i');
  const progressLabel = document.getElementById('roomProgress');
  const nextBtn = document.getElementById('roomNextBtn');
  const total = panels.length;
  const SLIDE_DURATION = 4500; // ms between auto-advances
  let current = 0, timer = null;

  function show(idx){
    current = (idx + total) % total;
    panels.forEach((p,i)=> p.classList.toggle('active', i===current));
    dots.forEach((d,i)=> d.classList.toggle('active', i===current));
    progressLabel.textContent = String(current+1).padStart(2,'0')+' / '+String(total).padStart(2,'0');
  }

  function next(){ show(current+1); }

  function startAutoplay(){
    stopAutoplay();
    timer = setInterval(next, SLIDE_DURATION);
  }
  function stopAutoplay(){ if(timer) clearInterval(timer); }
  function restartAutoplay(){ startAutoplay(); }

  dots.forEach((d,i)=> d.addEventListener('click', ()=>{ show(i); restartAutoplay(); }));
  nextBtn.addEventListener('click', ()=>{ next(); restartAutoplay(); });

  // Pause while the user is interacting with this section, resume on leave —
  // this section no longer responds to the mouse scroll wheel at all.
  wrap.addEventListener('mouseenter', stopAutoplay);
  wrap.addEventListener('mouseleave', startAutoplay);

  show(0);
  startAutoplay();
})();

/* ============================================================
   STAT COUNTERS
   ============================================================ */
document.querySelectorAll('.counter').forEach(el=>{
  const target = parseFloat(el.dataset.target);
  ScrollTrigger.create({
    trigger:el, start:'top 90%', once:true,
    onEnter:()=>{
      let obj = {val:0};
      gsap.to(obj, {val:target, duration:1.8, ease:'power2.out',
        onUpdate:()=>{ el.textContent = target%1===0 ? Math.floor(obj.val) : obj.val.toFixed(1); }
      });
    }
  });
});

/* ============================================================
   PROCESS TIMELINE FILL
   ============================================================ */
(function initTimeline(){
  const steps = document.querySelectorAll('.tl-step');
  const fill = document.getElementById('tlFill');
  ScrollTrigger.create({
    trigger:'#tlRow', start:'top 75%', end:'bottom 60%', scrub:0.5,
    onUpdate:(self)=>{
      fill.style.width = (self.progress*100)+'%';
      const active = Math.floor(self.progress*steps.length);
      steps.forEach((s,i)=> s.classList.toggle('active', i<=active));
    }
  });
})();

/* ============================================================
   PORTFOLIO LIGHTBOX
   ============================================================ */
const lightbox = document.getElementById('lightbox');
document.querySelectorAll('.mason-item').forEach(item=>{
  item.addEventListener('click', ()=>{
    document.getElementById('lbTitle').textContent = item.dataset.title;
    document.getElementById('lbCat').textContent = item.dataset.cat;
    const plate = item.querySelector('.plate');
    const panel = document.getElementById('lightboxPanel');
    panel.style.background = getComputedStyle(plate).backgroundImage;
    panel.style.backgroundSize = 'cover';
    lightbox.classList.add('open');
  });
});
document.getElementById('lightboxClose').addEventListener('click', ()=> lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) lightbox.classList.remove('open'); });

/* ============================================================
   TESTIMONIALS CAROUSEL
   ============================================================ */
(function initTestimonials(){
  const track = document.getElementById('tstTrack');
  const cards = track.children;
  let index = 0;
  function cardWidth(){ return cards[0].getBoundingClientRect().width + 24; }
  function update(){ gsap.to(track, {x: -index*cardWidth(), duration:0.7, ease:'power3.out'}); }
  document.getElementById('tstNext').addEventListener('click', ()=>{ index = Math.min(cards.length-1, index+1); update(); });
  document.getElementById('tstPrev').addEventListener('click', ()=>{ index = Math.max(0, index-1); update(); });
  window.addEventListener('resize', update);
})();

/* ============================================================
   MASONRY PARALLAX ON HOVER (tilt)
   ============================================================ */
document.querySelectorAll('.mason-item').forEach(item=>{
  const plate = item.querySelector('.plate');
  let ticking=false, lastEvt=null;
  item.addEventListener('mousemove', (e)=>{
    lastEvt = e;
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{
      const r = item.getBoundingClientRect();
      const px = (lastEvt.clientX - r.left)/r.width - 0.5;
      const py = (lastEvt.clientY - r.top)/r.height - 0.5;
      gsap.to(plate, {rotateX: py*-4, rotateY: px*4, transformPerspective:600, duration:0.5, overwrite:'auto'});
      ticking=false;
    });
  }, {passive:true});
  item.addEventListener('mouseleave', ()=>{
    gsap.to(plate, {rotateX:0, rotateY:0, duration:0.6, overwrite:'auto'});
  });
});
