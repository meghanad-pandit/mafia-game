/**************** GLOBAL ****************/

let loggedInPlayer = null;
let isGod = false;

/**************** PLAYER SECTION ****************/
/**************** GOD LOGIN ****************/

async function godLogin() {
  const keyInput = document.getElementById("godKey");
  const errorBox = document.getElementById("godError");

  if (!keyInput || !keyInput.value.trim()) {
    if (errorBox) errorBox.innerText = "❌ Enter God Key";
    return;
  }

  try {
    const res = await fetch("/god/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: keyInput.value.trim() })
    });

    if (!res.ok) throw new Error("Invalid key");

    // success
    document.getElementById("godLogin").style.display = "none";
    document.getElementById("godPanel").style.display = "block";

    loadPlayers();
  } catch (e) {
    if (errorBox) errorBox.innerText = "❌ Invalid God Key";
  }
}

async function login() {
  const name = document.getElementById("name")?.value.trim();
  const pin = document.getElementById("pin")?.value.trim();
  const errorBox = document.getElementById("loginError");

  if (!name || !pin) {
    errorBox.innerText = "❌ Enter name & PIN";
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin })
    });

    if (!res.ok) throw new Error("Invalid credentials");

    loggedInPlayer = await res.json();

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("gameBox").style.display = "block";

    document.getElementById("playerName").innerText =
      `Hi ${loggedInPlayer.name} 👋`;

    updatePlayerUI();
  } catch (e) {
    errorBox.innerText = "❌ Invalid Name or PIN";
  }
}

function updatePlayerUI() {
  const status = document.getElementById("status");

  if (!loggedInPlayer.gameStarted) {
    status.innerText = "😂 Waiting for God to start the game...";
  } else {
    status.innerText = "🎭 Game Started! Click Reveal";
  }
}

function reveal() {
  if (!loggedInPlayer?.gameStarted) return;

  const role = loggedInPlayer.role || "Villager";
  const status = document.getElementById("status");

  status.innerHTML = `
    <div class="role-card">
      <h2>${role}</h2>
      <img src="images/${role.toLowerCase()}.png"
           onerror="this.style.display='none'"
           style="max-width:120px">
    </div>
  `;
}

function hide() {
  document.getElementById("status").innerText =
    "🙈 Role hidden. Stay sharp!";
}

function logout() {
  location.reload();
}

/**************** GOD SECTION ****************/

async function addPlayer() {
  const name = playerName.value.trim();
  const pin = playerPin.value.trim();

  if (!name || !pin) {
    alert("Enter name & PIN");
    return;
  }

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, pin })
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

  try {
    const sound = new Audio("sounds/start.mp3");
    sound.play().catch(() => {});
  } catch {}

  alert("🎮 Game Started!");
}

async function restartGame() {
  await fetch("/restartGame", { method: "POST" });
  alert("🔄 Game Restarted. Players waiting...");
}

async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
  loadPlayers();
}

async function loadPlayers() {
  try {
    const res = await fetch("/players");
    const players = await res.json();

    if (!window.table) return;

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
                  `<option ${p.role===r?"selected":""}>${r}</option>`
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
  } catch (e) {
    console.error("Failed loading players", e);
  }
}

/**************** AUTO INIT ****************/

if (typeof table !== "undefined") {
  loadPlayers();
}
