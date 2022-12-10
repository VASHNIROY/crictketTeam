const express = require("express");
const app = express();

const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//get Player Details
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT *
        FROM cricket_team
        ORDER BY player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//post Player
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerDetailsQuery = `INSERT INTO cricket_team (playerName,jerseyNumber,role)
        VALUES (${playerName}, ${jerseyNumber}, ${role});`;
  const dbResponse = await db.run(addPlayerDetailsQuery);
  const player_id = dbResponse.lastID;
  response.send("Player Added to team");
});

//Get one player Details

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT * 
        FROM cricket_team
        WHERE player_id = ${playerId};`;
  const player = db.get(getPlayerQuery);
  response.send(player);
});

//Update player Details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `UPDATE cricket_team
        SET 
          "playerName": ${playerName},
          "jerseyNumber": ${jerseyNumber},
          "role": ${role}
        WHERE player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("player Details Updated");
});

//Delete Data

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE FROM cricket_team
    WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
