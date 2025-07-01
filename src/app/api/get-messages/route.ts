import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/db";
import userModel from "@/model/User";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized: Please log in to continue." },
      { status: 401 }
    );
  }
  const user = session.user;
  const user_id = new mongoose.Types.ObjectId(user._id);
  try {
    const user = await userModel.aggregate([
      { $match: { _id: user_id } },
      {
        $unwind: "$messages"
      },
      {
        $sort: { "messages.createdAt": -1 }
      },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } }
    ]);
    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }
    return Response.json(
      { success: true, data: { messages: user[0].messages } },
      { status: 404 }
    );
  } catch (error) {
    console.log("Error getting messages:", error);
    return Response.json(
      {
        success: false,
        message: "Server error while getting messages"
      },
      { status: 500 }
    );
  }
}
