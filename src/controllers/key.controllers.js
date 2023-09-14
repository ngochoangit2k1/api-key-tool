import express from "express";
import { createKey, getAllKey ,getKey, checkKey, blockKey , deletekKey} from "../services/key.services.js";
import checkToken from "../authentication/auth.authentication.js";

const auth = express.Router();
auth.post("/create",checkToken, async (req, res, next) => {
  return createKey(req.body, res)
    .then((resp) => res.status(200).json(resp))
    .catch(next);
});

auth.get("/", checkToken,  (req, res, next) => {
  return getAllKey(req, res)
        .catch(next);
}); 
auth.get("/search",checkToken,  async (req, res, next) => {
  return getKey(req.query, res)
    .catch(next);
});

auth.post("/check-key",checkToken, async (req, res, next) => { 
  return checkKey(req.body, res)
    .catch(next);
});
auth.post("/block-key",checkToken, async (req, res, next) => { 
  return blockKey(req.body, res)
    .catch(next);
});
auth.post("/delete-key",checkToken, async (req, res, next) => { 
  return deletekKey(req.body, res)
    .catch(next);
});
export function initWebKeyController(app) {
  app.use("/api/key", auth);
}
