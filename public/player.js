let player = null;

async function login() {
  const key = document.getElementById("gameKey").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) {
    document.getElementById("error").innerText = "❌ Invalid Key";
    return;
  }

  player = await res.json();

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  document.getElementById("playerName").innerText = `Hi ${player.name} 👋`;

  updateStatus();
}

function updateStatus() {
  document.getElementById("status").innerText =
    player.gameStarted
      ? "🎉 Game started! Reveal your role"
      : "😴 Waiting for God to start...";
}

function reveal() {
  if (!player.gameStarted) return;

  document.getElementById("roleText").innerText = player.role;
  document.getElementById("roleImg").src = `images/${player.role.toLowerCase()}.png`;
  document.getElementById("roleCard").style.display = "block";
}

function hide() {
  document.getElementById("roleCard").style.display = "none";
}

function logout() {
  location.reload();
}
