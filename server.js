const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let players = [];
let gameStarted = false;
let godLoggedIn = false;

const GOD_PASSWORD = "god123";

/* UTIL */
function generateKey() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/* GOD AUTH */
app.post("/god/login", (req, res) => {
  if (req.body.password !== GOD_PASSWORD)
    return res.status(401).send("Invalid password");

  if (godLoggedIn)
    return res.status(403).send("God already logged in");

  godLoggedIn = true;
  res.send({ success: true });
});

app.post("/god/logout", (req, res) => {
  godLoggedIn = false;
  res.send({ logout: true });
});

/* GOD ACTIONS */
app.post("/addPlayer", (req, res) => {
  const key = generateKey();

  players.push({
    key,
    role: "Villager"
  });

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

app.post("/restartGame", (req, res) => {
  gameStarted = false;
  players.forEach(p => (p.role = "Villager"));
  res.send({ restarted: true });
});

app.post("/resetPlayers", (req, res) => {
  players = [];
  gameStarted = false;
  res.send({ reset: true });
});

/* PLAYER */
app.post("/login", (req, res) => {
  const p = players.find(x => x.key === req.body.key);
  if (!p) return res.status(401).send("Invalid key");

  res.json({
    role: p.role,
    gameStarted
  });
});

app.get("/status", (req, res) => {
  res.send({ gameStarted });
});

app.get("/players", (req, res) => res.send(players));

app.listen(process.env.PORT || 3000);
