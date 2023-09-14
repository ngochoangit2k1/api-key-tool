import randomstring from "randomstring";
import Key from "../models/key.models.js";
import User from "../models/user.models.js";

function generateVerifyCode() {
  return randomstring
    .generate({
      length: 6,
      charset: "numeric",
      readable: true,
    })
    .toString();
}

export async function createKey(Keydata, res) {
  const { date, username } = Keydata;

  const currentDateTime = new Date();
  const id = await User.findOne(
    {
      username: username,
    },
    "_id"
  );
  if (!id) {
    return res.status(404).json("user không tồn tại");
  }
  const expirationDateTime = new Date(
    currentDateTime.getTime() + date * 24 * 60 * 60 * 1000
  );

  const key = generateVerifyCode();
  try {
    const createKey = await Key.create({
      key,
      code: "open",
      expirationDate: expirationDateTime,
      author: id,
    });
    return res.status(200).json(createKey);
  } catch (e) {
    return res.status(500).json(e);
  }
}
export async function getAllKey(req, res) {
  console.log(req.user.data.role);
  try {
    const key = await Key.find({}).populate("author", "username");

    return res.status(200).json(key);
  } catch (e) {
    return res.status(500).json(e);
  }
}
export async function getKey(query, res) {
  const { username, key } = query;
  const userIdToFind = await User.findOne(
    {
      username: username,
    },
    "_id"
  );
  try {
    if (username) {
      const keys = await Key.find({ author: userIdToFind });
      return res.status(200).json(keys);
    } else {
      const keys = await Key.find({ key: key }).populate("author", "username");
      return res.status(200).json(keys);
    }
  } catch (e) {
    return res.status(500).json(e);
  }
}

export async function checkKey(keys, res) {
  const { key } = keys;
  try {
    const times = await Key.findOne({ key: key }, "expirationDate");
    const date = times.expirationDate;

    const newDate = new Date();

    if (newDate > date) {
      await Key.updateOne({ key: key }, { code: "block" });
    }
    const code = await Key.findOne({ key: key }, "code");
    return res.status(200).json(code);
  } catch (e) {
    return res.status(200).json(e);
  }
}
