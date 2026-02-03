let loggedInPlayer = null;
let roleVisible = false;

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
      "❌ Wrong name or PIN 😜";
    return;
  }

  loggedInPlayer = { name, pin };
  roleVisible = false;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText =
    "🎭 Welcome " + name;

  showWaiting();
}

function showWaiting() {
  document.getElementById("status").innerText =
    "⏳ Waiting for God... plotting something 😈";
}

async function reveal() {
  if (!loggedInPlayer) return;

  // Toggle hide
  if (roleVisible) {
    roleVisible = false;
    showWaiting();
    return;
  }

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loggedInPlayer)
  });

  if (!res.ok) {
    alert("Game reset by God 👑");
    logout();
    return;
  }

  const data = await res.json();

  if (!data.gameStarted) {
    showWaiting();
    return;
  }

  // 🔔 Notify game start (sound + vibration)
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);

  try {
    new Audio("/sounds/start.mp3").play().catch(() => {});
  } catch {}

  roleVisible = true;

  document.getElementById("status").innerHTML = `
    <div class="card">
      <h3>🤫 Your Secret Role</h3>
      <h1>${data.role}</h1>
      <img src="/images/${data.role.toLowerCase()}.png"
           onerror="this.style.display='none'">
      <p style="opacity:0.8">Tap button again to hide</p>
    </div>
  `;
}

function logout() {
  location.reload();
}

/* ================= GOD ================= */

async function godLogin() {
  const password = document.getElementById("godPassword").value;

  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });

  if (!res.ok) {
    document.getElementById("godError").innerText =
      "❌ Wrong password";
    return;
  }

  document.getElementById("godLogin").style.display = "none";
  document.getElementById("panel").style.display = "block";
  loadPlayers();
}

function godLogout() {
  location.reload();
}

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

async function restartGame() {
  await fetch("/restartGame", { method: "POST" });
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
          )">Copy</button>
        </td>
      </tr>
    `;
  });
}
