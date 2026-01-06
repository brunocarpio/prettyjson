import express from "express";
import ViteExpress from "vite-express";
import { run } from "node-jq";
import { rateLimit } from "express-rate-limit";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
});

app.use(express.json({ limit: "10mb" }));

app.set("json spaces", 2);

app.get("/api/hello", (_, res) => {
  res.json({ message: "Hello from backend" });
});

app.post("/api/jq", limiter, async (req, res) => {
  const { filter, sourceJson } = req.body;

  if (typeof filter !== "string" || filter.length > 1000) {
    return res.status(400).json({ error: "Invalid or too long filter" });
  }

  if (typeof sourceJson !== "object") {
    return res.status(400).json({ error: "Invalid source JSON" });
  }

  try {
    const filtered = await run(filter, sourceJson, {
      input: "json",
      output: "json",
    });
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
});

const server = app.listen(3000, "0.0.0.0", () =>
  console.log("Server is listening ..."),
);

ViteExpress.bind(app, server);
