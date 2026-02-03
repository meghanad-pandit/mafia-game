let loggedInPlayer = null;

/* ================= PLAYER ================= */

async function login() {
  const name = document.getElementById("name").value.trim();
  const pin = document.getElementById("pin").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin })
  });

  if (!res.ok) {
    document.getElementById("loginError").innerText =
      "❌ Invalid Name or PIN";
    return;
  }

  loggedInPlayer = await res.json();

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText =
    "Hi, " + loggedInPlayer.name;

  updatePlayerState();
}

async function updatePlayerState() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: loggedInPlayer.name,
      pin: loggedInPlayer.pin
    })
  });

  if (!res.ok) return;

  loggedInPlayer = await res.json();

  const status = document.getElementById("status");

  if (!loggedInPlayer.gameStarted) {
    status.innerText = "⏳ Waiting for God to start";
  } else {
    status.innerText = "🎭 Game started! Tap Reveal";
  }
}

function reveal() {
  if (!loggedInPlayer || !loggedInPlayer.gameStarted) return;
  document.getElementById("status").innerHTML =
    `🎭 Your Role: <b>${loggedInPlayer.role}</b>`;
}

function hide() {
  document.getElementById("status").innerText = "🔒 Role hidden";
}

function logout() {
  location.reload();
}

/* ================= GOD ================= */

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: playerName.value
    })
  });
  playerName.value = "";
  loadPlayers();
}

async function assignRole(name, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role })
  });
  loadPlayers();
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
}

async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
  loadPlayers();
}

async function loadPlayers() {
  const res = await fetch("/players");
  const players = await res.json();

  table.innerHTML = "";

  players.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.pin}</td>
        <td>${p.role}</td>
        <td>
          <select onchange="assignRole('${p.name}', this.value)">
            <option ${p.role === "Villager" ? "selected" : ""}>Villager</option>
            <option ${p.role === "Mafia" ? "selected" : ""}>Mafia</option>
            <option ${p.role === "Detective" ? "selected" : ""}>Detective</option>
            <option ${p.role === "Doctor" ? "selected" : ""}>Doctor</option>
          </select>
        </td>
        <td>
          <button onclick="navigator.clipboard.writeText('${p.name} / ${p.pin}')">
            Copy
          </button>
        </td>
      </tr>`;
  });
}

/* Auto-load only on admin page */
if (typeof table !== "undefined") {
  loadPlayers();
}
