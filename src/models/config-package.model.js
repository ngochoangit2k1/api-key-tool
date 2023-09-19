import mongoose from "mongoose";

const ConfigPackageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    price: { type: Number },
    content: {
      type: [String],
    },

    url_tele: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ConfigPackage", ConfigPackageSchema);
