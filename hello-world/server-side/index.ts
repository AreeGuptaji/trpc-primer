import express from "express";
import { appRouter } from "./router";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
const app = express();
const port = 3001;
app.use(cors());
app.use("/api", createExpressMiddleware({ router: appRouter }));

app.get("/", (req, res) => {
  res.send("Hello from server-side");
});

app.listen(port, () => {
  console.log(`server-side listening at http://localhost:${port}`);
});
