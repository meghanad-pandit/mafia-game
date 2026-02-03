let loggedInPlayer = null;
let interval = null;

/* PLAYER */
async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      pin: pin.value
    })
  });

  if (!res.ok) {
    loginError.innerText = "Invalid login";
    return;
  }

  loggedInPlayer = await res.json();
  loginBox.classList.add("hidden");
  gameBox.classList.remove("hidden");
  playerName.innerText = "Hi " + loggedInPlayer.name;

  interval = setInterval(updateState, 2000);
}

async function updateState() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: loggedInPlayer.name,
      pin: loggedInPlayer.pin
    })
  });

  loggedInPlayer = await res.json();
}

function reveal() {
  if (!loggedInPlayer.gameStarted) return;

  roleText.innerText = loggedInPlayer.role;
  roleImg.src = `/images/${loggedInPlayer.role.toLowerCase()}.svg`;
  roleCard.classList.add("show");

  playSound();
  navigator.vibrate?.([200, 100, 200]);
}

function hide() {
  roleCard.classList.remove("show");
}

/* SOUND */
function playSound() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = 600;
  osc.connect(ctx.destination);
  osc.start();
  setTimeout(() => osc.stop(), 300);
}

/* GOD */
async function godLogin() {
  await fetch("/godLogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: godPass.value })
  });
}

async function addPlayer() {
  await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName.value })
  });
  loadPlayers();
}

async function setRoles() {
  await fetch("/setRoles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Mafia: +mafia.value,
      Doctor: +doctor.value,
      Detective: +detective.value
    })
  });
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
}

async function resetPlayers() {
  await fetch("/resetPlayers", { method: "POST" });
}

async function loadPlayers() {
  const res = await fetch("/players");
  const players = await res.json();
  table.innerHTML = players.map(p =>
    `<tr><td>${p.name}</td><td>${p.pin}</td><td>${p.role}</td></tr>`
  ).join("");
}

if (typeof table !== "undefined") loadPlayers();
