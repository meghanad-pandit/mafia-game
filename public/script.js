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

  // Set image source depending on role
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

/* ================== GOD ================== */

async function godLogin() {
  const key = document.getElementById("godKey").value.trim();
  const godError = document.getElementById("godError");
  godError.innerText = "";

  if (!key) {
    godError.innerText = "Please enter the God Key";
    return;
  }

  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    godError.innerText = "❌ Invalid God Key";
    return;
  }

  document.getElementById("godLogin").style.display = "none";
  document.getElementById("godPanel").style.display = "block";

  loadPlayers();
}

async function addPlayer() {
  const playerNameInput = document.getElementById("playerName");
  const name = playerNameInput.value.trim();
  if (!name) return alert("Please enter player name");

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  playerNameInput.value = "";
  loadPlayers();
}

async function deletePlayer(key) {
  if (!confirm("Are you sure you want to delete this player?")) return;

  await fetch("/deletePlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  loadPlayers();
}

async function changeRole(key, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, role })
  });

  loadPlayers();
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });

  document.getElementById("startBtn").disabled = true;
  loadPlayers();
}

async function resetGame() {
  if (!confirm("Are you sure you want to reset the game? All roles will reset.")) return;

  await fetch("/resetGame", { method: "POST" });

  document.getElementById("startBtn").disabled = false;
  loadPlayers();
}

async function loadPlayers() {
  const res = await fetch("/players");
  if (!res.ok) return;

  const data = await res.json();

  const table = document.getElementById("playerTable");
  table.innerHTML = "";

  data.players.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>
          ${p.key}
          <button onclick="navigator.clipboard.writeText('${p.key}')">📋</button>
        </td>
        <td>
          <select onchange="changeRole('${p.key}', this.value)" ${data.gameStarted ? "disabled" : ""}>
            <option ${p.role === "Villager" ? "selected" : ""}>Villager</option>
            <option ${p.role === "Mafia" ? "selected" : ""}>Mafia</option>
            <option ${p.role === "Doctor" ? "selected" : ""}>Doctor</option>
            <option ${p.role === "Detective" ? "selected" : ""}>Detective</option>
          </select>
        </td>
        <td>
          <button class="deleteBtn" onclick="deletePlayer('${p.key}')">❌</button>
        </td>
      </tr>
    `;
  });

  if (data.gameStarted) {
    document.getElementById("startBtn").disabled = true;
  } else {
    document.getElementById("startBtn").disabled = false;
  }
}
