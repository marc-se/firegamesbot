import express, { Request, Response } from "express";
import { connect } from "./db/connect";

const app = express();
const port: number = parseInt(<string>process.env.PORT, 10) || 3030;

app.get("/", function (req: Request, res: Response) {
  res.send("Server running ✅");
});

app.listen(port, "0.0.0.0", function () {
  console.info("Web server running at http://0.0.0.0:%s/ ✅", port);
});

connect();
