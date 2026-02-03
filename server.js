const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

const GOD_PASSWORD = "admin123";
const GOD_TOKEN = "GOD_SECRET_TOKEN"; // simple static token

let roleMode = "RANDOM"; // RANDOM | MANUAL
let gameConfig = { Mafia: 1, Doctor: 1, Detective: 1 };

/* ---------- HELPERS ---------- */

function generatePin() {
  return Math.floor(100 + Math.random() * 900).toString();
}

function godAuth(req, res, next) {
  if (req.headers["x-god-token"] !== GOD_TOKEN) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

/* ---------- GOD ---------- */

app.post("/godLogin", (req, res) => {
  if (req.body.password === GOD_PASSWORD) {
    return res.json({ token: GOD_TOKEN });
  }
  res.status(401).json({ error: "Invalid password" });
});

app.post("/setRoleMode", godAuth, (req, res) => {
  roleMode = req.body.mode;
  res.json({ roleMode });
});

app.post("/setRoles", godAuth, (req, res) => {
  gameConfig = req.body;
  res.json(gameConfig);
});

app.post("/addPlayer", godAuth, (req, res) => {
  if (!req.body.name) return res.status(400).send("Name required");

  players.push({
    name: req.body.name,
    pin: generatePin(),
    role: "Villager"
  });

  res.json(players);
});

app.post("/assignRole", godAuth, (req, res) => {
  const p = players.find(x => x.name === req.body.name);
  if (p) p.role = req.body.role;
  res.json(players);
});

app.post("/startGame", godAuth, (req, res) => {
  gameStarted = true;

  if (roleMode === "RANDOM") {
    players.forEach(p => (p.role = "Villager"));

    let pool = [];
    Object.entries(gameConfig).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) pool.push(role);
    });

    players
      .sort(() => Math.random() - 0.5)
      .slice(0, pool.length)
      .forEach((p, i) => (p.role = pool[i]));
  }

  res.json({ started: true });
});

app.post("/resetPlayers", godAuth, (req, res) => {
  players = [];
  gameStarted = false;
  res.json({ reset: true });
});

/* ---------- PLAYER ---------- */

app.post("/login", (req, res) => {
  const p = players.find(
    x => x.name === req.body.name && x.pin === req.body.pin
  );

  if (!p) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    name: p.name,
    pin: p.pin,
    role: p.role,
    gameStarted
  });
});

app.get("/players", (req, res) => res.json(players));

app.listen(process.env.PORT || 3000);
