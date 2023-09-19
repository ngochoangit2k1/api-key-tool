import express from "express";
import {
    createPackage,
    updateConfig
} from "../services/config-package.server.js";
import checkToken from "../authentication/auth.authentication.js";

const packagePrice = express.Router();

packagePrice.post("/create",  async (req, res, next) => {
    // checkToken(req, res, next, [ROLE.ADMIN]);
    return createPackage(req.body, res, next).catch(next);
  });
  packagePrice.post("/update",  async (req, res, next) => {
    // checkToken(req, res, next, [ROLE.ADMIN]);
    return updateConfig(req.body, res, next).catch(next);
  });

export function initWebConfigPackageController(app) {
  app.use("/api/config", packagePrice);
}
