let currentPlayer = null;

async function login() {
  currentPlayer = {
    name: name.value,
    pin: pin.value
  };
  loginBox.style.display = "none";
  gameBox.style.display = "block";
  setInterval(fetchState, 2000);
}

async function fetchState() {
  const res = await fetch("/playerState", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentPlayer)
  });
  const data = await res.json();

  if (!data.gameStarted) {
    status.innerText = "⏳ Waiting for God to start";
  } else {
    status.innerText = "🎭 Click Reveal";
    window.currentRole = data.role;
  }
}

function reveal() {
  status.innerHTML = "🎭 Your Role: <b>" + window.currentRole + "</b>";
}

function hide() {
  status.innerText = "🔒 Role hidden";
}

/* GOD FUNCTIONS */

async function addPlayer() {
  const res = await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value, pin: playerPin.value })
  });
  list.innerText = JSON.stringify(await res.json(), null, 2);
}

async function assignRole() {
  const res = await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: assignName.value, role: role.value })
  });
  list.innerText = JSON.stringify(await res.json(), null, 2);
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
}

async function restartGame() {
  await fetch("/restartGame", { method: "POST" });
}

async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
  list.innerText = "Players reset";
}
