const desc = document.getElementById('desc');
const toggleBtn = document.querySelector('.show-more');
let expanded = false;

function toggleDescription() {
  expanded = !expanded;
  desc.style.webkitLineClamp = expanded ? 'unset' : '4';
  desc.textContent = art.desc;
  toggleBtn.textContent = expanded ? 'Show less' : 'Show more';
}

// 이미지 저장 기능
function downloadImage(event) {
  event.preventDefault(); // 기본 동작 방지
  const imgURL = event.target.src;
  const a = document.createElement('a');
  a.href = imgURL;
  a.download = imgURL.split('/').pop(); // 파일명 추출
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// URL 에서 id 추출
const params = new URLSearchParams(window.location.search);
const id = params.get('id');

fetch('artworks.json')
  .then(response => response.json())
  .then(data => {
    const art = data[id];

    if (art) {
      document.getElementById('title').textContent = art.title;
      document.getElementById('person').textContent = art.person;
      document.getElementById('desc').textContent = art.desc;

      const slider = document.getElementById('slider');
      slider.innerHTML = '';

      const slides = Array.isArray(art.slides) ? art.slides : [art.slide];
      slides.forEach(image => {
        const slideDiv = document.createElement('div');
        slideDiv.className = 'slide';

        const img = document.createElement('img');
        img.src = image;
        img.className = 'slide-image';
        slideDiv.appendChild(img);
        slider.appendChild(slideDiv);
      });

      setupSwipe(slider, slides.length);
    } else {
      document.getElementById('title').textContent = "작품을 찾을 수 없음";
      document.getElementById('desc').textContent = "유효하지 않은 ID입니다.";
    }
  })
  .catch(err => {
    console.error("작품 데이터를 불러오지 못했습니다:", err);
  });

function setupSwipe(slider, totalSlides) {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentTranslate = 0;
  let currentIndex = 0;
  let moved = false;

  const slideWidth = slider.offsetWidth;

  slider.addEventListener('touchstart', startDrag, { passive: true });
  slider.addEventListener('touchmove', onDrag, { passive: false });
  slider.addEventListener('touchend', endDrag);

  function startDrag(e) {
    isDragging = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    moved = false;
  }

  function onDrag(e) {
    if (!isDragging) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const dx = x - startX;
    const dy = y - startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
      moved = true;
      slider.style.transform = `translateX(${currentTranslate + dx}px)`;
    }
  }

  function endDrag(e) {
    if (!isDragging || !moved) {
      isDragging = false;
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;

    if (dx < -50 && currentIndex < totalSlides - 1) {
      currentIndex++;
    } else if (dx > 50 && currentIndex > 0) {
      currentIndex--;
    }

    currentTranslate = -currentIndex * slideWidth;
    slider.style.transition = 'transform 0.3s ease';
    slider.style.transform = `translateX(${currentTranslate}px)`;
    isDragging = false;
  }
}
