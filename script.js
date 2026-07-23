// =====================================================
// Respect reduced-motion preference
// =====================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// =====================================================
// Set data-text for glitch heading effect
// =====================================================
document.querySelectorAll('.section h2').forEach(h => h.setAttribute('data-text', h.textContent));

// =====================================================
// Boot sequence splash
// =====================================================
const bootScreen = document.getElementById('bootScreen');
const bootLog = document.getElementById('bootLog');
const bootSkip = document.getElementById('bootSkip');

const bootLines = [
  'INITIALIZING SANKET_OS v2.6 ...',
  'CHECKING MEMORY .......... OK',
  'MOUNTING SKILLS.DLL ...... OK',
  'LOADING PROJECTS[] ....... OK',
  'LINKING EDUCATION.LOG .... OK',
  'ESTABLISHING UPLINK ...... OK',
  '> WELCOME_'
];

function finishBoot(){
  bootScreen.classList.add('hidden');
  setTimeout(() => bootScreen.remove(), 700);
}

if(prefersReducedMotion || sessionStorage.getItem('bootSeen')){
  bootScreen.remove();
} else {
  sessionStorage.setItem('bootSeen', '1');
  let lineIdx = 0;
  function nextLine(){
    if(lineIdx < bootLines.length){
      const p = document.createElement('div');
      p.textContent = bootLines[lineIdx];
      if(bootLines[lineIdx].includes('OK')) p.classList.add('ok');
      bootLog.appendChild(p);
      lineIdx++;
      setTimeout(nextLine, 260);
    } else {
      setTimeout(finishBoot, 500);
    }
  }
  setTimeout(nextLine, 300);
  bootSkip.addEventListener('click', finishBoot);
}

// =====================================================
// Custom cursor
// =====================================================
const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
if(isFinePointer && !prefersReducedMotion){
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  function ringLoop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(ringLoop);
  }
  ringLoop();
  document.querySelectorAll('a, button, .tilt-card, .chip-tag, .contact-item').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

// =====================================================
// Scroll power meter + nav active section
// =====================================================
const pmFill = document.getElementById('pmFill');
const pmPct = document.getElementById('pmPct');
function updatePowerMeter(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
  if(pmFill){ pmFill.style.height = pct + '%'; }
  if(pmPct){ pmPct.textContent = pct + '%'; }
}
window.addEventListener('scroll', updatePowerMeter, { passive:true });
updatePowerMeter();

const navLinks = document.querySelectorAll('nav a[data-section]');
const trackedSections = document.querySelectorAll('section[id]');
if('IntersectionObserver' in window){
  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        navLinks.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`nav a[data-section="${entry.target.id}"]`);
        if(match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  trackedSections.forEach(s => navIo.observe(s));
}

// =====================================================
// Panel spotlight (mouse-follow light on hover)
// =====================================================
document.querySelectorAll('.board-panel').forEach(panel => {
  panel.addEventListener('mousemove', (e) => {
    const r = panel.getBoundingClientRect();
    panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
    panel.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// =====================================================
// Mobile nav toggle
// =====================================================
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
navToggle.addEventListener('click', () => siteNav.classList.toggle('open'));
siteNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => siteNav.classList.remove('open')));

// =====================================================
// Build chip pins + power-on sequence
// =====================================================
function buildPins(container, count){
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'pin';
    container.appendChild(p);
  }
}
const chip = document.getElementById('heroChip');
const pinRows = chip.querySelectorAll('.pins');
pinRows.forEach(row => buildPins(row, row.classList.contains('pins-left') || row.classList.contains('pins-right') ? 6 : 9));

function powerOnSequence(){
  const allPins = Array.from(chip.querySelectorAll('.pin'));
  allPins.forEach((pin, idx) => {
    setTimeout(() => pin.classList.add('lit'), idx * 35);
  });
  const led = document.getElementById('powerLed');
  led.style.animationDelay = `${allPins.length * 35}ms`;
}
powerOnSequence();

// =====================================================
// Typing effect for role line
// =====================================================
const roleText = "Full Stack Web Developer & Data Analyst | CSE Student";
const roleEl = document.getElementById('typedRole');
function typeRole(){
  if(prefersReducedMotion){ roleEl.textContent = roleText; return; }
  let i = 0;
  const speed = 38;
  function step(){
    if(i <= roleText.length){
      roleEl.textContent = roleText.slice(0, i);
      i++;
      setTimeout(step, speed);
    }
  }
  step();
}
setTimeout(typeRole, 500);

// =====================================================
// 3D tilt: hero chip
// =====================================================
function attachTilt(el, strength = 10){
  if(prefersReducedMotion) return;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  });
}
attachTilt(chip, 8);
document.querySelectorAll('.tilt-card').forEach(card => attachTilt(card, 12));

// =====================================================
// Scroll reveal
// =====================================================
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && !prefersReducedMotion){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// =====================================================
// Ambient circuit-trace canvas background
// =====================================================
const canvas = document.getElementById('board-bg');
const ctx = canvas.getContext('2d');
let W, H, traces = [];

function resize(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = document.body.scrollHeight;
}
window.addEventListener('resize', resize);
resize();

// generate right-angle "trace" paths
function makeTrace(){
  const startX = Math.random() * W;
  const startY = Math.random() * H;
  const segments = 3 + Math.floor(Math.random() * 3);
  const points = [{x:startX, y:startY}];
  let cx = startX, cy = startY;
  for(let i=0;i<segments;i++){
    if(i % 2 === 0){
      cx += (Math.random() - 0.5) * 260;
    } else {
      cy += (Math.random() - 0.5) * 260;
    }
    points.push({x:cx, y:cy});
  }
  return {
    points,
    progress: Math.random(),
    speed: 0.0008 + Math.random() * 0.0012,
    color: Math.random() > 0.5 ? '61,220,132' : '201,146,43'
  };
}

const TRACE_COUNT = prefersReducedMotion ? 0 : Math.min(26, Math.floor(W / 60));
for(let i=0;i<TRACE_COUNT;i++) traces.push(makeTrace());

function totalLength(points){
  let len = 0;
  for(let i=1;i<points.length;i++){
    len += Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
  }
  return len;
}

function drawTrace(t){
  const { points } = t;
  // static faint path
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for(let i=1;i<points.length;i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.strokeStyle = `rgba(${t.color},0.08)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // moving pulse along the path
  const len = totalLength(points);
  const target = t.progress * len;
  let acc = 0;
  let px = points[0].x, py = points[0].y;
  for(let i=1;i<points.length;i++){
    const segLen = Math.hypot(points[i].x - points[i-1].x, points[i].y - points[i-1].y);
    if(acc + segLen >= target){
      const segT = (target - acc) / segLen;
      px = points[i-1].x + (points[i].x - points[i-1].x) * segT;
      py = points[i-1].y + (points[i].y - points[i-1].y) * segT;
      break;
    }
    acc += segLen;
  }
  ctx.beginPath();
  ctx.arc(px, py, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${t.color},0.9)`;
  ctx.shadowColor = `rgba(${t.color},0.9)`;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;

  t.progress += t.speed;
  if(t.progress > 1) t.progress = 0;
}

function animate(){
  ctx.clearRect(0, 0, W, H);
  traces.forEach(drawTrace);
  if(!prefersReducedMotion) requestAnimationFrame(animate);
}
if(!prefersReducedMotion){
  animate();
} else if(ctx){
  ctx.clearRect(0,0,W,H);
}
