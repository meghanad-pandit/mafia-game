const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;
const GOD_KEY = "1234";

function generateKey(name) {
  return name.toLowerCase().replace(/\s/g, "") + "-" + Math.floor(100 + Math.random() * 900);
}

/* ---------- GOD ---------- */
app.post("/god/login", (req, res) => {
  if (req.body.key === GOD_KEY) return res.json({ success: true });
  res.status(401).json({ success: false });
});

/* ---------- PLAYER ---------- */
app.post("/player/add", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({});

  const key = generateKey(name);
  players.push({ name, key, role: "villager", revealed: false });
  res.json({ name, key });
});

app.post("/player/login", (req, res) => {
  const player = players.find(p => p.key === req.body.key);
  if (!player) return res.status(401).json({});
  res.json(player);
});

/* ---------- GAME ---------- */
app.get("/players", (req, res) => res.json(players));

app.post("/game/start", (req, res) => {
  gameStarted = true;
  res.json({ success: true });
});

app.post("/game/reset", (req, res) => {
  gameStarted = false;
  players = [];
  res.json({ success: true });
});

app.post("/player/delete", (req, res) => {
  players = players.filter(p => p.key !== req.body.key);
  res.json({ success: true });
});

app.post("/player/reveal", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (p) p.revealed = !p.revealed;
  res.json(p);
});

app.listen(3000, () => console.log("✅ Server running"));
