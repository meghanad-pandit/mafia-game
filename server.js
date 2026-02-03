const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;
let godLoggedIn = false;

let gameConfig = {
  Mafia: 1,
  Doctor: 1,
  Detective: 1
};

function generatePin() {
  return Math.floor(100 + Math.random() * 900).toString();
}

function godAuth(req, res, next) {
  if (!godLoggedIn) return res.status(403).send("Unauthorized");
  next();
}

/* GOD LOGIN */
app.post("/godLogin", (req, res) => {
  if (req.body.password === "admin123") {
    godLoggedIn = true;
    return res.json({ success: true });
  }
  res.status(401).send("Invalid");
});

/* GOD ACTIONS */
app.post("/addPlayer", godAuth, (req, res) => {
  const pin = generatePin();
  players.push({ name: req.body.name, pin, role: "Villager" });
  res.json(players);
});

app.post("/setRoles", godAuth, (req, res) => {
  gameConfig = req.body;
  res.json(gameConfig);
});

app.post("/startGame", godAuth, (req, res) => {
  gameStarted = true;

  players.forEach(p => (p.role = "Villager"));

  let rolePool = [];
  Object.keys(gameConfig).forEach(r => {
    for (let i = 0; i < gameConfig[r]; i++) rolePool.push(r);
  });

  players
    .sort(() => Math.random() - 0.5)
    .slice(0, rolePool.length)
    .forEach((p, i) => (p.role = rolePool[i]));

  res.json({ started: true });
});

app.post("/resetPlayers", godAuth, (req, res) => {
  players = [];
  gameStarted = false;
  godLoggedIn = false;
  res.json({ reset: true });
});

/* PLAYER */
app.post("/login", (req, res) => {
  const p = players.find(
    x => x.name === req.body.name && x.pin === req.body.pin
  );

  if (!p) return res.status(401).send("Invalid");

  res.json({
    name: p.name,
    pin: p.pin,
    role: p.role,
    gameStarted
  });
});

app.get("/players", (req, res) => res.json(players));

app.listen(process.env.PORT || 3000);
