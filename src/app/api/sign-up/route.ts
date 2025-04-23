import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";


export async function POST(request: Request) {
   await dbConnect()

   try {
      const {username, email, password} = await request.json()

      const existingUserVerifiedByUsername = await UserModel.findOne({username, isVerified: true})

      if(existingUserVerifiedByUsername) {
         return Response.json({success: false , message: "Username is aleady taken"}, {status: 200})
      }

      const verifyCode = Math.floor(100000 + Math.random() * 900000). toString()

      const existingUserByEmail = await UserModel.findOne({email})

      if(existingUserByEmail) {
         if(existingUserByEmail.isVerified){
            return Response.json({success: false, message: "User already exixsts with this email"}, {status: 500})
         }else{
            const hashedPassword = await bcrypt.hash(password, 10)
            existingUserByEmail.password = hashedPassword
            existingUserByEmail.verifyCode = verifyCode
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
            await existingUserByEmail.save()
         }
      }else{
         const hashedPassword = await bcrypt.hash(password, 10)
         const expiryDate = new Date()
         expiryDate.setHours(expiryDate.getHours() + 1)

         const newUser = new UserModel({
               username,
               email,
               hashedPassword,
               verifyCode,
               verifyCodeExpiry: expiryDate,
               isVerified: false,
               isAcceptingMessage: true,
               messages: []
         })

         await newUser.save()
      }
   //Send Verification Email
   const emailResponse = await sendVerificationEmail(email, username, verifyCode)

   if(!emailResponse.success) return Response.json({success: false, message: emailResponse.message}, {status: 500})

      return Response.json({success: true, message: "userRegistered Successfully, Please verify your email"}, {status: 200})

   } catch (error) {
      console.error("Error registering User", error)
      return Response.json({success: false, message: "Error Registering User"}, {status: 500})
   }
}