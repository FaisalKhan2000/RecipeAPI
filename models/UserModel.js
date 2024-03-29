import mongoose from "mongoose";
import { ROLES } from "../utils/constants.js";
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  role: {
    type: String,
    enum: Object.values(ROLES),
  },

  verified: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("User", UserSchema);
