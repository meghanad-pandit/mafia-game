let gameStarted = false;

async function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  if (!name) return;

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  document.getElementById("playerName").value = "";
  loadPlayers();
}

async function changeRole(key, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, role })
  });
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
  loadPlayers();
}

async function resetGame() {
  await fetch("/resetGame", { method: "POST" });
  loadPlayers();
}

function copyKey(key) {
  navigator.clipboard.writeText(key);
  alert("Game key copied");
}

async function loadPlayers() {
  const table = document.getElementById("playerTable");
  if (!table) return;

  const res = await fetch("/players");
  const data = await res.json();

  gameStarted = data.gameStarted;
  table.innerHTML = "";

  data.players.forEach(p => {
    table.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.key} <button onclick="copyKey('${p.key}')">📋</button></td>
        <td>
          <select onchange="changeRole('${p.key}', this.value)" ${gameStarted ? "disabled" : ""}>
            ${["Villager","Mafia","Doctor","Detective"]
              .map(r => `<option ${p.role===r?"selected":""}>${r}</option>`).join("")}
          </select>
        </td>
      </tr>
    `;
  });

  const startBtn = document.getElementById("startBtn");
  if (startBtn) startBtn.disabled = gameStarted;
}

document.addEventListener("DOMContentLoaded", loadPlayers);
