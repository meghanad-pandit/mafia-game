const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

const GOD_KEY = "1234"; // change later to OTP

/* ---------------- GOD LOGIN ---------------- */

app.post("/god/login", (req, res) => {
  const { key } = req.body;
  if (key !== GOD_KEY) {
    return res.status(401).json({ error: "Invalid God Key" });
  }
  res.json({ success: true });
});

/* ---------------- GOD ACTIONS ---------------- */

app.post("/addPlayer", (req, res) => {
  const { name, pin } = req.body;
  if (!name || !pin) return res.status(400).send("Invalid data");

  players.push({
    name,
    pin,
    role: "Villager" // default role
  });

  res.json(players);
});

app.post("/assignRole", (req, res) => {
  const p = players.find(x => x.name === req.body.name);
  if (p) p.role = req.body.role;
  res.json(players);
});

app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.json({ started: true });
});

app.post("/restartGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => (p.role = "Villager"));
  res.json({ restarted: true });
});

app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.json({ reset: true });
});

/* ---------------- PLAYER LOGIN ---------------- */

app.post("/login", (req, res) => {
  const { name, pin } = req.body;

  const p = players.find(x => x.name === name && x.pin === pin);
  if (!p) return res.status(401).json({ error: "Invalid credentials" });

  res.json({
    name: p.name,
    role: p.role,
    gameStarted
  });
});

app.get("/players", (req, res) => {
  res.json(players);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server running")
);
