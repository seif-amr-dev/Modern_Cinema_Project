const emailTemplate = ({ name, type, otp, link }) => {
  const isReset = type === "reset";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isReset ? "Reset Your Password" : "Verify Your Email"}</title>
</head>

<body style="margin: 0; padding: 0; background-color: #050507; font-family: Arial, Helvetica, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" style="padding: 45px 15px;">

      <!-- Main Card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #131318; border-radius: 20px; overflow: hidden; border: 1px solid #2a2a35; box-shadow: 0 0 60px rgba(229, 9, 20, 0.15);">

        <!-- Header -->
        <tr>
          <td align="center" style="padding: 0; background: linear-gradient(135deg, #e50914 0%, #8b0000 55%, #2b0000 100%);">
            <!-- Film-strip perforation top -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 6px 0; background-color: #050507;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      ${Array(14).fill(0).map(() => `
                      <td width="7.14%" align="center">
                        <div style="width:10px;height:6px;background-color:#e50914;border-radius:2px;margin:0 auto;"></div>
                      </td>`).join("")}
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <div style="padding: 40px 25px 34px;">
              <div style="font-size: 34px; font-weight: 900; color: #ffffff; letter-spacing: 5px; text-shadow: 0 0 20px rgba(255,255,255,0.35);">
                🎬 CINEMA
              </div>

              <div style="margin-top: 10px; color: #ffd9db; font-size: 12px; letter-spacing: 3px; font-weight: 600; text-transform: uppercase;">
                Your Movie Experience
              </div>
            </div>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 45px 35px;">

            <!-- Greeting -->
            <p style="margin: 0 0 8px; color: #9797a5; font-size: 14px; text-align: center;">
              Hey ${name || "there"} 👋
            </p>

            <!-- Title -->
            <h1 style="margin: 0 0 18px; color: #ffffff; font-size: 29px; text-align: center; font-weight: 800; background: linear-gradient(90deg, #ffffff 0%, #ff8b8f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              ${isReset ? "Reset Your Password" : "Verify Your Email"}
            </h1>

            <!-- Description -->
            <p style="margin: 0 auto 32px; max-width: 460px; color: #aaaab5; font-size: 15px; line-height: 1.8; text-align: center;">
              ${
                isReset
                  ? "We received a request to reset your Cinema account password. Click the button below to create a new one — the show can't go on without you."
                  : "Welcome to Cinema! 🍿 Enter the code below to confirm your email and unlock your account."
              }
            </p>

            ${
              isReset
                ? `
                <!-- Reset Button -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <a href="${link}" style="display: inline-block; padding: 17px 42px; background: linear-gradient(135deg, #ff1a25 0%, #c40812 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; border-radius: 12px; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(229, 9, 20, 0.45);">🔑 Reset Password</a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 28px 0 0; color: #777783; font-size: 12px; line-height: 1.7; text-align: center;">
                  This link is valid for a limited time.
                  If you didn't request a password reset,
                  you can safely ignore this email.
                </p>
                `
                : `
                <!-- OTP "Ticket Stub" -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #16161d 0%, #0d0d13 100%); border: 1.5px solid #e50914; border-radius: 14px; box-shadow: 0 0 30px rgba(229, 9, 20, 0.35);">
                        <tr>
                          <td style="padding: 22px 34px;" align="center">
                            <div style="color: #777783; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px;">
                              Admit One · Verification Code
                            </div>
                            <div style="color: #ffffff; font-size: 38px; font-weight: 900; letter-spacing: 12px; text-shadow: 0 0 18px rgba(229, 9, 20, 0.8);">
                              ${otp}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <p style="margin: 25px 0 0; text-align: center; color: #777783; font-size: 13px;">
                  ⏱️ Expires in
                  <strong style="color: #ff4d55;">5 minutes</strong>
                  — don't let it hit the cutting room floor.
                </p>
                `
            }

            <!-- Security Notice -->
            <div style="margin-top: 38px; padding: 16px 18px; background-color: #1c1c24; border-radius: 10px; border: 1px solid #2e2e3a;">
              <p style="margin: 0; color: #909099; font-size: 12px; line-height: 1.7; text-align: center;">
                🔒 For your security, never share your
                ${isReset ? "password reset link" : "verification code"}
                with anyone.
              </p>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding: 26px; background-color: #0a0a0e; border-top: 1px solid #2a2a35;">
            <p style="margin: 0 0 7px; color: #ffffff; font-size: 13px; font-weight: bold; letter-spacing: 2px;">
              🎬 CINEMA
            </p>
            <p style="margin: 0; color: #5c5c68; font-size: 11px;">
              © 2026 Cinema App. All rights reserved.
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
`;
};

module.exports = emailTemplate;