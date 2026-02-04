let loggedInPlayer = null;
let cardFlipped = false;

async function playerLogin() {
  const key = document.getElementById("playerKey").value.trim();
  const errorEl = document.getElementById("error");
  errorEl.innerText = "";

  if (!key) {
    errorEl.innerText = "Please enter your Game Key";
    return;
  }

  try {
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

    // Poll every 4 seconds for updates
    setInterval(updateGameStatus, 4000);
  } catch (err) {
    errorEl.innerText = "Network error, try again.";
  }
}

async function updateGameStatus() {
  if (!loggedInPlayer) return;

  try {
    const res = await fetch("/playerStatus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: loggedInPlayer.key })
    });

    if (!res.ok) return;

    const data = await res.json();

    if (data.gameStarted && !data.revealed) {
      notifyStart();
      setStatus("🎉 Game started! Click 'Reveal Role' to see your role.");
      hideRoleCard();
      document.getElementById("revealBtn").style.display = "inline-block";
      document.getElementById("hideBtn").style.display = "none";
    } else if (!data.gameStarted) {
      setStatus("⏳ Waiting for game to start... God is preparing the drama! 🎭");
      hideRoleCard();
      document.getElementById("revealBtn").style.display = "inline-block";
      document.getElementById("hideBtn").style.display = "none";
    } else if (data.revealed) {
      showRoleCard(data.role);
      setStatus("🎭 Here is your role. Stay secretive!");
      document.getElementById("revealBtn").style.display = "none";
      document.getElementById("hideBtn").style.display = "inline-block";
    }
  } catch {
    // ignore network errors silently
  }
}

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

function notifyStart() {
  const audio = document.getElementById("startSound");
  if (audio.paused) {
    audio.play().catch(() => {});
  }
  if (navigator.vibrate) navigator.vibrate(300);
}

async function reveal() {
  if (!loggedInPlayer) return;
  try {
    await fetch("/playerRevealed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: loggedInPlayer.key })
    });

    updateGameStatus();
  } catch {
    // ignore
  }
}

async function hide() {
  if (!loggedInPlayer) return;
  try {
    await fetch("/playerHideRole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: loggedInPlayer.key })
    });

    updateGameStatus();
  } catch {
    // ignore
  }
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
  if (!cardFlipped) toggleCard(); // Flip card to back if not flipped
}

function hideRoleCard() {
  const roleCard = document.getElementById("roleCard");
  roleCard.style.display = "none";
  if (cardFlipped) toggleCard(); // Flip card back if flipped
}

function toggleCard() {
  const cardInner = document.getElementById("cardInner");
  cardFlipped = !cardFlipped;
  if (cardFlipped) {
    cardInner.classList.add("flipped");
  } else {
    cardInner.classList.remove("flipped");
  }
}

function logout() {
  location.reload();
}
