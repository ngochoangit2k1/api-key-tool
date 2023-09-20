import ConfigPackage from "../models/config-package.model.js";

export async function createPackage(Keydata, res, next) {
  const { title, price, content, url_tele } = Keydata;
  const config = await ConfigPackage.findOne({ title });
  if (config) {
    return res.status(400).json({ error: "title đã tồn tại" });
  }
  const count = await ConfigPackage.countDocuments({});
  if (count < 5) {
    next;
    // Thực hiện hành động tại đây
  } else {
    return res
      .status(500)
      .json("số lượng dữ liệu lớn hơn 5 không thể tạo thêm");
  }
  try {
    const create = await ConfigPackage.create({
      title,
      price,
      content,
      url_tele,
    });
    return res.status(200).json(create);
  } catch (e) {
    return res.status(500).json(e);
  }
}

export async function updateConfig(data, res, next) {
  const { title, price, content, url_tele, newtitle } = data;
  if (!title || title.length === 0) {
    return res.status(400).json({ error: "Bạn chưa nhâp title" });
  }
  let newTitle;
  if (newtitle.length === 0) {
    newTitle = title;
  } else {
    newTitle = newtitle;
  }

  const config = await ConfigPackage.findOne({ title });
  if (newtitle && newtitle != title) {
    const Title = await ConfigPackage.findOne({ title: newtitle });
    if (Title) {
      return res.status(400).json({ error: "newtitle trùng với congfig khác" }); 
    } else {
      next;  
    }
  } 
  if (config) {
    await ConfigPackage.updateOne(
      { _id: config._id },
      {
        title: newTitle,
        price: price || config.price,
        content: content || config.content,
        url_tele: url_tele || config.url_tele,
      }
    );
    const configx = await ConfigPackage.findOne({ _id: config._id });
    return res.status(200).json(configx);
  } else {
    res.status(404).json({ error: "Not Found" });
  }
}

export async function getConfig(req, res) {
  const { q } = req.query;
  if (q) {
    try {
      const config = await ConfigPackage.find({
        $or: [
          { title: { $regex: q, $options: "i" } }, // Case-insensitive username search
          // Case-insensitive email search
        ],
      });
      return res.status(200).json(config);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  } else {
    try {
      const config = await ConfigPackage.find({});
      return res.status(200).json(config);
    } catch (err) {
      return res.status(400).json(err);
    }
  }
}
