import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/db";
import userModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized: Please log in to continue." },
      { status: 401 }
    );
  }

  const userId = session.user._id;
  if (!userId) {
    return Response.json(
      { success: false, message: "Bad Request: User ID not found in session." },
      { status: 400 }
    );
  }

  const { acceptMessages } = await request.json();

  if (typeof acceptMessages !== "boolean") {
    return Response.json(
      {
        success: false,
        message: "Bad Request: 'acceptMessages' must be a boolean."
      },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "User not found or update failed." },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, message: "Message status updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating message status:", error);
    return Response.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Unauthorized: Please log in to continue." },
      { status: 401 }
    );
  }

  const userId = session.user._id;
  if (!userId) {
    return Response.json(
      { success: false, message: "Bad Request: User ID not found in session." },
      { status: 400 }
    );
  }
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        data: {
          isAcceptingMessage: user.isAcceptingMessage
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting message status:", error);
    return Response.json(
      { success: false, message: "Internal Server Error." },
      { status: 500 }
    );
  }
}
