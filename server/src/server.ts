import express from "express";
import ViteExpress from "vite-express";
import { run } from "node-jq";

const app = express();

app.use(express.json());
app.set("json spaces", 2);

app.get("/api/hello", (_, res) => {
  res.json({ message: "Hello from backend" });
});

app.post("/api/jq", async (req, res) => {
  const filter = req.body.filter;
  const sourceJson = req.body.sourceJson;
  const filtered = await run(filter, sourceJson, {
    input: "json",
    output: "json",
  });
  res.json(filtered);
});

const server = app.listen(3000, "0.0.0.0", () =>
  console.log("Server is listening ..."),
);

ViteExpress.bind(app, server);
