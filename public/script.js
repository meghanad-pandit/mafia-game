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

  loggedInPlayer = { name, pin };

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText = "Welcome, " + name;

  document.getElementById("status").innerText =
    "⏳ Waiting for God to start";
}

async function reveal() {
  if (!loggedInPlayer) return;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loggedInPlayer)
  });

  if (!res.ok) {
    alert("Game reset by God. Logging out.");
    logout();
    return;
  }

  const data = await res.json();

  if (!data.gameStarted) {
    document.getElementById("status").innerText =
      "⏳ Game not started yet";
    return;
  }

  // vibration (safe)
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

  // sound (safe + optional)
  try {
    const audio = new Audio("/sounds/reveal.mp3");
    audio.play().catch(() => {});
  } catch (e) {}

  document.getElementById("status").innerHTML = `
    <div class="card">
      <h2>${data.role}</h2>
      <img src="/images/${data.role.toLowerCase()}.png"
           onerror="this.style.display='none'">
    </div>
  `;
}

function hide() {
  document.getElementById("status").innerText = "🔒 Role hidden";
}

function logout() {
  location.reload();
}

/* ================= GOD LOGIN ================= */

async function godLogin() {
  const password = document.getElementById("godPassword").value;

  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  if (!res.ok) {
    document.getElementById("godError").innerText =
      "❌ Invalid password";
    return;
  }

  document.getElementById("godLogin").style.display = "none";
  document.getElementById("panel").style.display = "block";

  loadPlayers();
}

function godLogout() {
  location.reload();
}

/* ================= GOD ACTIONS ================= */

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value })
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
            ${["Villager","Mafia","Detective","Doctor"]
              .map(r =>
                `<option ${p.role === r ? "selected" : ""}>${r}</option>`
              ).join("")}
          </select>
        </td>
        <td>
          <button onclick="navigator.clipboard.writeText(
            'Username: ${p.name} | PIN: ${p.pin}'
          )">
            Copy
          </button>
        </td>
      </tr>
    `;
  });
}
