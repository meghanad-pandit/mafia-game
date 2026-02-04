let playerKey = null;

/* ---------------- GOD ---------------- */

async function godLogin() {
  try {
    const res = await fetch("/god/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: godKey.value })
    });

    if (!res.ok) throw new Error();

    godLogin.style.display = "none";
    godPanel.style.display = "block";
    loadPlayers();
  } catch {
    godError.innerText = "❌ Invalid God Key";
  }
}

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value })
  });
  loadPlayers();
}

async function assignRole(key, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, role })
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
        <td>${p.key}</td>
        <td>${p.role}</td>
        <td>
          <select onchange="assignRole('${p.key}', this.value)">
            <option ${p.role==="Villager"?"selected":""}>Villager</option>
            <option ${p.role==="Mafia"?"selected":""}>Mafia</option>
            <option ${p.role==="Detective"?"selected":""}>Detective</option>
            <option ${p.role==="Doctor"?"selected":""}>Doctor</option>
          </select>
        </td>
        <td>
          <button onclick="navigator.clipboard.writeText('${p.key}')">Copy</button>
        </td>
      </tr>
    `;
  });
}

/* ---------------- PLAYER ---------------- */

async function playerLogin() {
  playerKey = playerKeyInput.value;

  try {
    const res = await fetch("/player/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: playerKey })
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    loginBox.style.display = "none";
    gameBox.style.display = "block";
    playerName.innerText = `Hi ${data.name} 👋`;
    updateStatus(data);
  } catch {
    loginError.innerText = "❌ Invalid Game Key";
  }
}

async function syncState() {
  const res = await fetch("/player/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: playerKey })
  });
  return res.json();
}

async function reveal() {
  const data = await syncState();
  if (!data.gameStarted) {
    status.innerText = "😂 Game not started yet!";
    return;
  }

  status.innerHTML = `
    <h3>${data.role}</h3>
    <img src="images/${data.role.toLowerCase()}.png"
      onerror="this.style.display='none'"
      style="max-width:120px">
  `;
}

function hide() {
  status.innerText = "🙈 Role hidden. Stay sneaky!";
}

function updateStatus(data) {
  status.innerText = data.gameStarted
    ? "🎭 Game started! Reveal your role"
    : "😂 Waiting for God to start...";
}

function logout() {
  location.reload();
}
