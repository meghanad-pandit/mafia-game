async function addPlayer() {
  const res = await fetch("/addPlayer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: playerName.value,
      pin: playerPin.value
    })
  });
  list.innerText = JSON.stringify(await res.json(), null, 2);
}

async function assignRole() {
  const res = await fetch("/assignRole", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: assignName.value,
      role: role.value
    })
  });
  list.innerText = JSON.stringify(await res.json(), null, 2);
}

async function startGame() {
  await fetch("/startGame", { method: "POST" });
  alert("Game Started");
}

async function resetGame() {
  const res = await fetch("/reset", { method: "POST" });
  list.innerText = JSON.stringify(await res.json(), null, 2);
}

async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      pin: pin.value
    })
  });

  const data = await res.json();

  if (!data.started) {
    result.innerText = "⏳ Waiting for game to start";
    return;
  }

  result.innerHTML = "🎭 Your Role: <b>" + data.role + "</b>";

  setTimeout(() => {
    result.innerText = "🔒 Role hidden";
  }, 5000);
}
