import http from 'http';
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
// import dotenv from "dotenv";
import { initApiController } from "./controllers/index.js";
import { FormError, isSystemError } from "./errors/error.js";
import bodyParser from "body-parser";
import appConf from './config/application.js';
const app = express();
app.use(cors());
dotenv.config();
const port = process.env.PORT ?? 8000;

console.log(process.env.MONGODB_URL);
//middlewares
app.use(express.json());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/health-check", (req, res) => res.send({ message: "Ok" }));
app.get("/", (req, res) =>
  res.send({ message: "Welcome to the default API route" })
);
initApiController(app);
//error handler
app.use((err, req, res, next) => {
  if (err instanceof FormError) {
    err.errors.code =
      (err.errors && err.errors.code && err.errors.code.message) ||
      err.errors.code ||
      "INVALID"; // If the code is an object type then just get message (Ex: INVALID)
    res.status(err.code || 400).json(err.errors);
  } else if (!isSystemError(err)) {
    res.statusMessage = err.message;
    res.status(err.code || 500).json({ error: err.message });
  }
});
const connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("Connected to DB");
    })
    .catch((err) => {
      throw err;
    });
};
const server = http.createServer(app);
app.listen(port, async () => {
   connect();
  const PORT = process.env.PORT || appConf.port;
  server.listen(PORT, appConf.hostname, async () => {
    console.log(`Server running at http://${appConf.hostname}:${PORT}/`);
  })
  console.log(`server listening on port: ${port}`);
});