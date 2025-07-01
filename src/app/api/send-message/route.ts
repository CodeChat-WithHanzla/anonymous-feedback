import dbConnect from "@/lib/db";
import userModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();
  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found!"
        },
        { status: 404 }
      );
    }
    // is user accepting messages
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not currently accepting messages."
        },
        { status: 403 }
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message sent successfully."
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while posting message:", error);
    return Response.json(
      {
        success: false,
        message: "Server error while posting message."
      },
      { status: 500 }
    );
  }
}
