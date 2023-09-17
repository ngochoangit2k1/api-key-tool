import express from "express";
import {
  createKey,
  getAllKey,
  getKey,
  checkKey,
  blockKey,
  deletekKey,
  checkDayKey
} from "../services/key.services.js";
import checkToken from "../authentication/auth.authentication.js";
import { ROLE } from "../constants/common.constant.js";

const auth = express.Router();
auth.post("/create", async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return createKey(req.body, res)
    .then((resp) => res.status(200).json(resp))
    .catch(next);
});

auth.get("/", (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return getAllKey(req, res).catch(next);
});
auth.get("/search",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return getKey(req.query, res).catch(next);
});

auth.post("/check-key",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return checkKey(req.body, res).catch(next);
});
auth.post("/check-day-key",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.USER]);
  return checkDayKey(req, res, next).catch(next);
});
auth.post("/block-key",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return blockKey(req.body, res).catch(next);
});
auth.post("/delete-key",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return deletekKey(req.body, res).catch(next);
});

export function initWebKeyController(app) {
  app.use("/api/key", auth);
}
