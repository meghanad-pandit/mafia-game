let currentPlayerKey = null;

/* ---------- GOD LOGIN ---------- */
async function handleGodLogin() {
  const key = document.getElementById("godKey").value.trim();
  const error = document.getElementById("godError");

  try {
    const res = await fetch("/god/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    if (!res.ok) throw new Error();

    document.getElementById("godLoginBox").style.display = "none";
    document.getElementById("godPanel").style.display = "block";
    loadPlayers();
  } catch {
    error.innerText = "❌ Invalid God Key";
  }
}

/* ---------- GOD ACTIONS ---------- */
async function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return alert("Enter player name");

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  document.getElementById("playerName").value = "";
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
  gameStarted = true;
  loadPlayers();
}


async function resetGame() {
  await fetch("/restartGame", { method: "POST" });
  alert("♻️ Game Reset!");
  gameStarted = false;
  loadPlayers();
}



async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
  loadPlayers();
}

async function loadPlayers() {
  const res = await fetch("/players");
  const players = await res.json();

  const table = document.getElementById("playerTable");
  table.innerHTML = "";

  players.forEach(p => {
    const disabled = gameStarted ? "disabled" : "";

    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.key}</td>
        <td>
          <select onchange="changeRole('${p.key}', this.value)" ${disabled}>
            ${["Villager", "Mafia", "Doctor", "Detective"]
              .map(r => `<option ${p.role === r ? "selected" : ""}>${r}</option>`)
              .join("")}
          </select>
        </td>
      </tr>
    `;
  });

  // Disable Start button if game started
  document.getElementById("startBtn").disabled = gameStarted;
}


/* ---------- PLAYER ---------- */
async function playerLogin() {
  const key = document.getElementById("playerKeyInput").value.trim();
  const error = document.getElementById("loginError");

  try {
    const res = await fetch("/player/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });

    if (!res.ok) throw new Error();

    const data = await res.json();
    currentPlayerKey = key;

    document.getElementById("loginBox").style.display = "none";
    document.getElementById("gameBox").style.display = "block";
    document.getElementById("playerName").innerText =
      `Hi ${data.name} 👋`;

    updateStatus(data);
  } catch {
    error.innerText = "❌ Invalid Game Key";
  }
}

async function syncState() {
  const res = await fetch("/player/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: currentPlayerKey })
  });
  return res.json();
}

async function reveal() {
  const data = await syncState();
  if (!data.gameStarted) {
    document.getElementById("status").innerText =
      "😂 Game not started yet!";
    return;
  }

  document.getElementById("status").innerHTML = `
    <h3>${data.role}</h3>
    <img src="images/${data.role.toLowerCase()}.png"
         onerror="this.style.display='none'"
         style="max-width:120px">
  `;
}

function hide() {
  document.getElementById("status").innerText =
    "🙈 Role hidden. Stay sneaky!";
}

function updateStatus(data) {
  document.getElementById("status").innerText =
    data.gameStarted
      ? "🎭 Game started! Reveal your role"
      : "😂 Waiting for God to start...";
}

function logout() {
  location.reload();
}
