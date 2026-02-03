let currentPlayer = null;

async function login() {
  currentPlayer = {
    name: name.value,
    pin: pin.value
  };
  loginBox.style.display = "none";
  gameBox.style.display = "block";
  setInterval(fetchState, 2000);
}let loggedInPlayer = null;

/* PLAYER */

async function login() {
  loginError.innerText = "";

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.value, pin: pin.value })
  });

  if (!res.ok) {
    loginError.innerText = "❌ Invalid Name or PIN";
    return;
  }

  const data = await res.json();
  loggedInPlayer = data;

  loginBox.style.display = "none";
  gameBox.style.display = "block";
  playerName.innerText = "Player: " + data.name;

  updatePlayerState();
  setInterval(updatePlayerState, 3000);
}

async function updatePlayerState() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: loggedInPlayer.name, pin: pin.value })
  });

  const data = await res.json();
  loggedInPlayer = data;

  status.innerText = data.gameStarted
    ? "🎭 Ready to reveal"
    : "⏳ Waiting for game start";
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;
  status.innerHTML = "🎭 Your Role: <b>" + loggedInPlayer.role + "</b>";
}

function hide() {
  status.innerText = "🔒 Role hidden";
}

function logout() {
  location.reload();
}

/* GOD */

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value, pin: playerPin.value })
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
  const data = await res.json();
  table.innerHTML = "";

  data.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.pin}</td>
        <td>${p.role}</td>
        <td>
          <select onchange="assignRole('${p.name}', this.value)">
            <option>Villager</option>
            <option>Mafia</option>
            <option>Detective</option>
            <option>Doctor</option>
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

async function assignRole(name, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, role })
  });
  loadPlayers();
}

if (typeof table !== "undefined") loadPlayers();


async function fetchState() {
  const res = await fetch("/playerState", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentPlayer)
  });
  const data = await res.json();

  if (!data.gameStarted) {
    status.innerText = "⏳ Waiting for God to start";
  } else {
    status.innerText = "🎭 Click Reveal";
    window.currentRole = data.role;
  }
}

function reveal() {
  status.innerHTML = "🎭 Your Role: <b>" + window.currentRole + "</b>";
}

function hide() {
  status.innerText = "🔒 Role hidden";
}

/* GOD FUNCTIONS */

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: playerName.value,
      pin: playerPin.value
    })
  });
  loadPlayers(); // ✅ refresh table instead
}


async function assignRole() {
  const res = await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: assignName.value, role: role.value })
  });
  list.innerText = JSON.stringify(await res.json(), null, 2);
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
}

async function restartGame() {
  await fetch("/restartGame", { method: "POST" });
}

async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
  list.innerText = "Players reset";
}
