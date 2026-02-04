let loggedInPlayer = null;

/* ================== PLAYER ================== */

async function playerLogin() {
  const key = document.getElementById("playerKey").value.trim();
  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  if (!key) {
    errorEl.innerText = "Please enter your Game Key";
    return;
  }

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    errorEl.innerText = "❌ Invalid Game Key";
    return;
  }

  loggedInPlayer = await res.json();

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText = `Hi ${loggedInPlayer.name} 👋`;

  updateGameStatus();

  // Poll every 5 sec for game status updates
  setInterval(updateGameStatus, 5000);
}

async function updateGameStatus() {
  if (!loggedInPlayer) return;

  const res = await fetch("/playerStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: loggedInPlayer.key })
  });
  if (!res.ok) return;

  const data = await res.json();

  if (data.gameStarted && !data.revealed) {
    notifyStart();
    setStatus("🎉 Game started! Click Reveal to see your role.");
  } else if (!data.gameStarted) {
    setStatus("⏳ Waiting for game to start... God is cooking something 🔥");
    hideRoleCard();
  } else if (data.revealed) {
    showRoleCard(data.role);
  }
}

function setStatus(msg) {
  const status = document.getElementById("status");
  status.innerText = msg;
}

function notifyStart() {
  const audio = document.getElementById("startSound");
  audio.play().catch(() => {});
  if (navigator.vibrate) navigator.vibrate(300);
}

async function reveal() {
  if (!loggedInPlayer) return;
  if (!loggedInPlayer.gameStarted) return;

  await fetch("/playerRevealed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: loggedInPlayer.key })
  });

  const res = await fetch("/playerStatus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: loggedInPlayer.key })
  });

  if (!res.ok) return;

  const data = await res.json();

  showRoleCard(data.role);
  setStatus("🎭 Here's your role. Be careful!");

  document.getElementById("revealBtn").style.display = "none";
  document.getElementById("hideBtn").style.display = "inline-block";
}

async function hide() {
  if (!loggedInPlayer) return;

  await fetch("/playerHideRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: loggedInPlayer.key })
  });

  setStatus("🔒 Role hidden. Stay calm 😎");
  hideRoleCard();

  document.getElementById("revealBtn").style.display = "inline-block";
  document.getElementById("hideBtn").style.display = "none";
}

function showRoleCard(role) {
  const roleCard = document.getElementById("roleCard");
  const roleText = document.getElementById("roleText");
  const roleImg = document.getElementById("roleImg");

  roleText.innerText = role;

  const imgMap = {
    "Mafia": "images/mafia.png",
    "Villager": "images/villager.png",
    "Doctor": "images/doctor.png",
    "Detective": "images/detective.png"
  };

  roleImg.src = imgMap[role] || "";
  roleImg.alt = role;

  roleCard.style.display = "block";
}

function hideRoleCard() {
  document.getElementById("roleCard").style.display = "none";
}

function logout() {
  location.reload();
}
