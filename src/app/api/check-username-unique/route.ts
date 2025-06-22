import dbConnect from "@/lib/db";
import userModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signupSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = { username: searchParams.get("username") };
    // Validate query param using zod
    const result = UsernameQuerySchema.safeParse(queryParam);
    if (!result.success) {
      const formatted = result.error.format();
      const issueMessage =
        formatted.username?._errors?.[0] || "Invalid username";

      return Response.json(
        {
          success: false,
          message: issueMessage
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    console.log(username);

    const existingUser = await userModel.findOne({
      username
    });
    console.log(existingUser);

    if (existingUser) {
      if (!existingUser.isVerified) {
        return Response.json(
          {
            success: false,
            message:
              "Username already taken but not verified. Please verify your email or try a different username."
          },
          { status: 400 }
        );
      } else {
        return Response.json(
          {
            success: false,
            message: "Username already taken"
          },
          { status: 400 }
        );
      }
    }

    return Response.json(
      {
        success: true,
        message: "Username is available"
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error checking username:", error);
    return Response.json(
      {
        success: false,
        message: "Server error while checking username"
      },
      { status: 500 }
    );
  }
}
