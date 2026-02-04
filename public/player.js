let player = null;
let playerKey = null;
let notified = false;
let pollInterval = null;

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

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText =
    `Hi ${player.name} 👋`;

  updateStatus();

  // ✅ Start polling server
  pollInterval = setInterval(checkGameStatus, 2000);
}

/* ---------- POLLING ---------- */

async function checkGameStatus() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: playerKey })
  });

  if (!res.ok) return;

  const latest = await res.json();

  // Detect game start
  if (!player.gameStarted && latest.gameStarted) {
    notifyGameStarted();
  }

  player = latest;
  updateStatus();
}

/* ---------- UI ---------- */

function updateStatus() {
  const status = document.getElementById("status");

  if (!player.gameStarted) {
    status.innerText =
      `😴 Relax ${player.name}, God is planning something...`;
  } else {
    status.innerText =
      `🎉 Game started! Tap Reveal to know your fate`;
  }
}

/* ---------- REVEAL ---------- */

function reveal() {
  if (!player.gameStarted) return;

  document.getElementById("roleText").innerText = player.role;

  const img = document.getElementById("roleImg");
  img.src = `images/${player.role.toLowerCase()}.png`;
  img.onerror = () => (img.style.display = "none");

  document.getElementById("roleCard").style.display = "block";
}

/* ---------- HIDE ---------- */

function hide() {
  document.getElementById("roleCard").style.display = "none";
}

/* ---------- SOUND + VIBRATION ---------- */

function notifyGameStarted() {
  if (notified) return;
  notified = true;

  // 🔔 Sound (safe if missing)
  try {
    const audio = new Audio("sounds/start.mp3");
    audio.play().catch(() => {});
  } catch {}

  // 📳 Vibration (mobile only)
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
}

/* ---------- LOGOUT ---------- */

function logout() {
  clearInterval(pollInterval);
  location.reload();
}
