// Make godLogin global so admin.html can access it
window.godLogin = async function() {
  const keyInput = document.getElementById("godKey");
  const errorP = document.getElementById("godLoginError");
  const godKey = keyInput.value.trim();

  errorP.textContent = "";

  if (!godKey) {
    errorP.textContent = "Please enter the God Key";
    return;
  }

  try {
    const res = await fetch("/god/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: godKey })
    });

    if (!res.ok) {
      errorP.textContent = "❌ Invalid God Key";
      return;
    }

    // Hide login, show admin panel
    document.getElementById("godLoginDiv").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";

    loadPlayers();

  } catch (e) {
    errorP.textContent = "Error connecting to server";
  }
};

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

    players.forEach(p => {
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

      // Role dropdown (with change role)
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
      roleSelect.disabled = gameStarted; // disable if game started
      roleSelect.addEventListener("change", async (e) => {
        await assignRole(p.key, e.target.value);
      });
      roleTd.appendChild(roleSelect);
      tr.appendChild(roleTd);

      // Delete trash icon button
      const deleteTd = document.createElement("td");
      const delBtn = document.createElement("button");
      delBtn.innerHTML = "🗑️"; // trash icon emoji
      delBtn.title = `Delete player "${p.name}"`;
      delBtn.classList.add("delete-btn");
      delBtn.onclick = async () => {
        if (confirm(`Delete player "${p.name}"?`)) {
          await deletePlayer(p.key);
        }
      };
      deleteTd.appendChild(delBtn);
      tr.appendChild(deleteTd);

      tbody.appendChild(tr);
    });
  } catch (err) {
    alert("Error loading players");
  }
}

function showCopyFeedback(element) {
  const originalText = element.textContent;
  element.textContent = "Copied!";
  setTimeout(() => {
    element.textContent = originalText;
  }, 1500);
}

async function addPlayer() {
  const input = document.getElementById("playerName");
  const name = input.value.trim();
  if (!name) {
    alert("Please enter player name");
    return;
  }

  try {
    const res = await fetch("/addPlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (!res.ok) throw new Error("Failed to add player");

    input.value = "";
    loadPlayers();

  } catch {
    alert("Error adding player");
  }
}

async function assignRole(key, role) {
  try {
    await fetch("/assignRole", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, role })
    });
    loadPlayers();
  } catch {
    alert("Error assigning role");
  }
}

async function deletePlayer(key) {
  try {
    await fetch("/deletePlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key })
    });
    loadPlayers();
  } catch {
    alert("Error deleting player");
  }
}

async function deleteAllPlayers() {
  if (!confirm("Are you sure you want to delete ALL players?")) return;

  try {
    const res = await fetch("/players");
    if (!res.ok) throw new Error("Failed to load players");

    const data = await res.json();
    const players = data.players;

    for (const p of players) {
      await fetch("/deletePlayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: p.key }),
      });
    }

    loadPlayers();
  } catch {
    alert("Error deleting all players");
  }
}

async function startGame() {
  try {
    const res = await fetch("/startGame", { method: "POST" });
    if (!res.ok) throw new Error("Failed to start game");

    loadPlayers();

    alert("Game started! Players will be notified.");
  } catch {
    alert("Error starting game");
  }
}

async function resetGame() {
  if (!confirm("Are you sure you want to reset the game? All roles will be reset to Villager.")) return;

  try {
    const res = await fetch("/resetGame", { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset game");

    loadPlayers();

    alert("Game reset! Roles are now all Villagers and players will be notified.");
  } catch {
    alert("Error resetting game");
  }
}

// Attach event listener to delete all button
document.getElementById("deleteAllBtn").addEventListener("click", deleteAllPlayers);
