import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/verificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verification Code | Company name : Appisol",
      react: VerificationEmail({ username, otp: verifyCode })
    });
    return {
      success: true,
      message: "Successfully send Verification code , check your gmail."
    };
  } catch (emailError) {
    console.log("Cant send verification email :: ", emailError);
    return {
      success: false,
      message: "Cant send Verification code,plz try again."
    };
  }
}
