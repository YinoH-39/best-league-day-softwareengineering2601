const SLIDES = [
  { src: 'images/7.jpg', caption: '博物馆门前合影' },
  { src: 'images/6.jpg', caption: '参观展厅' },
  { src: 'images/5.jpg', caption: '参观校史长廊' },
  { src: 'images/4.jpg', caption: '观看校歌乐谱展' },
  { src: 'images/3.jpg', caption: '全体成员合影' },
  { src: 'images/2.jpg', caption: '观看历史照片展' },
  { src: 'images/1.jpg', caption: '学习校园文化展' },
];

const AUTOPLAY_MS = 4500;   
const DRAG_RATIO  = 0.12;

const track    = document.getElementById('track');
const viewport = document.getElementById('viewport');
const dotsBox  = document.getElementById('dots');
const btnPrev  = document.querySelector('.nav-prev');
const btnNext  = document.querySelector('.nav-next');

const n = SLIDES.length;
if (n === 0) {
  viewport.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#b01f24">images 文件夹里还没有图片</div>';
  throw new Error('SLIDES 为空');
}

const items = [SLIDES[n - 1], ...SLIDES, SLIDES[0]];

items.forEach((item) => {
  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.innerHTML = `
    <figure>
      <div class="img-wrap">
        <img src="${item.src}" alt="${item.caption || '团日活动图片'}" draggable="false" />
      </div>
      <figcaption>${item.caption || ''}</figcaption>
    </figure>`;
  track.appendChild(slide);
});

SLIDES.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `第 ${i + 1} 张`);
  dot.addEventListener('click', () => goTo(i + 1));
  dotsBox.appendChild(dot);
});
const dots = [...dotsBox.children];

let index = 1;          
let timer = null;
let dragging = false;
let startX = 0, deltaX = 0, width = 0;

function setTransform(animate = true) {
  track.style.transition = animate ? '' : 'none';
  track.style.transform = `translateX(${-index * 100}%)`;
  if (!animate) {
    void track.offsetHeight;      
    track.style.transition = '';
  }
}

function currentReal() {
  return (index - 1 + n) % n;
}

function syncDots() {
  dots.forEach((d, i) => d.classList.toggle('active', i === currentReal()));
}

function goTo(i, animate = true) {
  index = i;
  setTransform(animate);
  syncDots();
}

function next() { goTo(index + 1); }
function prev() { goTo(index - 1); }

track.addEventListener('transitionend', () => {
  if (index === n + 1) goTo(1, false);
  else if (index === 0) goTo(n, false);
});

function startAuto() {
  if (!AUTOPLAY_MS || n < 2) return;
  stopAuto();
  timer = setInterval(next, AUTOPLAY_MS);
}
function stopAuto() { if (timer) { clearInterval(timer); timer = null; } }

['mouseenter', 'focusin'].forEach(e => viewport.addEventListener(e, stopAuto));
['mouseleave', 'focusout'].forEach(e => viewport.addEventListener(e, startAuto));
document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

viewport.addEventListener('pointerdown', (e) => {
  dragging = true;
  startX = e.clientX;
  deltaX = 0;
  width = viewport.clientWidth;
  track.classList.add('dragging');
  stopAuto();
  viewport.setPointerCapture?.(e.pointerId);
});

viewport.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  deltaX = e.clientX - startX;
  track.style.transform = `translateX(calc(${-index * 100}% + ${deltaX}px))`;
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  track.classList.remove('dragging');
  const threshold = width * DRAG_RATIO;
  if (deltaX <= -threshold) next();
  else if (deltaX >= threshold) prev();
  else setTransform();
  startAuto();
}
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
viewport.addEventListener('pointerleave', endDrag);

btnPrev.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
btnNext.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  { stopAuto(); prev(); startAuto(); }
  if (e.key === 'ArrowRight') { stopAuto(); next(); startAuto(); }
});

setTransform(false);
syncDots();
startAuto();
