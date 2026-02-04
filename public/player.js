const godKeyInput = document.getElementById('godKeyInput');
const godLoginBtn = document.getElementById('godLoginBtn');
const loginError = document.getElementById('loginError');
const adminControls = document.getElementById('adminControls');
const playersTableBody = document.getElementById('playersTableBody');

const addPlayerBtn = document.getElementById('addPlayerBtn');
const startGameBtn = document.getElementById('startGameBtn');
const resetGameBtn = document.getElementById('resetGameBtn');

let players = [];
let gameStarted = false;

godLoginBtn.onclick = async () => {
  const key = godKeyInput.value.trim();
  loginError.textContent = "";
  if (!key) {
    loginError.textContent = "Please enter the God key";
    return;
  }
  try {
    const res = await fetch('/god/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    if (!res.ok) {
      loginError.textContent = "❌ Invalid God Key";
      return;
    }
    adminControls.style.display = 'block';
    godLoginBtn.disabled = true;
    godKeyInput.disabled = true;
    loadPlayers();
  } catch {
    loginError.textContent = "Error connecting to server";
  }
};

async function loadPlayers() {
  try {
    const res = await fetch('/players');
    const data = await res.json();
    players = data.players || [];
    gameStarted = data.gameStarted || false;

    startGameBtn.disabled = gameStarted;

    playersTableBody.innerHTML = '';

    players.forEach(p => {
      const tr = document.createElement('tr');

      // Name
      const nameTd = document.createElement('td');
      nameTd.textContent = p.name;
      tr.appendChild(nameTd);

      // Key with copy on click
      const keyTd = document.createElement('td');
      keyTd.textContent = p.key;
      keyTd.classList.add('keyCell');
      keyTd.title = 'Click to copy key';
      keyTd.onclick = () => {
        navigator.clipboard.writeText(p.key).then(() => {
          keyTd.classList.add('copied');
          setTimeout(() => keyTd.classList.remove('copied'), 1500);
        });
      };
      tr.appendChild(keyTd);

      // Role select or text
      const roleTd = document.createElement('td');
      if (gameStarted) {
        roleTd.textContent = p.role;
      } else {
        const select = document.createElement('select');
        select.className = 'roleSelect';
        ['Villager', 'Mafia', 'Detective', 'Doctor'].forEach(roleOption => {
          const option = document.createElement('option');
          option.value = roleOption;
          option.textContent = roleOption;
          if (p.role === roleOption) option.selected = true;
          select.appendChild(option);
        });
        select.onchange = async () => {
          await fetch('/assignRole', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: p.key, role: select.value })
          });
          loadPlayers();
        };
        roleTd.appendChild(select);
      }
      tr.appendChild(roleTd);

      // Delete with trash icon
      const delTd = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.className = 'deleteBtn';
      delBtn.title = 'Delete Player';
      delBtn.innerHTML = '&#128465;'; // trash icon
      delBtn.onclick = async () => {
        if (!confirm(`Delete player "${p.name}"?`)) return;
        await fetch('/deletePlayer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: p.key })
        });
        loadPlayers();
      };
      delTd.appendChild(delBtn);
      tr.appendChild(delTd);

      playersTableBody.appendChild(tr);
    });
  } catch {
    // silently fail or show a message if desired
  }
}

addPlayerBtn.onclick = async () => {
  const name = prompt("Enter player name:");
  if (!name || !name.trim()) return;
  try {
    await fetch('/addPlayer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() })
    });
    loadPlayers();
  } catch {
    alert("Failed to add player");
  }
};

startGameBtn.onclick = async () => {
  try {
    await fetch('/startGame', { method: 'POST' });
    gameStarted = true;
    startGameBtn.disabled = true;
    loadPlayers();
  } catch {
    alert("Failed to start game");
  }
};

resetGameBtn.onclick = async () => {
  if (!confirm("Are you sure you want to reset the game and delete all players?")) return;
  try {
    await fetch('/resetGame', { method: 'POST' });
    gameStarted = false;
    startGameBtn.disabled = false;
    loadPlayers();
  } catch {
    alert("Failed to reset game");
  }
};
