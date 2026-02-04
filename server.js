const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

const GOD_KEY = "1234";

// God login
app.post("/god/login", (req, res) => {
  if (req.body.key !== GOD_KEY) {
    return res.status(401).send("Invalid");
  }
  res.send({ success: true });
});

// Add new player
app.post("/addPlayer", (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).send("Invalid");

  // Generate unique key (name + 3 digit random)
  const key = name + "-" + Math.floor(100 + Math.random() * 900);

  players.push({
    name,
    key,
    role: "Villager",
    revealed: false
  });

  res.send(players);
});

// Delete player by key
app.post("/deletePlayer", (req, res) => {
  players = players.filter(p => p.key !== req.body.key);
  res.send(players);
});

// Assign role to player by key
app.post("/assignRole", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (p) p.role = req.body.role;
  res.send(players);
});

// Start game
app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.send({ started: true });
});

// Reset game (roles back to Villager and revealed=false)
app.post("/resetGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => {
    p.role = "Villager";
    p.revealed = false;
  });
  res.send({ reset: true });
});

// Mark player revealed role
app.post("/playerRevealed", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (p) {
    p.revealed = true;
    res.send({ success: true });
  } else {
    res.status(404).send({ success: false });
  }
});

// Mark player hide role
app.post("/playerHideRole", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (p) {
    p.revealed = false;
    res.send({ success: true });
  } else {
    res.status(404).send({ success: false });
  }
});

// Player status (gameStarted, role, revealed, name)
app.post("/playerStatus", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (!p) return res.status(404).send("Not found");

  res.send({
    name: p.name,
    role: p.role,
    revealed: p.revealed,
    gameStarted
  });
});

// Get all players and game state
app.get("/players", (req, res) => {
  res.send({ players, gameStarted });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
