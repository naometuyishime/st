import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com", // Ensure using correct host for Gmail
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Password Reset Email Template (HTML)
const resetPasswordTemplate = (resetLink: string) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            color: #333;
          }
          .container {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            color: #f86f03;
          }
          .content {
            font-size: 16px;
            line-height: 1.6;
          }
          .button {
            display: inline-block;
            background-color: #f86f03;
            color: white !important;
            padding: 10px 20px;
            text-decoration: none !important;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            font-size: 14px;
            color: #999;
            text-align: center;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. If you did not request a password reset, please ignore this email.</p>
            <p>
              <a href="${resetLink}" class="button" target="_blank" rel="noopener noreferrer">
                Reset Password
              </a>
            </p>
            <p>If the button above does not work, copy and paste the following link into your browser:</p>
            <p><a href="${resetLink}" target="_blank" rel="noopener noreferrer">${resetLink}</a></p>
          </div>
          <div class="footer">
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Thank you,</p>
            <p>Your Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Function to send email
export const sendEmail = (to: string, subject: string, resetLink: string) => {
  const htmlTemplate = resetPasswordTemplate(resetLink);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: htmlTemplate,
  };

  return transporter.sendMail(mailOptions);
};

export const sendEmailNotification = async (
  to: string,
  subject: string,
  text: string
) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  });
};
