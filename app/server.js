const express = require("express");
import { connect } from "./db/connect";

const app = express();
const port = process.env.PORT || 3030;

app.get("/", function (req, res) {
  res.send("Server running ✅");
});

app.listen(port, "0.0.0.0", function () {
  console.info("Web server running at http://0.0.0.0:%s/ ✅", port);
});

connect();
