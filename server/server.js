import express from "express";
import cors from "cors";

import exchangeRoute from "./routes/exchange.js";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/", express.static("public"));

app.use("/api/exchange", exchangeRoute);

export default app;
