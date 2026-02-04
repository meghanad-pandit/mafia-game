let currentPlayer = null;
let gameStarted = false;

/* ---------- GOD ---------- */
async function godLogin() {
  const key = godKey.value;
  const r = await fetch("/god/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });
  if (r.ok) {
    godLoginDiv.style.display = "none";
    godPanel.classList.remove("hidden");
    loadPlayers();
  } else alert("❌ Invalid God Key");
}

async function addPlayer() {
  const name = playerName.value;
  const r = await fetch("/player/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  playerName.value = "";
  loadPlayers();
}

async function loadPlayers() {
  const r = await fetch("/players");
  const data = await r.json();
  playerTable.innerHTML = "";
  data.forEach(p => {
    playerTable.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.key}</td>
        <td>${p.role}</td>
        <td><button onclick="deletePlayer('${p.key}')">❌</button></td>
      </tr>`;
  });
}

function startGame() {
  fetch("/game/start", { method: "POST" });
  gameStarted = true;
  alert("🎮 Game Started");
}

function resetGame() {
  fetch("/game/reset", { method: "POST" });
  location.reload();
}

function deletePlayer(key) {
  fetch("/player/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  }).then(loadPlayers);
}

/* ---------- PLAYER ---------- */
async function playerLogin() {
  const key = playerKey.value;
  const r = await fetch("/player/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });
  if (!r.ok) return alert("Invalid Key");

  currentPlayer = await r.json();
  document.querySelector(".login").style.display = "none";
  playerScreen.classList.remove("hidden");
  welcome.innerText = `Hi ${currentPlayer.name} 👋`;

  if (navigator.vibrate) navigator.vibrate([200,100,200]);
  startSound.play().catch(()=>{});
}

async function toggleReveal() {
  const r = await fetch("/player/reveal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: currentPlayer.key })
  });
  const p = await r.json();

  if (p.revealed) {
    waiting.classList.add("hidden");
    roleCard.classList.remove("hidden");
    roleText.innerText = p.role.toUpperCase();
    roleImg.src = `images/${p.role}.png`;
  } else {
    roleCard.classList.add("hidden");
    waiting.classList.remove("hidden");
  }
}
