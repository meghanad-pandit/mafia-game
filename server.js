const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

const GOD_KEY = "1234";

/* ---------------- GOD LOGIN ---------------- */

app.post("/god/login", (req, res) => {
  if (req.body.key !== GOD_KEY) {
    return res.status(401).json({ error: "Invalid God Key" });
  }
  res.json({ success: true });
});

/* ---------------- HELPERS ---------------- */

function generateKey(name) {
  const rand = Math.floor(100 + Math.random() * 900);
  return `${name}-${rand}`;
}

/* ---------------- GOD ACTIONS ---------------- */

app.post("/addPlayer", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).send("Name required");

  const key = generateKey(name);

  players.push({
    name,
    key,
    role: "Villager"
  });

  res.json(players);
});

app.post("/assignRole", (req, res) => {
  if (gameStarted) {
    return res.status(403).json({ error: "Game already started. Roles are locked." });
  }

  const p = players.find(x => x.key === req.body.key);
  if (p) p.role = req.body.role;

  res.json(players);
});

app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.json({ started: true });
});

app.post("/restartGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => {
    p.role = "Villager";
  });
  res.json({ reset: true });
});


app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.json({ reset: true });
});

/* ---------------- PLAYER LOGIN / SYNC ---------------- */

app.post("/player/state", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (!p) return res.status(401).json({ error: "Invalid key" });

  res.json({
    name: p.name,
    role: p.role,
    gameStarted
  });
});

app.get("/players", (req, res) => res.json(players));

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
