import bcrypt from "bcrypt";
import User from "../models/user.models.js";
import Key from "../models/key.models.js";
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
        role: "user",
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
    if (
      !username ||
      username.length === 0 ||
      !password ||
      password.length === 0
    ) {
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

export async function getAllUser(req, res) {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
  } catch (e) {}
}

export async function searchUser(req, res) {
  const { q } = req.query; // Get the search term from the query parameter

  try {
    if (q) {
      const users = await User.find({
        $or: [
          { username: { $regex: q, $options: "i" } }, // Case-insensitive username search
          // Case-insensitive email search
        ],
      });

      if (users.length > 0) {
        const usersWithKey = await Promise.all(
          users.map(async (user) => {
            const key = await Key.find({
              author: user._id,
              deleteDate: null,
            }).populate("author", "username");
            if (key && key.length > 0) {
              return key;
            }
          })
        );
        //lọc loại bỏ các mảng rỗng
        const filteredUsersWithKey = usersWithKey.filter((user) => user);
        // kết nối các mảng con thành 1 mảng duy nhất
        const connectedData = [].concat(...filteredUsersWithKey);

        return res.status(200).json(connectedData);
      } else {
        return res.status(404).json("Không tìm thấy tài khoản");
      }
    } else {
      try {
        const key = await Key.find({ deleteDate: null }).populate(
          "author",
          "username"
        );

        return res.status(200).json(key);
      } catch (e) {
        return res.status(500).json(e);
      }
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
