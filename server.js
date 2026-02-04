const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;
let gameVersion = 0; // 👈 NEW

function generateKey(name) {
  const rand = Math.floor(100 + Math.random() * 900);
  return `${name}_${rand}`;
}

/* GOD */

app.post("/addPlayer", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Name required");

  players.push({
    name,
    key: generateKey(name),
    role: "Villager"
  });

  res.json({ players, gameStarted, gameVersion });
});

app.post("/assignRole", (req, res) => {
  if (gameStarted) return res.status(403).send("Game started");

  const p = players.find(x => x.key === req.body.key);
  if (p) p.role = req.body.role;

  res.json(players);
});

app.post("/startGame", (req, res) => {
  gameStarted = true;
  gameVersion++; // 👈 NEW ROUND
  res.json({ gameStarted, gameVersion });
});

app.post("/resetGame", (req, res) => {
  gameStarted = false;
  gameVersion++; // 👈 RESET EVENT
  players.forEach(p => (p.role = "Villager"));
  res.json({ reset: true, gameVersion });
});

app.get("/players", (req, res) => {
  res.json({ players, gameStarted, gameVersion });
});

/* PLAYER */

app.post("/login", (req, res) => {
  const { key } = req.body;
  const p = players.find(x => x.key === key);

  if (!p) return res.status(401).json({ error: "Invalid Key" });

  res.json({
    name: p.name,
    role: p.role,
    gameStarted,
    gameVersion
  });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("✅ Server running")
);
