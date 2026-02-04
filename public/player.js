let role = "";
let revealed = false;
let started = false;
let notified = false;

const waitingMessages = [
  "🕵️ God is choosing chaos...",
  "😈 Mafia is sharpening knives...",
  "🤫 Shhh... secrets everywhere!",
  "🎲 Destiny is loading..."
];

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: key.value })
  });

  if (!res.ok) return alert("Invalid key");

  const data = await res.json();

  role = data.role;
  started = data.gameStarted;

  greeting.innerText = `Hey ${data.name} 😎`;
  loginBox.style.display = "none";
  gameBox.style.display = "block";

  if (started) onGameStart();
  else waitForGame();
}

function onGameStart() {
  status.innerText = "🎉 Game Started! Tap Reveal!";
  if (!notified) {
    try { startSound.play(); } catch {}
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    notified = true;
  }
}

function toggle() {
  if (!started) return;

  revealed = !revealed;

  if (revealed) {
    status.innerText = `🎭 You are a ${role}`;
    roleImg.src = `images/${role.toLowerCase()}.png`;
    roleImg.style.display = "block";
  } else {
    status.innerText = "🤫 Role hidden. Act cool.";
    roleImg.style.display = "none";
  }
}

function waitForGame() {
  status.innerText =
    waitingMessages[Math.floor(Math.random() * waitingMessages.length)];

  setInterval(async () => {
    const res = await fetch("/status");
    const s = await res.json();
    if (s.gameStarted) {
      started = true;
      onGameStart();
    }
  }, 2500);
}

function logout() {
  location.reload();
}
