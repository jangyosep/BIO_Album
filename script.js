const photos = Array.from({ length: 9 }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    full: `images/photo-${number}.jpg`,
    thumb: `images/thumb-${number}.jpg`,
    alt: `BIO and GYURI wedding studio photo ${index + 1}`,
  };
});

const quotes = [
  "Every love story is beautiful, but ours is my favorite.",
  "Together is a beautiful place to be.",
  "Where you go, I will go; where you stay, I will stay.",
  "Two hearts, one promise, a lifetime of mornings.",
  "In your light, I have found my forever.",
];

const weddingDate = new Date("2026-08-15T00:00:00+09:00");
const dday = document.querySelector("#dday");
const calendarDday = document.querySelector("#calendarDday");
const heroImage = document.querySelector("#heroImage");
const quote = document.querySelector("#quote");
const calendarGrid = document.querySelector("#calendarGrid");
const gallery = document.querySelector("#gallery");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeLightbox = document.querySelector("#closeLightbox");
const prevPhoto = document.querySelector("#prevPhoto");
const nextPhoto = document.querySelector("#nextPhoto");
const musicToggle = document.querySelector("#musicToggle");
const musicLabel = document.querySelector("#musicLabel");

let activePhotoIndex = 0;
let activeHeroIndex = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let audioContext;
let musicNodes = [];
let isMusicPlaying = false;

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function updateDday() {
  const today = new Date();
  const localMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const weddingMidnight = new Date(weddingDate.getFullYear(), weddingDate.getMonth(), weddingDate.getDate());
  const diff = Math.ceil((weddingMidnight - localMidnight) / 86400000);
  const label = diff > 0 ? `D-${diff}` : diff === 0 ? "D-Day" : `D+${Math.abs(diff)}`;

  dday.textContent = label;
  calendarDday.textContent = label;
}

function renderRandomHero() {
  activeHeroIndex = Math.floor(Math.random() * photos.length);
  const selected = photos[activeHeroIndex];
  heroImage.src = selected.full;
  heroImage.alt = selected.alt;
  quote.textContent = pickRandom(quotes);
}

function startHeroSlideshow() {
  window.setInterval(() => {
    activeHeroIndex = (activeHeroIndex + 1) % photos.length;
    const next = photos[activeHeroIndex];
    heroImage.classList.add("is-changing");

    window.setTimeout(() => {
      heroImage.src = next.full;
      heroImage.alt = next.alt;
      quote.textContent = pickRandom(quotes);
      heroImage.classList.remove("is-changing");
    }, 520);
  }, 5200);
}

function renderCalendar() {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const firstDay = new Date(2026, 7, 1).getDay();
  const daysInMonth = 31;
  calendarGrid.innerHTML = "";

  weekdays.forEach((weekday) => {
    const cell = document.createElement("div");
    cell.className = "calendar-cell weekday";
    cell.textContent = weekday;
    calendarGrid.append(cell);
  });

  for (let i = 0; i < firstDay; i += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell empty";
    calendarGrid.append(cell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement("div");
    cell.className = `calendar-cell day${day === 15 ? " wedding-day" : ""}`;
    cell.textContent = String(day);
    calendarGrid.append(cell);
  }
}

function renderGallery() {
  gallery.innerHTML = "";

  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "photo-card reveal";
    button.type = "button";
    button.setAttribute("aria-label", `Open wedding photo ${index + 1}`);

    const image = document.createElement("img");
    image.src = photo.thumb;
    image.alt = photo.alt;
    image.loading = "lazy";

    button.append(image);
    button.addEventListener("click", () => openPhoto(index));
    gallery.append(button);
  });
}

function initScrollAnimation() {
  const revealTargets = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealTargets.forEach((target) => observer.observe(target));
}

function openPhoto(index) {
  activePhotoIndex = index;
  lightboxImage.src = photos[index].full;
  lightboxImage.alt = photos[index].alt;
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closePhoto() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function movePhoto(direction) {
  activePhotoIndex = (activePhotoIndex + direction + photos.length) % photos.length;
  animateLightboxPhoto(direction);
}

function animateLightboxPhoto(direction) {
  const outClass = direction > 0 ? "slide-next" : "slide-prev";
  const inClass = direction > 0 ? "slide-enter-next" : "slide-enter-prev";

  lightboxImage.classList.remove("slide-enter-next", "slide-enter-prev", "slide-next", "slide-prev");
  lightboxImage.classList.add(outClass);

  window.setTimeout(() => {
    lightboxImage.src = photos[activePhotoIndex].full;
    lightboxImage.alt = photos[activePhotoIndex].alt;
    lightboxImage.classList.remove(outClass);
    lightboxImage.classList.add(inClass);
  }, 180);

  window.setTimeout(() => {
    lightboxImage.classList.remove(inClass);
  }, 540);
}

function handleTouchStart(event) {
  if (!lightbox.classList.contains("is-open")) return;
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchEndX = touch.clientX;
}

function handleTouchMove(event) {
  if (!lightbox.classList.contains("is-open")) return;
  touchEndX = event.changedTouches[0].clientX;
}

function handleTouchEnd(event) {
  if (!lightbox.classList.contains("is-open")) return;
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX;
  const deltaY = touch.clientY - touchStartY;

  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
  movePhoto(deltaX < 0 ? 1 : -1);
}

function stopMusic() {
  musicNodes.forEach((node) => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch {
      node.disconnect?.();
    }
  });
  musicNodes = [];
  isMusicPlaying = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-pressed", "false");
  musicLabel.textContent = "Music";
}

function startMusic() {
  audioContext ??= new AudioContext();
  const master = audioContext.createGain();
  master.gain.value = 0.035;
  master.connect(audioContext.destination);
  musicNodes.push(master);

  const notes = [261.63, 329.63, 392.0, 493.88];
  notes.forEach((frequency, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = index % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = frequency / (index === 3 ? 2 : 1);
    gain.gain.value = index === 0 ? 0.28 : 0.13;
    osc.connect(gain);
    gain.connect(master);
    osc.start(audioContext.currentTime + index * 0.08);
    musicNodes.push(osc, gain);
  });

  const pulse = audioContext.createOscillator();
  const pulseGain = audioContext.createGain();
  pulse.type = "sine";
  pulse.frequency.value = 0.08;
  pulseGain.gain.value = 0.05;
  pulse.connect(pulseGain);
  pulseGain.connect(master.gain);
  pulse.start();
  musicNodes.push(pulse, pulseGain);

  isMusicPlaying = true;
  musicToggle.classList.add("is-playing");
  musicToggle.setAttribute("aria-pressed", "true");
  musicLabel.textContent = "Playing";
}

closeLightbox.addEventListener("click", closePhoto);
prevPhoto.addEventListener("click", () => movePhoto(-1));
nextPhoto.addEventListener("click", () => movePhoto(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closePhoto();
});

lightboxImage.addEventListener("touchstart", handleTouchStart, { passive: true });
lightboxImage.addEventListener("touchmove", handleTouchMove, { passive: true });
lightboxImage.addEventListener("touchend", handleTouchEnd, { passive: true });

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closePhoto();
  if (event.key === "ArrowLeft") movePhoto(-1);
  if (event.key === "ArrowRight") movePhoto(1);
});

musicToggle.addEventListener("click", async () => {
  if (isMusicPlaying) {
    stopMusic();
    return;
  }

  if (audioContext?.state === "suspended") {
    await audioContext.resume();
  }
  startMusic();
});

updateDday();
renderRandomHero();
startHeroSlideshow();
renderCalendar();
renderGallery();
initScrollAnimation();
