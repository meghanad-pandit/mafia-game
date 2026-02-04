let killedPlayers = new Set(); // keep track of killed players keys

async function loadPlayers() {
  const tbody = document.getElementById("playersTableBody");
  tbody.innerHTML = "";

  try {
    const res = await fetch("/players");
    if (!res.ok) throw new Error("Failed to load players");

    const data = await res.json();
    const players = data.players;
    const gameStarted = data.gameStarted;

    const startBtn = document.getElementById("startGameBtn");
    startBtn.disabled = gameStarted;

    // Filter out killed players when game started
    const visiblePlayers = gameStarted
      ? players.filter(p => !killedPlayers.has(p.key))
      : players;

    visiblePlayers.forEach(p => {
      const tr = document.createElement("tr");

      // Name
      const nameTd = document.createElement("td");
      nameTd.textContent = p.name;
      tr.appendChild(nameTd);

      // Key (clickable text to copy)
      const keyTd = document.createElement("td");
      keyTd.classList.add("key-cell");
      keyTd.title = "Click to copy key";
      keyTd.textContent = p.key;
      keyTd.onclick = () => {
        navigator.clipboard.writeText(p.key);
        showCopyFeedback(keyTd);
      };
      tr.appendChild(keyTd);

      // Role dropdown (disabled if game started)
      const roleTd = document.createElement("td");
      const roleSelect = document.createElement("select");
      roleSelect.classList.add("role-select");
      ["Villager", "Mafia", "Detective", "Doctor"].forEach(roleOption => {
        const opt = document.createElement("option");
        opt.value = roleOption;
        opt.textContent = roleOption;
        if (p.role === roleOption) opt.selected = true;
        roleSelect.appendChild(opt);
      });
      roleSelect.disabled = gameStarted; 
      roleSelect.addEventListener("change", async (e) => {
        await assignRole(p.key, e.target.value);
      });
      roleTd.appendChild(roleSelect);
      tr.appendChild(roleTd);

      // Action column: Delete or Kill button
      const actionTd = document.createElement("td");
      const actionBtn = document.createElement("button");
      actionBtn.classList.add("delete-btn"); // you can create a new class for kill button with different color if you want
      
      if (!gameStarted) {
        // Show delete button if game not started
        actionBtn.innerHTML = "🗑️";
        actionBtn.title = `Delete player "${p.name}"`;
        actionBtn.onclick = async () => {
          if (confirm(`Delete player "${p.name}"?`)) {
            await deletePlayer(p.key);
          }
        };
      } else {
        // Show kill button if game started
        actionBtn.innerHTML = "Kill";
        actionBtn.title = `Kill player "${p.name}"`;
        actionBtn.style.backgroundColor = "#e67e22"; // orange color for kill button
        actionBtn.onclick = async () => {
          if (confirm(`Are you sure you want to kill "${p.name}"?`)) {
            await killPlayer(p.key);
          }
        };
      }

      actionTd.appendChild(actionBtn);
      tr.appendChild(actionTd);

      tbody.appendChild(tr);
    });
  } catch (err) {
    alert("Error loading players");
  }
}

async function killPlayer(key) {
  try {
    // Call server to mark player as killed (you must implement this)
    const res = await fetch("/killPlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });

    if (!res.ok) throw new Error("Failed to kill player");

    killedPlayers.add(key); // add to killed set
    loadPlayers(); // reload visible players (killed ones hidden)
  } catch {
    alert("Error killing player");
  }
}

// Update resetGame to clear killedPlayers
async function resetGame() {
  if (!confirm("Are you sure you want to reset the game? All roles will be reset to Villager.")) return;

  try {
    const res = await fetch("/resetGame", { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset game");

    killedPlayers.clear(); // reset killed list
    loadPlayers();

    alert("Game reset! Roles are now all Villagers and players will be notified.");
  } catch {
    alert("Error resetting game");
  }
}
