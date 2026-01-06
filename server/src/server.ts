import express from "express";
import ViteExpress from "vite-express";

const app = express();
const PORT = 3000;

app.get("/api/hello", (_, res) => {
  res.json({ message: "Hello from backend" });
});

ViteExpress.listen(app, PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
