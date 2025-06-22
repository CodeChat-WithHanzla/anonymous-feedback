import dbConnect from "@/lib/db";
import userModel from "@/model/User";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, verifyCode } = await request.json();

    if (!username) {
      return Response.json(
        { success: false, message: "Username is required!" },
        { status: 400 }
      );
    }

    if (!verifyCode) {
      return Response.json(
        { success: false, message: "Verify code is required!" },
        { status: 400 }
      );
    }

    const existingUser = await userModel.findOne({ username });

    if (!existingUser) {
      return Response.json(
        { success: false, message: "User does not exist." },
        { status: 404 }
      );
    }

    const isCorrect = await bcrypt.compare(verifyCode, existingUser.verifyCode);

    if (!isCorrect) {
      return Response.json(
        { success: false, message: "Incorrect verify code." },
        { status: 400 }
      );
    }

    if (existingUser.verifyCodeExpiry.getTime() < Date.now()) {
      return Response.json(
        { success: false, message: "Verification code has expired." },
        { status: 400 }
      );
    }

    existingUser.isVerified = true;
    await existingUser.save();

    return Response.json(
      { success: true, message: "Verified successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during verification:", error);
    return Response.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
