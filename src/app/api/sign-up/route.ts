import dbConnect from "@/lib/db";
import userModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signupSchema";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors
        .map(err => err.message)
        .join(", ");
      return Response.json(
        {
          success: false,
          message: errorMessages
        },
        { status: 400 }
      );
    }

    const { username, email, password } = result.data;
    const existingVerifiedUser = await userModel.findOne({
      username,
      isVerified: true
    });
    if (existingVerifiedUser) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken."
        },
        { status: 400 }
      );
    }
    const existingUserByEmail = await userModel.findOne({
      email
    });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "User already exist with this email."
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      const user = new userModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        messages: []
      });
      await user.save();
    }
    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success)
      return Response.json(
        {
          success: false,
          message: emailResponse.message
        },
        { status: 500 }
      );
    return Response.json(
      {
        success: true,
        message: "User registered successfully.Please verify your email."
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error while registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error while registering user"
      },
      { status: 500 }
    );
  }
}
