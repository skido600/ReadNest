import { NextResponse } from "next/server";
import { transporter } from "@/helper/nodemailerStmp";
export async function POST(request: Request) {
  try {
    const { to, subject, text, html }: any = request.body;

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json(
        { success: true, message: "Missing required fields" },
        { status: 400 }
      );
    }
    await transporter.sendMail({
      from: `"ReadNest" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error || "internal server error" },
      { status: 500 }
    );
  }
}
