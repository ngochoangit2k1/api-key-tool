import mongoose from "mongoose";

const KeySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    expirationDate: { type: Date },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu tới bảng User
    },
    ip: {
      type: String,
    },
    code: {
      type: String,
      enum: ["open", "block"],
    },
    deleteDate: { type: Date, required: false },
  },
  { timestamps: true }
);

export default mongoose.model("Key", KeySchema);
