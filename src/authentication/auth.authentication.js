import HttpStatusCode from "../errors/HttpStatusCode.js";
import jwt from "jsonwebtoken";
import passport from "passport";

export default async function checkToken(req, res, next) {
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
      return next();
    }

    debugger;
  } catch (exception) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({
      message: "Bạn chưa login",
    });
  }
  debugger;
}
async function isAuthenticated(req, res) {
  if (req.isAuthenticated() && req.user) {
    const account = await db.User.findOne({
      where: {
        id: req.user.id,
        email: req.user.email,
      },
    });
    if (!account) {
      return res.status(HTTP_ERROR.NOT_AUTHENTICATE).json({
        code: FIELD_ERROR.ACCOUNT_NOT_FOUND.message,
        message: "Account not found",
      });
    }
    if (account.status !== GLOBAL_STATUS.ACTIVE) {
      return res.status(HTTP_ERROR.ACCESS_DENIED).json({
        code: FIELD_ERROR.ACCOUNT_NOT_ACTIVE.message,
        message: "Account not active",
      });
    }
    const groupAccount = await db.ACLGroupAction.findAll({
      where: {
        groupId: account.role,
      },
      include: [
        {
          model: db.ACLAction,
          as: "actions",
          required: false,
        },
      ],
    });
    let checkAuthenticate = false;
    if (moduleId.length === 0) {
      checkAuthenticate = true;
    }
    for (const group of groupAccount) {
      for (const id of moduleId) {
        if (group.actions.moduleId === id) {
          checkAuthenticate = true;
          break;
        }
      }
    }
    if (!checkAuthenticate) {
      return res.status(HTTP_ERROR.NOT_AUTHENTICATE).json({
        code: FIELD_ERROR.ACCOUNT_NOT_FOUND.message,
        message: "Not authenticate to access",
      });
    }
    return next();
  }
  return res.status(HTTP_ERROR.NOT_AUTHENTICATE).json({
    code: FIELD_ERROR.NOT_AUTHENTICATE.message,
    message: "Not Authenticated.",
  });
}
