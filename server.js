const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

const GOD_KEY = "1234";

/* ---------- GOD ---------- */

app.post("/god/login", (req, res) => {
  if (req.body.key !== GOD_KEY) {
    return res.status(401).send("Invalid");
  }
  res.send({ success: true });
});

app.post("/addPlayer", (req, res) => {
  const name = req.body.name?.trim();
  if (!name) return res.status(400).send("Invalid");

  const key = name + "-" + Math.floor(100 + Math.random() * 900);

  players.push({
    name,
    key,
    role: "Villager",
    revealed: false
  });

  res.send(players);
});

app.post("/deletePlayer", (req, res) => {
  players = players.filter(p => p.key !== req.body.key);
  res.send(players);
});

app.post("/assignRole", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (p) p.role = req.body.role;
  res.send(players);
});

app.post("/startGame", (req, res) => {
  gameStarted = true;
  res.send({ started: true });
});

app.post("/resetGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => {
    p.role = "Villager";
    p.revealed = false;
  });
  res.send({ reset: true });
});

/* ---------- PLAYER ---------- */

app.post("/login", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (!p) return res.status(401).send("Invalid");

  res.send({
    name: p.name,
    role: p.role,
    gameStarted
  });
});

app.get("/players", (req, res) => {
  res.send({ players, gameStarted });
});

app.listen(process.env.PORT || 3000);
