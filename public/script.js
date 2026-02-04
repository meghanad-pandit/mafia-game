async function godLogin() {
  const res = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pass.value })
  });

  if (!res.ok) return alert("Login failed");

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
            <option ${p.role==="Villager"?"selected":""}>Villager</option>
            <option ${p.role==="Mafia"?"selected":""}>Mafia</option>
            <option ${p.role==="Detective"?"selected":""}>Detective</option>
          </select>
        </td>
        <td>
          <button onclick="copyKey('${p.key}')">Copy</button>
        </td>
      </tr>`;
  });
}

function copyKey(key) {
  navigator.clipboard.writeText(key);
  alert("Key copied");
}

async function addPlayer() {
  const name = playerName.value.trim();
  if (!name) return alert("Enter player name");

  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
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
  loadPlayers();
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

async function logout() {
  await fetch("/god/logout", { method: "POST" });
  location.reload();
}
