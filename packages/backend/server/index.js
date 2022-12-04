// server/index.js

const express = require("express");

const PORT = 3001;

const app = express();

app.get("/api", (req, res) => {
    res.json("Call ok")
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});