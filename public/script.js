let loggedInPlayer = null;

/* ---------- PLAYER ---------- */

async function playerLogin() {
  const key = document.getElementById("playerKey").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    document.getElementById("error").innerText = "❌ Invalid Key";
    return;
  }

  loggedInPlayer = await res.json();

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText =
    `Hi ${loggedInPlayer.name} 👋`;

  checkGame();
}

function checkGame() {
  if (loggedInPlayer.gameStarted) {
    notifyStart();
    document.getElementById("status").innerText =
      "🎉 Game Started! Click Reveal";
  } else {
    document.getElementById("status").innerText =
      "⏳ Waiting... God is planning something 😈";
  }
}

function notifyStart() {
  const audio = document.getElementById("startSound");
  audio.play().catch(() => {});
  if (navigator.vibrate) navigator.vibrate(300);
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;
  document.getElementById("status").innerHTML =
    `🎭 Your Role: <b>${loggedInPlayer.role}</b>`;
}

function hide() {
  document.getElementById("status").innerText =
    "🔒 Role hidden. Stay calm 😎";
}

function logout() {
  location.reload();
}

/* ---------- GOD ---------- */

async function godLogin() {
  const key = document.getElementById("godKey").value.trim();

  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    document.getElementById("godError").innerText = "❌ Invalid God Key";
    return;
  }

  document.getElementById("godLogin").style.display = "none";
  document.getElementById("godPanel").style.display = "block";
  loadPlayers();
}

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value })
  });
  loadPlayers();
}

async function deletePlayer(key) {
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
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
  document.getElementById("startBtn").disabled = true;
  loadPlayers();
}

async function resetGame() {
  await fetch("/resetGame", { method: "POST" });
  document.getElementById("startBtn").disabled = false;
  loadPlayers();
}

async function loadPlayers() {
  const res = await fetch("/players");
  const data = await res.json();

  const table = document.getElementById("playerTable");
  if (!table) return;

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
          <button onclick="deletePlayer('${p.key}')">❌</button>
        </td>
      </tr>
    `;
  });
}
