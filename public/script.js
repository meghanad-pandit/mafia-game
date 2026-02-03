let loggedInPlayer = null;

/* ================= PLAYER ================= */

async function login() {
  loginError.innerText = "";

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      pin: pin.value
    })
  });

  if (!res.ok) {
    loginError.innerText = "❌ Invalid Name or PIN";
    return;
  }

  loggedInPlayer = await res.json();

  loginBox.style.display = "none";
  gameBox.style.display = "block";
  playerName.innerText = "Player: " + loggedInPlayer.name;

  updatePlayerState();
  setInterval(updatePlayerState, 3000);
}

async function updatePlayerState() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: loggedInPlayer.name,
      pin: pin.value
    })
  });

  if (!res.ok) return;

  loggedInPlayer = await res.json();

  if (!loggedInPlayer.gameStarted) {
    status.innerText = "⏳ Waiting for God to start";
  } else {
    status.innerText = "🎭 Ready to reveal";
  }
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;
  status.innerHTML = `🎭 Your Role: <b>${loggedInPlayer.role}</b>`;
}

function hide() {
  status.innerText = "🔒 Role hidden";
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
      name: playerName.value,
      pin: playerPin.value
    })
  });
  loadPlayers();
}

async function assignRole(playerName, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, role })
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
      </tr>
    `;
  });
}

/* Auto-load table ONLY on admin page */
if (typeof table !== "undefined") {
  loadPlayers();
}
