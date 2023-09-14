import HttpStatusCode from "../errors/HttpStatusCode.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/user.models.js";

export default async function checkToken(req, res, next, moduleId = []) {
  const passportJWT = passport.authenticate("jwt", { session: false });
  //   console.log(passportJWT);
  const token = req.headers?.authorization?.split(" ")[1];

  try {
    const jwtObject = jwt.verify(token, process.env.JWTPrivateKey);

    const isExpired = Date.now() >= jwtObject.exp * 1000;
    if (isExpired) {
      res.results(HttpStatusCode.BAD_REQUEST).json({
        message: "Token is expired",
      });
      res.end();
    } else {
      req.user = jwtObject;

      await isAuthenticated(req, res, next, moduleId);

      next;
    }

    debugger;
  } catch (exception) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: "Bạn chưa login",
    });
  }
  debugger;
}
async function isAuthenticated(req, res, next, moduleId) {
  const role = req.user.data.role;
  console.log(role);
  console.log(moduleId[0]);
  if (req.user) {
    const user = req.user.data.username;
    console.log(user);
    const account = await User.findOne({
      username: user,
    });
    console.log(account);
    if (!account) {
      return res.status(400).json({
        message: "Account not found",
      });
    }

    if (role === "admin" || (role === "user" && moduleId[0] === 2)) {
      next;
    } else {
      return res.status(400).json({
        message: "bạn không được phép",
      });
    }
  } else {
    return res.status(400).json({
      message: "Not Authenticated.",
    });
  }
}
