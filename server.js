const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

/* GOD ACTIONS */

app.post("/addPlayer", (req, res) => {
  if (!req.body.name || !req.body.pin) {
    return res.status(400).send("Invalid data");
  }
  players.push({
    name: req.body.name,
    pin: req.body.pin,
    role: "Not Assigned"
  });
  res.send(players);
});

app.post("/assignRole", (req, res) => {
  const p = players.find(x => x.name === req.body.name);
  if (p) p.role = req.body.role;
  res.send(players);
});

app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.send({ started: true });
});

app.post("/restartGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => p.role = p.role); // roles stay
  res.send({ restarted: true });
});

app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.send({ reset: true });
});

/* PLAYER LOGIN */

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

app.get("/players", (req, res) => res.send(players));

app.listen(process.env.PORT || 3000);
