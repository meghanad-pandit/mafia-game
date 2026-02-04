/* ================== GOD ================== */

async function godLogin() {
  const key = document.getElementById("godKey").value.trim();
  const godError = document.getElementById("godError");
  godError.innerText = "";

  if (!key) {
    godError.innerText = "Please enter the God Key";
    return;
  }

  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    godError.innerText = "❌ Invalid God Key";
    return;
  }

  document.getElementById("godLogin").style.display = "none";
  document.getElementById("godPanel").style.display = "block";

  loadPlayers();
}

async function addPlayer() {
  const playerNameInput = document.getElementById("playerName");
  const name = playerNameInput.value.trim();
  if (!name) return alert("Please enter player name");

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  playerNameInput.value = "";
  loadPlayers();
}

async function deletePlayer(key) {
  if (!confirm("Are you sure you want to delete this player?")) return;

  await fetch("/deletePlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  loadPlayers();
}

async function changeRole(key, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, role })
  });

  loadPlayers();
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });

  document.getElementById("startBtn").disabled = true;
  loadPlayers();
}

async function resetGame() {
  if (!confirm("Are you sure you want to reset the game? All roles will reset.")) return;

  await fetch("/resetGame", { method: "POST" });

  document.getElementById("startBtn").disabled = false;
  loadPlayers();
}

async function loadPlayers() {
  const res = await fetch("/players");
  if (!res.ok) return;

  const data = await res.json();

  const table = document.getElementById("playerTable");
  table.innerHTML = "";

  data.players.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>
          ${p.key}
          <button onclick="navigator.clipboard.writeText('${p.key}')">📋</button>
        </td>
        <td>
          <select onchange="changeRole('${p.key}', this.value)" ${data.gameStarted ? "disabled" : ""}>
            <option ${p.role === "Villager" ? "selected" : ""}>Villager</option>
            <option ${p.role === "Mafia" ? "selected" : ""}>Mafia</option>
            <option ${p.role === "Doctor" ? "selected" : ""}>Doctor</option>
            <option ${p.role === "Detective" ? "selected" : ""}>Detective</option>
          </select>
        </td>
        <td>
          <button class="deleteBtn" onclick="deletePlayer('${p.key}')">❌</button>
        </td>
      </tr>
    `;
  });

  if (data.gameStarted) {
    document.getElementById("startBtn").disabled = true;
  } else {
    document.getElementById("startBtn").disabled = false;
  }
}

function logout() {
  location.reload();
}
