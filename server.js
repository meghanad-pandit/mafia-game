const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

/* UTIL */
function generateKey(name) {
  const rand = Math.floor(100 + Math.random() * 900);
  return `${name}_${rand}`;
}

/* GOD */

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
  if (gameStarted) return res.status(403).send("Game already started");

  const p = players.find(x => x.key === req.body.key);
  if (p) p.role = req.body.role;

  res.json(players);
});

app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.json({ gameStarted });
});

app.post("/resetGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => (p.role = "Villager"));
  res.json({ reset: true });
});

app.get("/players", (req, res) => {
  res.json({ players, gameStarted });
});

/* PLAYER */

app.post("/login", (req, res) => {
  const { key } = req.body;
  const p = players.find(x => x.key === key);

  if (!p) return res.status(401).json({ error: "Invalid Key" });

  res.json({
    name: p.name,
    role: p.role,
    gameStarted
  });
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
