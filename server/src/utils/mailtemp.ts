import path from "path";
import nodemailer from "nodemailer";
import fs from "fs";
import { config } from "dotenv";
config();
class STMPservice {
  private static otpTemplate = path.join(
    process.cwd(),
    "src",
    "utils",
    "template",
    "sendotp.html",
  );
  private static forgetpasswordtemp = path.join(
    process.cwd(),
    "src",
    "utils",
    "template",
    "forgetpassword.html",
  );
  private static EMAIL_API_URL =
    "https://emailsender-theta.vercel.app/send-email";

  //   public static async SendingOtp(
  //     user: { user_name: string; email: string },
  //     otpCode: string
  //   ) {
  //     console.log("htmltemplate", this.otpTemplate);
  //     let htmlContent = fs.readFileSync(this.otpTemplate, "utf-8");
  //     const currentYear = new Date().getFullYear();

  //     htmlContent = htmlContent
  //       .replace(/{{otp_code}}/g, otpCode)
  //       .replace(/{{user_name}}/g, user.user_name)
  //       .replace(/{{year}}/g, currentYear.toString())
  //       .replace(/{{company_name}}/g, "bookflex");
  //     const transporter = nodemailer.createTransport({
  //       service: "gmail",
  //       auth: {
  //         user: process.env.EMAIL_USER,
  //         pass: process.env.EMAIL_PASSWORD,
  //       },
  //     });
  //     await transporter.sendMail({
  //       from: `"BookFlex" <${process.env.EMAIL_USER}>`,
  //       to: user.email,
  //       subject: "Your OTP Code - BookFlex",
  //       text: `Hello ${user.user_name}, your OTP code is ${otpCode}`,
  //       html: htmlContent,
  //     });
  // const mail = await fetch(this.EMAIL_API_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     to: user.email,
  //     subject: "Your OTP Code - bookflex",
  //     html: htmlContent,
  //   }),
  // });
  // const data = await mail.json();
  // console.log("data", data);
  public static async SendingOtp(
    user: { user_name: string; email: string },
    otpCode: string,
  ) {
    try {
      const htmlContent = fs
        .readFileSync(this.otpTemplate, "utf-8")
        .replace(/{{otp_code}}/g, otpCode)
        .replace(/{{user_name}}/g, user.user_name)
        .replace(/{{year}}/g, new Date().getFullYear().toString())
        .replace(/{{company_name}}/g, "BookFlex");

      // const transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS,
      //   },
      // });

      // await transporter.sendMail({
      //   from: `"BookFlex" <${process.env.EMAIL_USER}>`,
      //   to: user.email,
      //   subject: "Your OTP Code - BookFlex",
      //   text: `Hello ${user.user_name}, your OTP code is ${otpCode}`,
      //   html: htmlContent,
      // });
      const response = await fetch(this.EMAIL_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: user.email,
          subject: "Your OTP Code - BookFlex",
          html: htmlContent,
        }),
      });
      console.log(`OTP sent to ${user.email}`, response);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  }
  public static async forgetpassword(
    user: { user_name: string; email: string },
    otpCode: string,
  ) {
    try {
      const htmlContent = fs
        .readFileSync(this.forgetpasswordtemp, "utf-8")
        .replace(/{{otp_code}}/g, otpCode)
        .replace(/{{user_name}}/g, user.user_name)
        .replace(/{{year}}/g, new Date().getFullYear().toString())
        .replace(/{{company_name}}/g, "BookFlex");

      // const transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   auth: {
      //     user: process.env.EMAIL_USER,
      //     pass: process.env.EMAIL_PASS,
      //   },
      // });

      // await transporter.sendMail({
      //   from: `"BookFlex" <${process.env.EMAIL_USER}>`,
      //   to: user.email,
      //   subject: "Your OTP Code - BookFlex",
      //   text: `Hello ${user.user_name}, your OTP code is ${otpCode}`,
      //   html: htmlContent,
      // });
      const response = await fetch(this.EMAIL_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: user.email,
          subject: "Your OTP Code - BookFlex",
          text: `Hello ${user.user_name}, your OTP code is ${otpCode}`,
          html: htmlContent,
        }),
      });
      console.log(`OTP sent to ${user.email}`, response);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  }
}
export default STMPservice;
