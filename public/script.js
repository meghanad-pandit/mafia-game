let loggedInPlayer = null;

/* ---------------- GOD LOGIN ---------------- */

async function godLogin() {
  const key = document.getElementById("godKey").value;
  const error = document.getElementById("godError");

  try {
    const res = await fetch("/god/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    if (!res.ok) throw new Error();

    document.getElementById("godLogin").style.display = "none";
    document.getElementById("godPanel").style.display = "block";
    loadPlayers();
  } catch {
    error.innerText = "❌ Invalid God Key";
  }
}

/* ---------------- PLAYER ---------------- */

async function login() {
  const name = document.getElementById("name").value;
  const pin = document.getElementById("pin").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, pin })
    });

    if (!res.ok) throw new Error();

    loggedInPlayer = await res.json();

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("gameBox").style.display = "block";
    document.getElementById("playerName").innerText =
      `Hi ${loggedInPlayer.name} 👋`;

    updateStatus();
  } catch {
    document.getElementById("loginError").innerText =
      "❌ Invalid Name or PIN";
  }
}

function updateStatus() {
  const status = document.getElementById("status");
  if (!loggedInPlayer.gameStarted) {
    status.innerText = "😂 Waiting for God to start the game...";
  } else {
    status.innerText = "🎉 Game started! Click Reveal";
  }
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;

  const role = loggedInPlayer.role || "Villager";
  document.getElementById("status").innerHTML = `
    <h3>${role}</h3>
    <img src="images/${role.toLowerCase()}.png"
      onerror="this.style.display='none'"
      style="max-width:120px">
  `;
}

function hide() {
  document.getElementById("status").innerText =
    "🙈 Role hidden. Stay cool!";
}

function logout() {
  location.reload();
}

/* ---------------- GOD ACTIONS ---------------- */

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
  alert("🎮 Game Started!");
}

async function restartGame() {
  await fetch("/restartGame", { method: "POST" });
  alert("🔄 Game Restarted!");
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
            <option ${p.role==="Villager"?"selected":""}>Villager</option>
            <option ${p.role==="Mafia"?"selected":""}>Mafia</option>
            <option ${p.role==="Detective"?"selected":""}>Detective</option>
            <option ${p.role==="Doctor"?"selected":""}>Doctor</option>
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
