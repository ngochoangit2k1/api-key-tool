import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export async function createUser(newUser, res) {
  return new Promise(async () => {
    const { name, username, password, phone } = newUser;
    let t;
    try {
      const checkUser = await User.findOne({
        username: username,
      });
      console.log(checkUser);
      if (checkUser) {
        return res.status(400).json("tai khoan da ton tai");
      }

      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        name,
        username,
        password: hash,
        phone,
        role: "admin",
      });

      if (createdUser) {
        return res.status(200).send(true);
      }
    } catch (e) {
      return res.status(404).send("Không thể tạo tài khoản");
    }
  });
}

export async function loginUser(userLogin, res) {
  return new Promise(async (resolve, reject) => {
    const { username, password } = userLogin;
    if (!username || username.length === 0 || !password || password.length === 0) {
      return res.status(404).send("username or password invalid");
    }
    try {
      const checkUser = await User.findOne({
        username: username,
      });
      if (checkUser === null) {
        return res.status(404).send("Người dùng không được xác định!");
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);
      if (!comparePassword) {
        return res
          .status(404)
          .send("Mật khẩu hoặc người dùng không chính xác!");
      } else {
        let token = jwt.sign(
          { data: checkUser },
          process.env.JWTPrivateKey,
          { expiresIn: "10 days" } //thời gian tồn tại của token
        );
        const userJson = { ...checkUser.toJSON() };

        return res.status(200).json({
          user: userJson,
          token: token,
        });
      }
    } catch (e) {
      return res.status(500).send(e);
    }
  });
}
