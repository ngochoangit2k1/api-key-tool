import randomstring from "randomstring";
import Key from "../models/key.models.js";
import User from "../models/user.models.js";
import cron from "node-cron";
import axios  from "axios";
import ip from "ip";

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
      ip:"",
      deleteDate: null,
    });
    return res.status(200).json(createKey);
  } catch (e) {
    return res.status(500).json(e);
  }
}
export async function getAllKey(req, res) {
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
      const keys = await Key.find({ author: userIdToFind }).populate(
        "author",
        "username"
      );
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
      await Key.updateOne({ key: key }, { code: "block", deleteDate: newDate });
    }
    const code = await Key.findOne({ key: key }, "code");
    return res.status(200).json(code);
  } catch (e) {
    return res.status(200).json(e);
  }
}

export async function checkDayKey(req, res, next) {
  const { key } = req.body;
  const checkKey = await Key.findOne({ key: key });
  const objectIdString = req.user.data._id;
  const targetValue = checkKey.author.toString();

  const role = req.user.data.role;
 
  const ipAddress = ip.address();


  // if(checkKey.ip === "" ){
  //   await Key.updateOne({ key: key },{ip: ipAddress})
  // }else if(checkKey.ip === ipAddress){
  //   next
  // }else{
  //   return res.status(400).json("thiết bị không đúng");

  // }
  if (objectIdString === targetValue || role === "admin") {
    next;
  } else {
    return res.status(400).json("bạn không phải chủ tài khoản key");
  }
  if (checkKey) {
    const date = new Date(checkKey.expirationDate.toISOString());

    const newDate = new Date();

    if (newDate > date) {
      await Key.updateOne({ key: key }, { code: "block", deleteDate: newDate });
    }
    const times = await Key.findOne({ key: key });
    try {
      if (times) {
        if (times.code === "block") {
          return res
            .status(200)
            .json({ message: "Key của bạn đã bị khoá liên hệ admin mở lại" });
        }
        const check = date - newDate;

        const remainingDays = Math.floor(check / (1000 * 60 * 60 * 24) + 1);

        return res.status(200).json({ remainingDays: remainingDays });
      } else {
        return res.status(200).json({ message: "tài khoản bạn đã hết hạn" });
      }
    } catch (e) {
      return res.status(200).json(e);
    }
  } else {
    return res.status(40).json({ message: "key không tồn tại" });
  }
}

export async function deletekKey(keys, res) {
  const { key } = keys;
  try {
    const newDate = new Date();

    await Key.updateOne({ key: key }, { code: "block", deleteDate: newDate });

    const code = await Key.findOne({ key: key }, "code");
    return res.status(200).json(code);
  } catch (e) {
    return res.status(200).json(e);
  }
}
export async function blockKey(keys, res) {
  const { key, code } = keys;
  const idkey = await Key.findOne({ key: key });

  if (idkey) {
    if (code === "block") {
      try {
        await Key.updateOne({ key: key }, { code: "block" });

        const code = await Key.findOne({ key: key }, "code");
        return res.status(200).json(code);
      } catch (e) {
        return res.status(200).json("Không thể khoá");
      }
    }
    if (code == "open") {
      try {
        await Key.updateOne({ key: key }, { code: "open" });

        const code = await Key.findOne({ key: key }, "code");
        return res.status(200).json(code);
      } catch (e) {
        return res.status(200).json("Không thể mở");
      }
    }
  } else {
    return res.status(400).json("Không tìm thấy key");
  }
}
export  async function autoCheckKey(req, res) {
  cron.schedule("0 0 * * *", async () => {
    try {
      const newDate = new Date();
      const keys = await Key.find({ deleteDate: null });
      const usersWithKey = await Promise.all(
        keys.map(async (key) => {
          const date = new Date(key.expirationDate.toISOString());
          if (newDate > date) {
            const autoCheck = await Key.updateOne(
              { key: key },
              { code: "block", deleteDate: newDate }
            );
            return autoCheck;
          }
        })
      );
      console.log("User accounts updated.");

      return usersWithKey
    } catch (err) {
      console.error("Error:", err);
    }
  });
}
