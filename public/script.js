async function godLogin() {
  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pass.value })
  });

  if (!res.ok) return alert("Wrong password");

  loginBox.style.display = "none";
  panel.style.display = "block";
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
          <select onchange="assign('${p.key}', this.value)">
            <option>Villager</option>
            <option>Mafia</option>
            <option>Doctor</option>
            <option>Detective</option>
          </select>
        </td>
        <td>
          <button onclick="copyKey('${p.key}')">📋</button>
        </td>
      </tr>`;
  });
}

function copyKey(key) {
  navigator.clipboard.writeText(key);
  alert("Key copied");
}

async function addPlayer() {
  if (!playerName.value.trim()) return;

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value })
  });

  playerName.value = "";
  loadPlayers();
}

async function assign(key, role) {
  await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, role })
  });
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
}

async function restartGame() {
  await fetch("/restartGame", { method: "POST" });
  loadPlayers();
}

async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
  loadPlayers();
}
