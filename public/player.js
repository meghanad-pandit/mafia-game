let role = "";
let revealed = false;
let notified = false;

async function login() {
  const key = document.getElementById("key").value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  if (!res.ok) return alert("Invalid Key");

  const data = await res.json();
  role = data.role;

  document.getElementById("login").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  if (data.gameStarted) gameStarted();
  else waitForStart();
}

function gameStarted() {
  document.getElementById("status").innerText =
    "🎉 Game Started! Ready to reveal?";

  document.getElementById("card").classList.remove("hidden");

  if (!notified) {
    try {
      document.getElementById("startSound").play();
    } catch {}
    notified = true;
  }
}

function toggleRole() {
  revealed = !revealed;

  document.getElementById("roleText").innerText =
    revealed ? role : "❓";

  document.getElementById("roleImg").src =
    revealed ? `images/${role.toLowerCase()}.png` : "";
}

function waitForStart() {
  document.getElementById("status").innerText =
    "🕵️ Waiting... God is planning something evil 😈";

  setInterval(async () => {
    const res = await fetch("/status");
    const data = await res.json();

    if (data.gameStarted) gameStarted();
  }, 2000);
}

function logout() {
  location.reload();
}
