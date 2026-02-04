let role = "";
let revealed = false;
let started = false;

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

  loginBox.style.display = "none";
  gameBox.style.display = "block";

  if (!started) wait();
  else status.innerText = "🎉 Game Started!";
}

function toggle() {
  if (!started) return;

  revealed = !revealed;
  status.innerText = revealed ? `🎭 Your role: ${role}` : "🤫 Role hidden";
}

function wait() {
  status.innerText = "⏳ Waiting for God...";
  setInterval(async () => {
    const res = await fetch("/status");
    const s = await res.json();
    if (s.gameStarted) {
      started = true;
      status.innerText = "🎉 Game Started!";
    }
  }, 2000);
}

function logout() {
  location.reload();
}
