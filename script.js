// =====================================================
// Respect reduced-motion preference
// =====================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
