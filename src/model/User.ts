import mongoose, { Schema, Document } from "mongoose";
export interface Message extends Document {
  content: string;
  createdAt: Date;
}
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}
export const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Oops! Don’t forget to choose a username."],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, "Oops! Looks like you forgot to enter your email."],
    unique: true,
    match: [
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please provide a valid email address."
    ]
  },
  password: {
    type: String,
    required: [true, "You must provide a password to continue."]
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required."]
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code Expiry time is required."]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true
  },
  messages: [MessageSchema]
});
const userModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);
export default userModel;
