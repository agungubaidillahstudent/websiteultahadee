// Nomor WhatsApp
const WA_NUMBER = "6283148584061";

// Data
let messages = [
  {
    id: 1,
    text: "Sehat sehat adeekkkk",
    sender: "Ka Agung",
    date: new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
];
let isMusicPlaying = false;

// Data Foto dengan ukuran kecil untuk loading cepat
const photoData = [
  { id: 1, src: "siji.png", caption: "Si Paling Ketche" },
  { id: 2, src: "loro.png", caption: "Sing baka apa apa ngosog" },
  { id: 3, src: "telu.png", caption: "Videoe Terngiang Ngiang Bae De" },
  { id: 4, src: "papat.png", caption: "Dirayakan Knih Judule" },
  { id: 5, src: "lima.png", caption: "Fomo Ebate Mah Embuh" },
  { id: 6, src: "enem.png", caption: "Sing Peta De Aja Badeg" },
];

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  renderPhotos();
  updateMessages();
  updatePreview();
  setupListeners();

  // Preload gambar
  preloadImages();

  if (localStorage.getItem("musicAllowed") === "true") {
    setTimeout(() => initMusic(), 500);
  }
});

// Preload gambar biar cepet muncul
function preloadImages() {
  photoData.forEach((photo) => {
    const img = new Image();
    img.src = photo.src;
  });
}

// Setup listeners
function setupListeners() {
  document
    .getElementById("menuToggle")
    ?.addEventListener("click", toggleSidebar);
  document
    .getElementById("closeSidebar")
    ?.addEventListener("click", closeSidebar);
  document.getElementById("overlay")?.addEventListener("click", closeSidebar);
  document.getElementById("shareBtn")?.addEventListener("click", sharePage);

  document
    .querySelectorAll(".sidebar-nav li, .bottom-nav .nav-item")
    .forEach((item) => {
      item.addEventListener("click", () => {
        const section = item.dataset.section;
        if (section) switchSection(section);
      });
    });

  const musicToggle = document.getElementById("musicToggle");
  if (musicToggle) {
    musicToggle.addEventListener("click", toggleMusic);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSidebar();
      closePhotoModal();
    }
  });

  const firstInteraction = () => {
    initMusic();
    document.removeEventListener("click", firstInteraction);
    document.removeEventListener("touchstart", firstInteraction);
  };

  document.addEventListener("click", firstInteraction, { once: true });
  document.addEventListener("touchstart", firstInteraction, { once: true });
}

// MUSIC FUNCTIONS
function initMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;

  localStorage.setItem("musicAllowed", "true");

  audio
    .play()
    .then(() => {
      isMusicPlaying = true;
      updateMusicButton();
    })
    .catch(() => {
      isMusicPlaying = false;
      updateMusicButton();
    });
}

function toggleMusic() {
  const audio = document.getElementById("bgMusic");
  if (!audio) return;

  if (isMusicPlaying) {
    audio.pause();
    isMusicPlaying = false;
  } else {
    audio
      .play()
      .then(() => {
        isMusicPlaying = true;
      })
      .catch(() => {
        showNotification("Gagal memutar lagu");
      });
  }

  updateMusicButton();
}

function updateMusicButton() {
  const toggle = document.getElementById("musicToggle");
  if (!toggle) return;

  if (isMusicPlaying) {
    toggle.classList.add("playing");
    toggle.innerHTML = '<i class="fas fa-volume-up"></i>';
  } else {
    toggle.classList.remove("playing");
    toggle.innerHTML = '<i class="fas fa-music"></i>';
  }
}

// Sidebar
function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("active");
  document.getElementById("overlay")?.classList.toggle("active");
}

function closeSidebar() {
  document.getElementById("sidebar")?.classList.remove("active");
  document.getElementById("overlay")?.classList.remove("active");
}

// Navigation
function switchSection(sectionId) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));

  const activeSection = document.getElementById(sectionId);
  if (activeSection) activeSection.classList.add("active");

  document
    .querySelectorAll(".sidebar-nav li, .bottom-nav .nav-item")
    .forEach((item) => {
      if (item.dataset.section === sectionId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Messages
function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const senderInput = document.getElementById("senderName");

  const message = messageInput?.value.trim();
  const sender = senderInput?.value.trim() || "Temen";

  if (!message) {
    showNotification("Tulis pesan dulu bro");
    return;
  }

  const newMessage = {
    id: Date.now(),
    text: message,
    sender: sender,
    date: new Date().toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  messages.unshift(newMessage);

  if (messageInput) messageInput.value = "";
  if (senderInput) senderInput.value = "";

  updateMessages();
  updatePreview();
  saveData();
  showNotification("Pesan terkirim");
}

function updateMessages() {
  const list = document.getElementById("messagesList");
  if (!list) return;

  if (messages.length === 0) {
    list.innerHTML =
      '<div class="empty-state"><i class="fas fa-envelope-open"></i><p>Belum ada ucapan</p></div>';
    return;
  }

  list.innerHTML = messages
    .map(
      (msg) => `
        <div class="message-item">
            <div class="message-header">
                <span class="message-sender">${escapeHtml(msg.sender)}</span>
                <span class="message-date">${msg.date}</span>
            </div>
            <div class="message-text">${escapeHtml(msg.text)}</div>
        </div>
    `,
    )
    .join("");
}

function updatePreview() {
  const preview = document.getElementById("messagePreview");
  if (!preview) return;

  if (messages.length === 0) {
    preview.innerHTML =
      '<div class="empty-state"><p>Belum ada ucapan</p></div>';
    return;
  }

  preview.innerHTML = messages
    .slice(0, 3)
    .map(
      (msg) => `
        <div class="preview-item">
            <div class="preview-sender">${escapeHtml(msg.sender)}</div>
            <div class="preview-text">${escapeHtml(msg.text)}</div>
        </div>
    `,
    )
    .join("");
}

// Photos
function renderPhotos() {
  const grid = document.getElementById("photosGrid");
  if (!grid) return;

  grid.innerHTML = photoData
    .map(
      (photo) => `
        <div class="photo-item" onclick="openPhoto(${photo.id})">
            <img src="${photo.src}" alt="${photo.caption}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/2c3e50/ffffff?text=Foto'">
            <div class="photo-caption">${photo.caption}</div>
        </div>
    `,
    )
    .join("");
}

function openPhoto(id) {
  const photo = photoData.find((p) => p.id === id);
  if (!photo) return;

  let modal = document.querySelector(".photo-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "photo-modal";
    modal.innerHTML = `
            <div class="modal-content">
                <img src="" alt="" class="modal-image">
                <button class="modal-close" onclick="closePhotoModal()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-caption"></div>
            </div>
        `;
    document.body.appendChild(modal);
  }

  modal.querySelector(".modal-image").src = photo.src;
  modal.querySelector(".modal-caption").textContent = photo.caption;
  modal.classList.add("active");
}

function closePhotoModal() {
  document.querySelector(".photo-modal")?.classList.remove("active");
}

// WhatsApp
function openWhatsApp() {
  const msg = `Halo Ka Agung! Udah liat website spesial buat adek nih 🥂`;
  window.open(
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
    "_blank",
  );
}

// Share
function sharePage() {
  if (navigator.share) {
    navigator
      .share({
        title: "Happy Birthday Adek",
        text: "Website spesial buat adek tersayang 🥂",
        url: window.location.href,
      })
      .catch(() => copyLink());
  } else {
    copyLink();
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href);
  showNotification("Link disalin");
}

// Storage
function saveData() {
  localStorage.setItem("birthdayData", JSON.stringify({ messages: messages }));
}

function loadData() {
  const saved = localStorage.getItem("birthdayData");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.messages && data.messages.length > 0) {
        messages = data.messages;
      }
    } catch (e) {}
  }
}

// Helper
function showNotification(text) {
  const notif = document.createElement("div");
  notif.className = "notification";
  notif.textContent = text;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 2000);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Global functions
window.switchSection = switchSection;
window.sendMessage = sendMessage;
window.openPhoto = openPhoto;
window.closePhotoModal = closePhotoModal;
window.openWhatsApp = openWhatsApp;
window.toggleMusic = toggleMusic;
