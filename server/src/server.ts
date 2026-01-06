import express from "express";
import ViteExpress from "vite-express";
import { run } from "node-jq";

const app = express();
const PORT = 3000;

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

ViteExpress.listen(app, PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
