const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const GOD_PASSWORD = "admin123";

let players = [];
let gameStarted = false;

/* ================= HELPERS ================= */

function generatePin() {
  return Math.floor(100 + Math.random() * 900).toString();
}

/* ================= GOD LOGIN ================= */

app.post("/god/login", (req, res) => {
  if (req.body.password === GOD_PASSWORD) {
    return res.json({ success: true });
  }
  res.status(401).json({ error: "Unauthorized" });
});

/* ================= GOD ACTIONS ================= */

app.post("/addPlayer", (req, res) => {
  if (!req.body.name) {
    return res.status(400).send("Invalid name");
  }

  players.push({
    name: req.body.name,
    pin: generatePin(),
    role: "Villager" // default
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

  // Reset roles to default
  players.forEach(p => (p.role = "Villager"));

  res.json({ restarted: true });
});

app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.json({ reset: true });
});

/* ================= PLAYER LOGIN ================= */

app.post("/login", (req, res) => {
  const p = players.find(
    x => x.name === req.body.name && x.pin === req.body.pin
  );

  if (!p) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    name: p.name,
    role: p.role,
    gameStarted
  });
});

app.get("/players", (req, res) => res.json(players));

app.listen(process.env.PORT || 3000, () =>
  console.log("🎭 Mafia Game running")
);
