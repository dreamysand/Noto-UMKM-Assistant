<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Password Reset Code</title>
</head>
<body style="font-family: 'Arial', sans-serif; background-color: #f4f4f7; padding: 40px;">
    <div style="
        max-width: 480px;
        margin: auto;
        background: #ffffff;
        border-radius: 14px;
        padding: 30px 35px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        border: 1px solid #e2e8f0;
    ">
        <h2 style="
            margin-top: 0;
            font-size: 22px;
            color: #1a202c;
            text-align: center;
        ">
            Hello, {{ $user->name }}! 👋
        </h2>

        <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">
            We received a request to reset the password for your account.
        </p>

        <p style="
            font-size: 15px;
            color: #4a5568;
            margin-bottom: 10px;
            line-height: 1.6;
        ">
            Your OTP code is:
        </p>

        <div style="
            margin: 25px 0;
            text-align: center;
            background: #e6fffa;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #38b2ac;
        ">
            <span style="
                font-size: 40px;
                color: #2c7a7b;
                font-weight: bold;
                letter-spacing: 4px;
                font-family: 'Courier New', monospace;
            ">
                {{ $otp }}
            </span>
        </div>

        <p style="font-size: 15px; color: #4a5568; line-height: 1.6;">
            This code is valid for <strong>2 minutes</strong>.
            If you didn’t request a password reset, feel free to ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;">

        <p style="font-size: 13px; color: #a0aec0; text-align: center;">
            — The <strong>{{ config('app.name') }}</strong> Team
        </p>
    </div>
</body>
</html>
