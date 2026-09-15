import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }   
});


async function sendEmail(to, subject, otp) {

    await transporter.verify();
    if (!transporter) {
        console.error('Error: SMTP transporter is not configured properly.');
        return;
    }

    try {
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: to,
            subject: subject,
            text: `Your OTP for email verification is: ${otp}`,
            html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>OTP Verification</title>
                    </head>

                    <body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:40px 15px;">
                        <tr>
                        <td align="center">

                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                            style="max-width:480px; background:#ffffff; border-radius:14px; padding:40px 30px; box-shadow:0 4px 20px rgba(0,0,0,0.06);">

                            <tr>
                                <td align="center">

                                <div style="
                                    width:52px;
                                    height:52px;
                                    line-height:52px;
                                    background:#022658;
                                    color:#ffffff;
                                    border-radius:50%;
                                    font-size:24px;
                                    margin-bottom:20px;">
                                    ✓
                                </div>

                                <h2 style="
                                    margin:0 0 10px;
                                    font-size:24px;
                                    color:#111111;
                                    font-weight:600;">
                                    Verify Your Email
                                </h2>

                                <p style="
                                    margin:0 0 25px;
                                    font-size:14px;
                                    line-height:22px;
                                    color:#666666;">
                                    Use the verification code below to complete your verification.
                                </p>

                                <div style="
                                    display:inline-block;
                                    background:#f2f5f8;
                                    border:1px solid #e4e8ec;
                                    border-radius:10px;
                                    padding:16px 28px;
                                    font-size:30px;
                                    font-weight:700;
                                    letter-spacing:8px;
                                    color:#022658;">
                                    ${otp}
                                </div>

                                <p style="
                                    margin:25px 0 0;
                                    font-size:12px;
                                    color:#999999;">
                                    This code will expire in 10 minutes.
                                </p>

                                <p style="
                                    margin:12px 0 0;
                                    font-size:12px;
                                    color:#999999;">
                                    If you didn't request this code, you can safely ignore this email.
                                </p>

                                </td>
                            </tr>

                            </table>

                        </td>
                        </tr>
                    </table>

                    </body>
                    </html>
`
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', to);
     }
    catch (error) {
        console.error('Error sending email:', error);
        
    }
}



export default sendEmail;
