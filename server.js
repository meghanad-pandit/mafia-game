const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

/* ---------------- UTIL ---------------- */

function generateKey() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* ---------------- GOD ACTIONS ---------------- */

// Add Player
app.post("/addPlayer", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  const key = generateKey();

  players.push({
    name,
    key,
    role: "Villager"
  });

  res.json(players);
});

// Start Game
app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.json({ started: true });
});

// Restart Game (clear roles)
app.post("/restartGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => p.role = "Villager");
  res.json({ restarted: true });
});

// Reset Everything
app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.json({ reset: true });
});

// Assign Role (manual / god)
app.post("/assignRole", (req, res) => {
  const { key, role } = req.body;
  const p = players.find(x => x.key === key);
  if (p) p.role = role;
  res.json(players);
});

// Get Players
app.get("/players", (req, res) => {
  res.json(players);
});

/* ---------------- GOD LOGIN ---------------- */

const GOD_KEY = "GOD123"; // later replace with OTP logic

app.post("/god/login", (req, res) => {
  const { key } = req.body;

  if (key !== GOD_KEY) {
    return res.status(401).json({ error: "Invalid God Key" });
  }

  res.json({ success: true });
});


/* ---------------- PLAYER LOGIN ---------------- */

app.post("/login", (req, res) => {
  const { key } = req.body;
  const p = players.find(x => x.key === key);

  if (!p) {
    return res.status(401).json({ error: "Invalid key" });
  }

  res.json({
    name: p.name,
    role: gameStarted ? p.role : null,
    gameStarted
  });
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Mafia game running on port", PORT);
});
