import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmails";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVeificationEmail(
   email: string,
   username: string,
   verifyCode: string
): Promise<ApiResponse>{
   try {
      await resend.emails.send({
         from: 'onboarding@resend.dev',
         to: email,
         subject: 'Verification Code',
         react: VerificationEmail({username, otp:verifyCode}),
       });

      return {success: false, message: "Verification Email sent Successfully"}
   } catch (emailError) {
      console.error("Error sending verification email", emailError)
      return {success: false, message: "Failed to send Verification Email"}
   }
}
