const desc = document.getElementById('desc');
const toggleBtn = document.querySelector('.show-more');
const audio = document.getElementById('narration');
const lottie = document.getElementById('narrationLottie');
const overlay = document.getElementById('overlay');
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

let art = null;
let isPlaying = false;
let expanded = false;

// ========== 텍스트 토글 ==========
function toggleDescription() {
  expanded = !expanded;
  desc.style.webkitLineClamp = expanded ? 'unset' : '4';
  toggleBtn.textContent = expanded ? 'Show less' : 'Show more';
  desc.textContent = art.desc;
}

// ========== 이미지 저장 ==========
function downloadImage(event) {
  event.preventDefault();
  const imgURL = event.target.src;
  const a = document.createElement('a');
  a.href = imgURL;
  a.download = imgURL.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ========== 오버레이 ==========
function showOverlay() {
  overlay.style.display = 'flex';
  document.body.classList.add('overlay-active');
}

function hideOverlay() {
  overlay.style.display = 'none';
  document.body.classList.remove('overlay-active');
}

// ========== 오디오 제어 ==========
function playAudio() {
  audio.currentTime = 0;
  audio.play();
}

function playAudioAndHideOverlay() {
  hideOverlay();
  playAudio();
}

function toggleAudioPlayback() {
  if (isPlaying) {
    audio.pause();
  } else {
    playAudio();
  }
  hideOverlay(); // 오버레이는 항상 닫힘
}

// ========== 오디오 이벤트 ==========
audio.addEventListener('play', () => {
  lottie.play();
  isPlaying = true;
});

audio.addEventListener('pause', () => {
  lottie.pause();
  isPlaying = false;
});

audio.addEventListener('ended', () => {
  lottie.pause();
  isPlaying = false;
});

// ========== 데이터 로딩 ==========
fetch('artworks.json')
  .then(res => res.json())
  .then(data => {
    art = data[id];
    if (!art) {
      document.getElementById('title').textContent = "작품을 찾을 수 없음";
      desc.textContent = "유효하지 않은 ID입니다.";
      return;
    }

    document.getElementById('title').textContent = art.title;
    document.getElementById('person').textContent = art.person;
    desc.textContent = art.desc;

    const slider = document.getElementById('slider');
    slider.innerHTML = '';

    const slides = Array.isArray(art.slides) ? art.slides : [art.slide];
    slides.forEach(src => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      const img = document.createElement('img');
      img.src = src;
      img.className = 'slide-image';
      slide.appendChild(img);
      slider.appendChild(slide);
    });

    setupSwipe(slider, slides.length);

    // 작품 id에 맞는 오디오 파일 설정
    audio.src = `audio/${id}.mp3`;
  })
  .catch(err => {
    console.error('작품 데이터를 불러오지 못했습니다:', err);
  });

// ========== 슬라이더 ==========
function setupSwipe(slider, totalSlides) {
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let currentIndex = 0;

  const slideWidth = slider.offsetWidth;

  slider.addEventListener('touchstart', e => {
    isDragging = true;
    startX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    if (Math.abs(dx) > 10) e.preventDefault();
    slider.style.transform = `translateX(${currentTranslate + dx}px)`;
  }, { passive: false });

  slider.addEventListener('touchend', e => {
    if (!isDragging) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -50 && currentIndex < totalSlides - 1) currentIndex++;
    else if (dx > 50 && currentIndex > 0) currentIndex--;

    currentTranslate = -currentIndex * slideWidth;
    slider.style.transition = 'transform 0.3s ease';
    slider.style.transform = `translateX(${currentTranslate}px)`;
    isDragging = false;
  });
}