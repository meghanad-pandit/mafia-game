async function godLogin() {
  const key = document.getElementById("godKey").value.trim();
  const godError = document.getElementById("godError");
  godError.innerText = "";

  if (!key) {
    godError.innerText = "Please enter the God Key";
    return;
  }

  try {
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
  } catch {
    godError.innerText = "Network error, try again.";
  }
}

async function addPlayer() {
  const playerNameInput = document.getElementById("playerName");
  const name = playerNameInput.value.trim();
  if (!name) return alert("Please enter player name");

  try {
    await fetch("/addPlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    playerNameInput.value = "";
    loadPlayers();
  } catch {
    alert("Failed to add player");
  }
}

async function deletePlayer(key) {
  if (!confirm("Are you sure you want to delete this player?")) return;

  try {
    await fetch("/deletePlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });
    loadPlayers();
  } catch {
    alert("Failed to delete player");
  }
}

async function changeRole(key, role) {
  try {
    await fetch("/assignRole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, role })
    });
    loadPlayers();
  } catch {
    alert("Failed to change role");
  }
}

async function startGame() {
  try {
    await fetch("/startGame", { method: "POST" });
    document.getElementById("startBtn").disabled = true;
    loadPlayers();
  } catch {
    alert("Failed to start game");
  }
}

async function resetGame() {
  if (!confirm("Are you sure you want to reset the game? All roles will reset.")) return;

  try {
    await fetch("/resetGame", { method: "POST" });
    document.getElementById("startBtn").disabled = false;
    loadPlayers();
  } catch {
    alert("Failed to reset game");
  }
}

async function loadPlayers() {
  try {
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
            <button onclick
