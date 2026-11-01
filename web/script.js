/* =========================================================
   SCRIPT.JS - VIRTUAL BIRTHDAY SURPRISE WEBSITE
   Interactive Features & Customizable Settings
   ========================================================= */

// =========================================================
// ⚙️ PENGATURAN / CONFIGURATION
// =========================================================
const BIRTHDAY_CONFIG = {
  // Nama panggilan yang ulang tahun
  recipientName: "CUWII BEBSKUYY",

  // Nama pengirim / ucapan penutup
  senderName: "Dari seseorang yang selalu menyayangimu 🤍",

  // Nomor WhatsApp untuk tombol balas (Format: 628xxxxxxxxxx)
  whatsappNumber: "6281349222265",

  // Pesan otomatis yang akan terisi saat klik "Balas ke WhatsApp"
  whatsappMessage: "Makasih banyak ya buat kejutan websitenya, aku suka banget! Manis banget 🤍🎂",
};

// =========================================================
// INIT ON DOM LOAD
// =========================================================
const initializeBirthdayWebsite = () => {
  const runSafely = (name, initializer) => {
    try {
      initializer();
    } catch (error) {
      console.error(`Birthday page initialization failed: ${name}`, error);
    }
  };

  runSafely("applyConfig", applyConfig);
  runSafely("initPageNavigation", initPageNavigation);
  runSafely("initCover", initCover);
  runSafely("initMemoryMarquee", initMemoryMarquee);
  runSafely("initBackgroundMusic", initBackgroundMusic);
  runSafely("initMemorySoundtrack", initMemorySoundtrack);
  runSafely("initBirthdayPopup", initBirthdayPopup);
  runSafely("initStars", initStars);
  runSafely("initConfetti", initConfetti);
  runSafely("initCandle", initCandle);
  runSafely("initEnvelope", initEnvelope);
  runSafely("initPolaroidLightbox", initPolaroidLightbox);
  runSafely("initHugAction", initHugAction);
  runSafely("initClickHearts", initClickHearts);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeBirthdayWebsite, { once: true });
} else {
  initializeBirthdayWebsite();
}

// =========================================================
// PAGE NAVIGATION (Home, Journey, Wish, Music, Letter)
// =========================================================
let backgroundWasPlayingBeforeMemories = false;

function initMemoryMarquee() {
  const grid = document.getElementById("polaroid-grid");
  if (!grid || grid.dataset.marqueeReady === "true") return;

  const windowEl = document.createElement("div");
  windowEl.className = "memory-film-window";
  windowEl.id = "memory-film-window";
  windowEl.setAttribute("aria-label", "Kolase foto kenangan yang bergerak otomatis");

  const track = document.createElement("div");
  track.className = "memory-film-track";
  track.id = "memory-film-track";
  const parent = grid.parentElement;
  parent.insertBefore(windowEl, grid);
  windowEl.appendChild(track);
  track.appendChild(grid);

  const copy = grid.cloneNode(true);
  copy.removeAttribute("id");
  copy.classList.add("memory-film-copy");
  copy.setAttribute("aria-hidden", "true");
  copy.querySelectorAll("button").forEach((button) => button.setAttribute("tabindex", "-1"));
  track.appendChild(copy);
  grid.dataset.marqueeReady = "true";

  const setRollSpeed = () => {
    const height = grid.getBoundingClientRect().height;
    if (height > 0) track.style.setProperty("--memory-roll-duration", `${Math.max(110, height / 26)}s`);
  };

  requestAnimationFrame(setRollSpeed);
  if ("ResizeObserver" in window) new ResizeObserver(setRollSpeed).observe(grid);

}

function initPageNavigation() {
  const pageSections = document.querySelectorAll("[data-page]");
  const backButton = document.getElementById("back-to-menu");

  const showPage = (pageName) => {
    const previousPage = document.body.dataset.activePage || "home";

    pageSections.forEach((section) => {
      const isActive = section.dataset.page.split(/\s+/).includes(pageName);
      section.classList.toggle("page-hidden", !isActive);
      if (isActive) {
        section.classList.remove("page-enter");
        void section.offsetWidth;
        section.classList.add("page-enter");
      }
    });

    if (backButton) backButton.classList.toggle("hidden", pageName === "home");
    document.body.dataset.activePage = pageName;
    const memoryTrack = document.getElementById("memory-film-track");
    if (memoryTrack) memoryTrack.classList.toggle("is-rolling", pageName === "journey");

    if (pageName === "journey" && previousPage !== "journey") {
      const backgroundAudio = document.getElementById("bg-audio");
      backgroundWasPlayingBeforeMemories = Boolean(backgroundAudio && !backgroundAudio.paused);
      if (backgroundAudio) backgroundAudio.pause();
      playMemorySoundtrack();
    } else if (previousPage === "journey" && pageName !== "journey") {
      const memoryAudio = document.getElementById("memory-soundtrack-audio");
      if (memoryAudio) memoryAudio.pause();
      if (backgroundWasPlayingBeforeMemories) playBackgroundMusic();
      backgroundWasPlayingBeforeMemories = false;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  document.querySelectorAll("[data-go-page]").forEach((button) => {
    button.addEventListener("click", () => showPage(button.dataset.goPage));
  });

  window.pageNavigationReady = true;
  showPage("home");
}

// =========================================================
// BACKGROUND MUSIC CONTROLLER
// =========================================================
let bgMusicStarted = false;

function initBackgroundMusic() {
  const audio = document.getElementById("bg-audio");
  const floatingBtn = document.getElementById("music-floating-btn");
  const floatingText = document.getElementById("music-floating-text");
  const playBtn = document.getElementById("player-play-btn");
  const playIcon = document.getElementById("player-play-icon");
  const btnLabel = document.getElementById("player-btn-label");
  const statusBadge = document.getElementById("player-status-badge");
  const vinylPlayer = document.getElementById("player-vinyl");
  const timeline = document.getElementById("player-timeline");
  const progressBar = document.getElementById("player-progress-bar");
  const currentTimeEl = document.getElementById("player-current-time");
  const durationEl = document.getElementById("player-duration");

  if (!audio) return;

  audio.volume = 0.8;

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  };

  const updateUI = (isPlaying, statusMessage = "") => {
    if (floatingBtn) {
      floatingBtn.classList.toggle("is-playing", isPlaying);
      floatingBtn.setAttribute("aria-pressed", String(isPlaying));
      floatingBtn.setAttribute("aria-label", isPlaying ? "Jeda musik latar A&W" : "Putar musik latar A&W");
      if (floatingText) {
        floatingText.textContent = isPlaying ? "A&W Aktif" : "Putar A&W";
      }
    }

    if (playBtn) {
      if (playIcon) playIcon.textContent = isPlaying ? "⏸" : "▶";
      if (btnLabel) btnLabel.textContent = isPlaying ? "Jeda Musik" : "Putar Musik";
    }
    if (statusBadge) {
      statusBadge.textContent = statusMessage || (isPlaying ? "Sedang Diputar 🎧" : "Sentuh untuk memutar");
      statusBadge.classList.toggle("paused", !isPlaying);
      statusBadge.classList.toggle("audio-error", Boolean(audio.error));
    }
    if (vinylPlayer) {
      vinylPlayer.classList.toggle("spinning", isPlaying);
    }
  };

  const playAudio = () => {
    const playRequest = audio.play();
    if (!playRequest || typeof playRequest.then !== "function") {
      bgMusicStarted = true;
      return;
    }

    playRequest.then(() => {
      bgMusicStarted = true;
    }).catch((error) => {
      const failedToLoad = Boolean(audio.error);
      updateUI(false, failedToLoad ? "File musik gagal dimuat" : "Ketuk Putar untuk mulai");
      if (!failedToLoad && error?.name !== "NotAllowedError") {
        console.warn("Background music could not start:", error);
      }
    });
  };

  const togglePlay = (e) => {
    if (e) {
      e.stopPropagation();
      document.removeEventListener("click", startOnGesture);
    }
    if (audio.paused) {
      playAudio();
    } else {
      audio.pause();
      updateUI(false);
    }
  };

  if (floatingBtn) floatingBtn.addEventListener("click", togglePlay);
  if (playBtn) playBtn.addEventListener("click", togglePlay);

  // The `play` event means a request started, not that audio is audible yet.
  audio.addEventListener("play", () => updateUI(false, "Memuat lagu…"));
  audio.addEventListener("pause", () => updateUI(false, "Musik dijeda"));
  audio.addEventListener("error", () => updateUI(false, "File musik gagal dimuat"));
  audio.addEventListener("playing", () => updateUI(true));
  audio.addEventListener("waiting", () => updateUI(false, "Memuat lagu…"));
  audio.addEventListener("stalled", () => updateUI(false, "Koneksi lagu terhenti, coba putar lagi"));

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    if (progressBar) progressBar.style.width = progressPercent + "%";
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    if (durationEl) durationEl.textContent = formatTime(audio.duration);
  });

  updateUI(!audio.paused);

  if (timeline) {
    const seek = (e) => {
      const rect = timeline.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      if (width > 0 && audio.duration) {
        const targetTime = (clickX / width) * audio.duration;
        audio.currentTime = Math.max(0, Math.min(targetTime, audio.duration));
      }
    };
    timeline.addEventListener("click", seek);
  }

  // Global first-gesture listener
  const startOnGesture = (event) => {
    const target = event.target;
    if (document.body.dataset.activePage === "journey") return;
    if (target && target.closest && target.closest('[data-go-page="journey"], #memory-music-toggle, #memory-soundtrack-audio, #bg-audio, .youtube-frame, .youtube-link, #music-floating-btn, #player-play-btn')) return;

    if (!bgMusicStarted && audio.paused) {
      playAudio();
    }
    document.removeEventListener("click", startOnGesture);
  };
  document.addEventListener("click", startOnGesture);
}

function initMemorySoundtrack() {
  const audio = document.getElementById("memory-soundtrack-audio");
  const button = document.getElementById("memory-music-toggle");
  const state = document.getElementById("memory-music-state");
  if (!audio) return;

  audio.volume = 0.72;
  if (!button || !state) return;
  const update = (isPlaying) => {
    button.classList.toggle("is-playing", isPlaying);
    button.setAttribute("aria-pressed", String(isPlaying));
    button.setAttribute("aria-label", `${isPlaying ? "Jeda" : "Putar"} Terbuang Dalam Waktu oleh Barasuara`);
    state.textContent = isPlaying ? "JEDA" : "PUTAR";
  };

  audio.addEventListener("play", () => update(true));
  audio.addEventListener("pause", () => update(false));
  audio.addEventListener("ended", () => update(false));

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    if (audio.paused) {
      const backgroundAudio = document.getElementById("bg-audio");
      if (backgroundAudio) backgroundAudio.pause();
      playMemorySoundtrack();
    } else {
      audio.pause();
    }
  });
}

function playMemorySoundtrack() {
  const audio = document.getElementById("memory-soundtrack-audio");
  const state = document.getElementById("memory-music-state");
  if (!audio) return;

  audio.play().catch(() => {
    if (state) state.textContent = "SENTUH UNTUK PUTAR";
  });
}

function playBackgroundMusic() {
  const audio = document.getElementById("bg-audio");
  if (!audio) return;
  const playRequest = audio.play();
  if (!playRequest || typeof playRequest.then !== "function") {
    bgMusicStarted = true;
    return;
  }
  playRequest.then(() => {
    bgMusicStarted = true;
  }).catch((error) => {
    const statusBadge = document.getElementById("player-status-badge");
    if (statusBadge && !audio.error) statusBadge.textContent = "Ketuk Putar untuk mulai";
    if (audio.error && statusBadge) statusBadge.textContent = "File musik gagal dimuat";
    if (!audio.error && error?.name !== "NotAllowedError") {
      console.warn("Background music could not start:", error);
    }
  });
}

// =========================================================
// BIRTHDAY POPUP CONTROLLER ("ANIMASI YEAY")
// =========================================================
function initBirthdayPopup() {
  const popup = document.getElementById("birthday-popup");
  const closeBtn = document.getElementById("popup-close-btn");
  const backdrop = document.getElementById("birthday-popup-backdrop");
  const cover = document.getElementById("cover-overlay");

  if (!popup) return;
  window.birthdayPopupReady = true;

  const closePopup = () => {
    popup.classList.add("popup-closing");

    if (cover) {
      cover.classList.add("fade-out");
      setTimeout(() => {
        try { cover.remove(); } catch (e) {}
      }, 900);
    }

    setTimeout(() => {
      popup.classList.add("hidden");
      popup.classList.remove("popup-active", "popup-closing");
      triggerConfetti(160);
    }, 450);
  };

  if (closeBtn) closeBtn.addEventListener("click", closePopup);
  if (backdrop) backdrop.addEventListener("click", closePopup);
}

function showBirthdayPopup() {
  const popup = document.getElementById("birthday-popup");
  if (!popup) return;
  popup.classList.remove("hidden");
  void popup.offsetWidth;
  popup.classList.add("popup-active");
  triggerConfetti(260);
}

// Make accessible globally
window.showBirthdayPopup = showBirthdayPopup;

// Apply config texts to DOM
function applyConfig() {
  const heroNameEl = document.getElementById("hero-name");
  if (heroNameEl) heroNameEl.textContent = BIRTHDAY_CONFIG.recipientName;
  const coverNameEl = document.getElementById("cover-name");
  if (coverNameEl) coverNameEl.textContent = BIRTHDAY_CONFIG.recipientName;
  document.title = "Selamat Ulang Tahun, " + BIRTHDAY_CONFIG.recipientName + "! 🎂💜";

  const senderNameEl = document.getElementById("sender-name");
  if (senderNameEl) senderNameEl.textContent = BIRTHDAY_CONFIG.senderName;

  const btnWa = document.getElementById("btn-whatsapp");
  if (btnWa) {
    const cleanNumber = BIRTHDAY_CONFIG.whatsappNumber.replace(/[^0-9]/g, "");
    const encodedMsg = encodeURIComponent(BIRTHDAY_CONFIG.whatsappMessage);
    btnWa.href = "https://wa.me/" + cleanNumber + "?text=" + encodedMsg;
  }
}

// =========================================================
// FLOATING STARS BACKGROUND
// =========================================================
function initStars() {
  const container = document.getElementById("stars-container");
  const symbols = ["✨", "✦", "⋆", "💜", "⭐", "🌹", "♫", "♡", "✧", "🌷", "🦋", "💗"];

  if (container) {
    for (let i = 0; i < 34; i++) {
      const star = document.createElement("div");
      star.className = i % 2 === 0 ? "floating-star falling" : "floating-star rising";
      star.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      star.style.left = (Math.random() * 100) + "vw";
      star.style.setProperty("--drift", Math.round((Math.random() - 0.5) * 170) + "px");
      star.style.fontSize = (12 + Math.random() * 17) + "px";
      star.style.animationDuration = (9 + Math.random() * 10) + "s";
      star.style.animationDelay = (-Math.random() * 16) + "s";
      star.style.opacity = (0.42 + Math.random() * 0.36).toString();
      container.appendChild(star);
    }
  }

  const coverDecorations = document.querySelector(".cover-decorations");
  if (coverDecorations) {
    for (let i = 0; i < 16; i++) {
      const particle = document.createElement("span");
      particle.className = "cover-particle";
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      particle.style.left = (4 + Math.random() * 92) + "%";
      particle.style.top = (8 + Math.random() * 82) + "%";
      particle.style.setProperty("--particle-drift", Math.round((Math.random() - 0.5) * 90) + "px");
      particle.style.fontSize = (14 + Math.random() * 22) + "px";
      particle.style.animationDuration = (6 + Math.random() * 7) + "s";
      particle.style.animationDelay = (-Math.random() * 12) + "s";
      coverDecorations.appendChild(particle);
    }
  }
}

// =========================================================
// COVER / SURPRISE GIFT OPENING & AGE QUESTION
// =========================================================
function initCover() {
  const cover = document.getElementById("cover-overlay");
  const btnOpen = document.getElementById("btn-open-gift");
  const giftBox = document.getElementById("gift-box-trigger");
  const ageGate = document.getElementById("age-gate");
  const ageInput = document.getElementById("age-answer");
  const ageFeedback = document.getElementById("age-feedback");
  const coverSubtitle = cover?.querySelector(".cover-subtitle");
  if (!cover || !btnOpen || !giftBox || !ageGate || !ageInput || !ageFeedback) return;

  const askAge = () => {
    if (cover.classList.contains("fade-out")) return;
    btnOpen.classList.add("hidden");
    if (coverSubtitle) coverSubtitle.textContent = "Jawab dulu pertanyaan kecil untuk membuka kejutan ini.";
    ageGate.classList.remove("hidden");
    ageInput.focus();
  };

  const unlockGift = () => {
    if (cover.classList.contains("fade-out")) return;
    ageGate.classList.add("age-accepted");
    ageInput.disabled = true;
    ageGate.querySelector("button[type='submit']").disabled = true;
    ageFeedback.textContent = "Benar! Selamat ulang tahun ke-20, Bebskuy! 🎉";

    // 1. Putar MP3 A&W sebagai musik latar situs
    playBackgroundMusic();

    // 2. Animasi buka kado (tutup terangkat melayang)
    giftBox.classList.add("opened");

    // 3. Efek konfeti & angka 20 beterbangan
    triggerConfetti(220);
    showerTwentyNumbers(48);

    // 4. Setelah animasi 20 dan kado terbuka, tampilkan pop up animasi yeay di tampilan awal!
    setTimeout(() => {
      showBirthdayPopup();
    }, 5000);
  };

  ageGate.addEventListener("submit", (event) => {
    event.preventDefault();
    ageInput.removeAttribute("aria-invalid");
    ageGate.classList.remove("age-shake");

    const cleanedVal = ageInput.value.trim().toLowerCase();
    if (cleanedVal === "20" || cleanedVal === "20 tahun" || cleanedVal === "20 thn" || cleanedVal === "dua puluh") {
      unlockGift();
      return;
    }

    ageFeedback.textContent = "Belum tepat, coba lagi ya. Kejutan tetap terkunci!";
    ageInput.setAttribute("aria-invalid", "true");
    void ageGate.offsetWidth;
    ageGate.classList.add("age-shake");
    ageInput.focus();
    ageInput.select();
  });

  btnOpen.addEventListener("click", askAge);
  giftBox.addEventListener("click", askAge);
  giftBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      askAge();
    }
  });
  window.birthdayCoverReady = true;
}

function showerTwentyNumbers(count = 48) {
  const layer = document.createElement("div");
  layer.className = "twenty-shower";
  layer.setAttribute("aria-hidden", "true");

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const number = document.createElement("span");
    number.className = "twenty-number";
    number.textContent = "20";
    number.style.left = (Math.random() * 100) + "%";
    number.style.setProperty("--twenty-size", (22 + Math.random() * 46) + "px");
    number.style.setProperty("--twenty-drift", Math.round((Math.random() - 0.5) * 180) + "px");
    number.style.setProperty("--twenty-angle", Math.round((Math.random() - 0.5) * 55) + "deg");
    number.style.setProperty("--twenty-duration", (2.6 + Math.random() * 1.6) + "s");
    number.style.setProperty("--twenty-delay", (Math.random() * 0.55) + "s");
    fragment.appendChild(number);
  }

  layer.appendChild(fragment);
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 4800);
}

// =========================================================
// INTERACTIVE CANDLE BLOWING
// =========================================================
function initCandle() {
  const candle = document.getElementById("virtual-candle");
  const flame = document.getElementById("candle-flame");
  const smoke = document.getElementById("candle-smoke");
  const btnBlow = document.getElementById("btn-blow-candle");
  const blowBtnText = document.getElementById("blow-btn-text");
  const cakeAge = document.getElementById("cake-age");
  const revealBox = document.getElementById("wish-reveal-box");

  let blown = Boolean(window.birthdayCandleBlown);

  const blowCandle = () => {
    if (blown) return;
    blown = true;
    window.birthdayCandleBlown = true;

    if (flame) flame.classList.add("blown-out");
    if (smoke) {
      smoke.classList.remove("hidden");
      smoke.classList.add("smoke-active");
    }

    triggerConfetti(180);

    if (blowBtnText) blowBtnText.textContent = "Lilin Telah Ditiup ✨";
    if (btnBlow) {
      btnBlow.style.pointerEvents = "none";
      btnBlow.style.opacity = "0.7";
    }
    setTimeout(() => {
      if (cakeAge) cakeAge.classList.remove("hidden");
      if (revealBox) revealBox.classList.remove("hidden");
    }, 560);
  };

  if (candle) candle.addEventListener("click", blowCandle);
  if (candle) {
    candle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        blowCandle();
      }
    });
  }
  if (btnBlow) btnBlow.addEventListener("click", blowCandle);
  window.birthdayCandleReady = true;
}

// =========================================================
// VIRTUAL ENVELOPE & LETTER
// =========================================================
function initEnvelope() {
  const envelope = document.getElementById("envelope");
  const flap = document.getElementById("envelope-flap");
  const waxSeal = document.getElementById("wax-seal");
  const letterSheet = document.getElementById("letter-sheet");
  const openButton = document.getElementById("letter-open-button");
  if (!envelope || !letterSheet) return;

  const openLetter = () => {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    envelope.setAttribute("aria-expanded", "true");
    envelope.setAttribute("aria-label", "Surat terbuka");
    letterSheet.classList.add("active");
    if (openButton) openButton.setAttribute("aria-expanded", "true");
    triggerConfetti(60);
    requestAnimationFrame(() => letterSheet.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  envelope.addEventListener("click", openLetter);
  envelope.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLetter();
    }
  });
  if (flap) flap.addEventListener("click", openLetter);
  if (waxSeal) waxSeal.addEventListener("click", openLetter);
  if (openButton) openButton.addEventListener("click", openLetter);
}

// =========================================================
// POLAROID LIGHTBOX MODAL
// =========================================================
function initPolaroidLightbox() {
  const gallery = document.getElementById("memory-film-window");
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const modalCaption = document.getElementById("lightbox-caption");
  const backdrop = document.getElementById("lightbox-backdrop");
  const btnClose = document.getElementById("lightbox-close");

  if (gallery) {
    gallery.addEventListener("click", (event) => {
      const card = event.target.closest(".polaroid-card");
      if (!card || !gallery.contains(card)) return;

      const fullSrc = card.getAttribute("data-full");
      const caption = card.getAttribute("data-caption");
      const img = card.querySelector(".polaroid-img");
      if (modalImg) modalImg.src = fullSrc || img?.src || "";
      if (modalCaption) modalCaption.textContent = caption || "";
      if (modal) modal.classList.add("active");
    });
  });

  const closeModal = () => {
    if (modal) modal.classList.remove("active");
  };

  if (btnClose) btnClose.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) {
      closeModal();
    }
  });
}

// =========================================================
// HUG COUNTER ACTION
// =========================================================
function initHugAction() {
  const btnHug = document.getElementById("btn-hug");
  const hugCountEl = document.getElementById("hug-count");

  let count = 0;

  if (btnHug) {
    btnHug.addEventListener("click", () => {
      count++;
      if (hugCountEl) hugCountEl.textContent = count.toString();
      triggerConfetti(40);

      btnHug.classList.add("btn-bounce");
      setTimeout(() => btnHug.classList.remove("btn-bounce"), 400);
    });
  }
  window.hugActionReady = true;
}

// =========================================================
// CLICK HEARTS ANIMATION
// =========================================================
function initClickHearts() {
  const heartSymbols = ["🤍", "💜", "💖", "✨", "🌸", "🌷"];

  document.addEventListener("click", (e) => {
    if (e.target.closest("button, a, input, [role='button']")) return;

    const heart = document.createElement("div");
    heart.className = "click-heart";
    heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
    heart.style.left = e.clientX + "px";
    heart.style.top = e.clientY + "px";
    heart.style.fontSize = (16 + Math.random() * 16) + "px";
    document.body.appendChild(heart);

    setTimeout(() => heart.remove(), 1400);
  });
}

// =========================================================
// CANVAS CONFETTI ENGINE
// =========================================================
let confettiPieces = [];
let confettiCtx = null;
let confettiAnimId = null;

function initConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  confettiCtx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", resize);
  resize();
}

function triggerConfetti(amount = 80) {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas || !confettiCtx) return;

  const colors = ["#ff52d0", "#b33eaa", "#ffe0a8", "#a6fff2", "#ffffff", "#e9a8db", "#c48ad4"];

  for (let i = 0; i < amount; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20,
      size: 5 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 4.5,
      speedX: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  if (!confettiAnimId) {
    animateConfetti();
  }
}

function animateConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas || !confettiCtx) return;

  confettiCtx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = confettiPieces.length - 1; i >= 0; i--) {
    const p = confettiPieces[i];
    p.y += p.speedY;
    p.x += p.speedX;
    p.rotation += p.rotSpeed;

    if (p.y > canvas.height * 0.75) {
      p.opacity -= 0.02;
    }

    if (p.y > canvas.height || p.opacity <= 0) {
      confettiPieces.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.globalAlpha = p.opacity;
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    confettiCtx.restore();
  }

  if (confettiPieces.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimId = null;
  }
}
