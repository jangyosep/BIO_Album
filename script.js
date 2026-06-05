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
const heroImage = document.querySelector("#heroImage");
const quote = document.querySelector("#quote");
const gallery = document.querySelector("#gallery");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const closeLightbox = document.querySelector("#closeLightbox");
const prevPhoto = document.querySelector("#prevPhoto");
const nextPhoto = document.querySelector("#nextPhoto");
const musicToggle = document.querySelector("#musicToggle");
const musicLabel = document.querySelector("#musicLabel");

let activePhotoIndex = 0;
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

  if (diff > 0) {
    dday.textContent = `D-${diff}`;
  } else if (diff === 0) {
    dday.textContent = "D-Day";
  } else {
    dday.textContent = `D+${Math.abs(diff)}`;
  }
}

function renderRandomHero() {
  const selected = pickRandom(photos);
  heroImage.src = selected.full;
  heroImage.alt = selected.alt;
  quote.textContent = pickRandom(quotes);
}

function renderGallery() {
  gallery.innerHTML = "";

  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.className = "photo-card";
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
  lightboxImage.src = photos[activePhotoIndex].full;
  lightboxImage.alt = photos[activePhotoIndex].alt;
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
renderGallery();
