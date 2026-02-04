let player = null;
let playerKey = null;
let pollInterval = null;
let lastGameVersion = null;
let notified = false;

/* ---------- LOGIN ---------- */

async function login() {
  playerKey = document.getElementById("gameKey").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: playerKey })
  });

  if (!res.ok) {
    document.getElementById("error").innerText = "❌ Invalid Game Key";
    return;
  }

  player = await res.json();
  lastGameVersion = player.gameVersion;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText =
    `Hi ${player.name} 👋`;

  updateWaitingUI();
  pollInterval = setInterval(pollServer, 2000);
}

/* ---------- POLLING ---------- */

async function pollServer() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: playerKey })
  });

  if (!res.ok) return;

  const latest = await res.json();

  // RESET OR NEW ROUND DETECTED
  if (latest.gameVersion !== lastGameVersion) {
    hide(); // 👈 hide card
    notified = false;
    lastGameVersion = latest.gameVersion;
  }

  // GAME STARTED
  if (!player.gameStarted && latest.gameStarted) {
    notifyGameStarted();
  }

  player = latest;

  player.gameStarted ? updateStartedUI() : updateWaitingUI();
}

/* ---------- UI STATES ---------- */

function updateWaitingUI() {
  document.getElementById("status").innerText =
    `😴 Chill ${player.name}… God is cooking the game 🍳`;
}

function updateStartedUI() {
  document.getElementById("status").innerText =
    `🎉 Game started! Tap Reveal to know your destiny`;
}

/* ---------- REVEAL ---------- */

function reveal() {
  if (!player.gameStarted) return;

  document.getElementById("roleText").innerText = player.role;

  const img = document.getElementById("roleImg");
  img.src = `images/${player.role.toLowerCase()}.png`;
  img.onerror = () => (img.style.display = "none");

  document.getElementById("roleCard").classList.add("flip");
  document.getElementById("roleCard").style.display = "block";
}

/* ---------- HIDE ---------- */

function hide() {
  const card = document.getElementById("roleCard");
  card.classList.remove("flip");
  card.style.display = "none";
}

/* ---------- SOUND + VIBRATION ---------- */

function notifyGameStarted() {
  if (notified) return;
  notified = true;

  try {
    const audio = new Audio("sounds/start.mp3");
    audio.play().catch(() => {});
  } catch {}

  if (navigator.vibrate) {
    navigator.vibrate([300, 150, 300]);
  }
}

/* ---------- LOGOUT ---------- */

function logout() {
  clearInterval(pollInterval);
  location.reload();
}
