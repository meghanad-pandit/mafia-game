let loggedInPlayer = null;
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const revealBtn = document.getElementById("revealBtn");
const hideBtn = document.getElementById("hideBtn");
const statusEl = document.getElementById("status");
const playerNameEl = document.getElementById("playerName");
const loginError = document.getElementById("loginError");
const loginBox = document.getElementById("loginBox");
const gameBox = document.getElementById("gameBox");
const cardInner = document.getElementById("cardInner");
const roleText = document.getElementById("roleText");
const roleImage = document.getElementById("roleImage");
const startSound = document.getElementById("startSound");

const roleImages = {
  Villager: "images/villager.png",
  Mafia: "images/mafia.png",
  Doctor: "images/doctor.png",
  Detective: "images/detective.png",
};

// Login player using game key
async function playerLogin() {
  const key = document.getElementById("playerKey").value.trim();
  loginError.textContent = "";

  if (!key) {
    loginError.textContent = "Please enter your game key";
    return;
  }

  try {
    const res = await fetch("/playerStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (!res.ok) {
      loginError.textContent = "❌ Invalid Key";
      return;
    }

    const data = await res.json();

    loggedInPlayer = {
      key,
      name: data.name,
      role: data.role,
      revealed: data.revealed,
      gameStarted: data.gameStarted,
    };

    showGameBox();

    // Play sound and update UI if game started
    if (loggedInPlayer.gameStarted) {
      notifyGameStarted();
    }
  } catch {
    loginError.textContent = "Error connecting to server";
  }
}

function showGameBox() {
  loginBox.style.display = "none";
  gameBox.style.display = "block";
  playerNameEl.textContent = `Hi, ${loggedInPlayer.name}!`;
  statusEl.textContent = "⏳ Waiting for game to start...";
  updateRoleCard(false);
  revealBtn.style.display = "none";
  hideBtn.style.display = "none";
}

function updateRoleCard(showRole) {
  if (showRole) {
    roleText.textContent = loggedInPlayer.role;
    roleImage.src = roleImages[loggedInPlayer.role] || "";
    cardInner.classList.add("flipped");
  } else {
    roleText.textContent = "";
    roleImage.src = "";
    cardInner.classList.remove("flipped");
  }
}

function updateStatus() {
  if (!loggedInPlayer.gameStarted) {
    statusEl.textContent = `⏳ Waiting for game to start...`;
    revealBtn.style.display = "none";
    hideBtn.style.display = "none";
    updateRoleCard(false);
    return;
  }

  statusEl.textContent = `🎭 Game started! You can reveal your role.`;
  if (loggedInPlayer.revealed) {
    updateRoleCard(true);
    revealBtn.style.display = "none";
    hideBtn.style.display = "inline-block";
  } else {
    updateRoleCard(false);
    revealBtn.style.display = "inline-block";
    hideBtn.style.display = "none";
  }
}

// Play sound and vibrate on game start notification
function notifyGameStarted() {
  startSound.play().catch(() => {});
  if ("vibrate" in navigator) {
    navigator.vibrate([200, 100, 200]);
  }
  updateStatus();
}

// Reveal role
async function reveal() {
  if (!loggedInPlayer.gameStarted) return;
  try {
    const res = await fetch("/playerRevealed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: loggedInPlayer.key }),
    });
    if (res.ok) {
      loggedInPlayer.revealed = true;
      updateStatus();
    }
  } catch {}
}

// Hide role
async function hide() {
  try {
    const res = await fetch("/playerHideRole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: loggedInPlayer.key }),
    });
    if (res.ok) {
      loggedInPlayer.revealed = false;
      updateStatus();
    }
  } catch {}
}

// Logout
function logout() {
  loggedInPlayer = null;
  loginBox.style.display = "block";
  gameBox.style.display = "none";
  document.getElementById("playerKey").value = "";
  loginError.textContent = "";
  updateRoleCard(false);
}

// Poll server every 5 seconds to update player state
async function pollPlayerStatus() {
  if (!loggedInPlayer) return;

  try {
    const res = await fetch("/playerStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: loggedInPlayer.key }),
    });

    if (!res.ok) {
      logout();
      return;
    }

    const data = await res.json();

    // Detect game reset (gameStarted false but previously true)
    if (loggedInPlayer.gameStarted && !data.gameStarted) {
      loggedInPlayer = { ...loggedInPlayer, ...data };
      alert("Game has been reset by God! Your role is now hidden.");
      updateStatus();
      return;
    }

    // Detect game start notification (gameStarted true but previously false)
    if (!loggedInPlayer.gameStarted && data.gameStarted) {
      loggedInPlayer = { ...loggedInPlayer, ...data };
      notifyGameStarted();
      return;
    }

    // Update revealed state or role if changed
    if (
      loggedInPlayer.revealed !== data.revealed ||
      loggedInPlayer.role !== data.role
    ) {
      loggedInPlayer = { ...loggedInPlayer, ...data };
      updateStatus();
    }
  } catch {
    // ignore errors silently
  }
}

// Attach event listeners
cardInner.addEventListener("click", () => {
  if (!loggedInPlayer || !loggedInPlayer.gameStarted) return;
  if (loggedInPlayer.revealed) {
    hide();
  } else {
    reveal();
  }
});

loginBtn.addEventListener("click", playerLogin);
revealBtn.addEventListener("click", reveal);
hideBtn.addEventListener("click", hide);
logoutBtn.addEventListener("click", logout);

// Start polling every 5 seconds
setInterval(pollPlayerStatus, 5000);
