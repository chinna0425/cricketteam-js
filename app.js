const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dataBasePath = path.join(__dirname, "cricketTeam.db");
let dataBase = null;
const initializingdbandserver = async () => {
  try {
    dataBase = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/players/");
    });
  } catch (error) {
    console.log(`The error message is ${error.message}`);
    process.exit(1);
  }
};
initializingdbandserver();

let convertingtoformat = (result) => {
  let myArray = [];
  for (let i = 0; i < result.length; i++) {
    let resu = {
      playerId: result[i].player_id,
      playerName: result[i].player_name,
      jerseyNumber: result[i].jersey_number,
      role: result[i].role,
    };
    myArray.push(resu);
  }
  return myArray;
};
app.get("/players/", async (request, response) => {
  const query = `select * from cricket_team;`;
  const result = await dataBase.all(query);
  response.send(convertingtoformat(result));
});
//API 3 GET

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT * from cricket_team WHERE player_id=${playerId};`;
  const res = await dataBase.get(query);
  console.log(res);
  response.send({
    playerId: res.player_id,
    playerName: res.player_name,
    jerseyNumber: res.jersey_number,
    role: res.role,
  });
});

//API 2 POST

app.post("/players/", async (request, response) => {
  const { playerName, jersyNumber, role } = request.body;
  const postQuery = `INSERT into cricket_team(player_name,jersey_number,role) VALUES('${playerName}',${jersyNumber},'${role}');`;
  const result = await dataBase.run(postQuery);
  response.send("Player Added to Team");
});
//API 4 PUT
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updateQuery = `UPDATE 
                                cricket_team 
                        SET 
                        player_name='${playerName}',
                        jersey_number=${jerseyNumber},
                            role='${role}
                    WHERE 
                            player_id=${playerId};`;
  await dataBase.run(updateQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `DELETE from cricket_team WHERE player_id=${playerId};`;
  await dataBase.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
