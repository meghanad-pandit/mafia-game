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
    "Welcome, " + loggedInPlayer.name;

  updateStatus();
}

function updateStatus() {
  const status = document.getElementById("status");

  if (!loggedInPlayer.gameStarted) {
    status.innerText = "⏳ Waiting for God to start";
  } else {
    status.innerText = "🎭 Tap Reveal to see your role";
  }
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;

  const role = loggedInPlayer.role;
  const status = document.getElementById("status");

  // vibration (safe)
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

  // sound (safe)
  try {
    new Audio("/sounds/reveal.mp3").play();
  } catch (e) {}

  status.innerHTML = `
    <div class="card">
      <h2>${role}</h2>
      <img src="/images/${role.toLowerCase()}.png"
           onerror="this.style.display='none'" />
    </div>
  `;
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
    body: JSON.stringify({ name: playerName.value })
  });
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
          <button onclick="navigator.clipboard.writeText('${p.name} / ${p.pin}')">
            Copy
          </button>
        </td>
      </tr>
    `;
  });
}

if (typeof table !== "undefined") loadPlayers();
