import express from "express";
import {
  createUser,
  loginUser,
  getAllUser,
  searchUser,
  getAllUserInfo,
  updateUser
} from "../services/user.services.js";
import checkToken from "../authentication/auth.authentication.js";
import { ROLE } from "../constants/common.constant.js";


const auth = express.Router();
auth.post("/sign-in", async (req, res, next) => {
  return loginUser(req.body, res)
    .then((resp) => res.status(200).json(resp))
    .catch(next);
});

auth.post("/register", async (req, res, next) => {
  return createUser(req.body, res)
    .then((t) => res.status(HttpStatusCode.OK).json(t))
    .catch(next);
}); 
auth.get("/",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return getAllUser(req.body, res)
    .then((t) => res.status(HttpStatusCode.OK).json(t))
    .catch(next);
}); 
auth.get("/info",  async (req, res, next) => {
  checkToken(req, res, next, [ROLE.ADMIN]);
  return getAllUserInfo(req, res)
    .then((t) => res.status(HttpStatusCode.OK).json(t))
    .catch(next);
}); 
auth.get("/search",  async (req, res, next) => {
  return searchUser(req, res)
    .then((t) => res.status(HttpStatusCode.OK).json(t))
    .catch(next);
});
auth.post("/update", async (req, res, next) => {
  return updateUser(req.body, res)
    .then((resp) => res.status(200).json(resp))
    .catch(next);
});

export function initWebUserController(app) {
  app.use("/api/user/auth", auth);
}
