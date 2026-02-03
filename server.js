const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;

app.post("/addPlayer", (req, res) => {
  players.push({
    name: req.body.name,
    pin: req.body.pin,
    role: "Villager"
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
  setTimeout(() => gameStarted = true, 1000);
  res.send({ restarted: true });
});

app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.send({ reset: true });
});

app.post("/playerState", (req, res) => {
  const p = players.find(
    x => x.name === req.body.name && x.pin === req.body.pin
  );
  if (!p) return res.status(401).send("Invalid");

  res.send({
    gameStarted,
    role: p.role
  });
});

app.get("/players", (req, res) => res.send(players));

app.listen(process.env.PORT || 3000);
