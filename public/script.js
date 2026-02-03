let loggedInPlayer = null;
let godToken = localStorage.getItem("godToken");
let playerInterval = null;

/* ================= PLAYER ================= */

async function login() {
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
  playerName.innerText = "Hi " + loggedInPlayer.name;

  updatePlayerState();
  playerInterval = setInterval(updatePlayerState, 2000);
}

async function updatePlayerState() {
  if (!loggedInPlayer) return;

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
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;

  roleText.innerText = loggedInPlayer.role;
  roleImg.src = `/images/${loggedInPlayer.role.toLowerCase()}.svg`;
  roleCard.classList.add("show");

  navigator.vibrate?.([200, 100, 200]);
}

/* ================= GOD ================= */

async function godLogin() {
  const res = await fetch("/godLogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: godPass.value })
  });

  if (!res.ok) {
    alert("Invalid God Password");
    return;
  }

  const data = await res.json();
  godToken = data.token;
  localStorage.setItem("godToken", godToken);
  alert("God Logged In");
  loadPlayers();
}

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-god-token": godToken
    },
    body: JSON.stringify({ name: playerName.value })
  });

  playerName.value = "";
  loadPlayers();
}

async function assignRole(name, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-god-token": godToken
    },
    body: JSON.stringify({ name, role })
  });

  loadPlayers();
}

async function startGame() {
  await fetch("/startGame", {
    method: "POST",
    headers: { "x-god-token": godToken }
  });
}

async function resetPlayers() {
  await fetch("/resetPlayers", {
    method: "POST",
    headers: { "x-god-token": godToken }
  });

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

if (typeof table !== "undefined") loadPlayers();
