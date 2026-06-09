const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ================================================================
// EMAIL CONFIGURATION
// ================================================================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // Use App Password, not regular password
  },
});

// ================================================================
// VERIFICATION CODES STORE (use Redis in production)
// ================================================================
const verificationCodes = new Map(); // { email: { code, expiresAt, attempts } }
const userStore = new Map(); // { username: { email, password, status, createdAt } }

// ================================================================
// SEND VERIFICATION EMAIL
// ================================================================
app.post('/api/auth/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Check if email already exists
    const existingUser = Array.from(userStore.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code
    verificationCodes.set(email.toLowerCase(), {
      code,
      expiresAt,
      attempts: 0,
    });

    // Send email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: '🔥 Ignite Markets - Verify Your Email',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #E8621A; margin: 0;">IGNITE</h1>
            <p style="color: #868686; font-size: 14px;">Sports Prediction Markets</p>
          </div>

          <div style="background: #141414; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #F0F0F0; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #868686; margin-bottom: 20px;">Your verification code is:</p>
            
            <div style="background: #242424; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: 800; color: #E8621A; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>

            <p style="color: #868686; font-size: 12px; margin: 20px 0;">
              This code expires in 10 minutes.
            </p>
          </div>

          <div style="background: rgba(232,98,26,0.09); border: 1px solid rgba(232,98,26,0.2); border-radius: 8px; padding: 15px; margin-top: 20px; text-align: center;">
            <p style="color: #868686; font-size: 12px; margin: 0;">
              🔒 Never share this code with anyone. We'll never ask for it.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// ================================================================
// VERIFY CODE
// ================================================================
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code required' });
    }

    const stored = verificationCodes.get(email.toLowerCase());

    if (!stored) {
      return res.status(400).json({ error: 'No verification code sent to this email' });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' });
    }

    stored.attempts++;
    if (stored.attempts > 5) {
      verificationCodes.delete(email.toLowerCase());
      return res.status(400).json({ error: 'Too many attempts. Please request a new code.' });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({
        error: 'Incorrect code',
        attemptsRemaining: 5 - stored.attempts,
      });
    }

    // Code is valid - mark email as verified
    verificationCodes.delete(email.toLowerCase());

    res.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ================================================================
// SIGN UP
// ================================================================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, idType, idPhoto, facePhoto } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check username availability
    if (userStore.has(username.toLowerCase())) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Check email availability
    const existingEmail = Array.from(userStore.values()).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Store user with pending status
    userStore.set(username.toLowerCase(), {
      username,
      email,
      password, // In production, hash this with bcrypt
      status: 'pending',
      idType,
      verifiedAt: null,
      createdAt: new Date().toISOString(),
    });

    // Send admin notification
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `🔥 New User Pending Verification: ${username}`,
      html: `
        <h2>New User Registration</h2>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>ID Type:</strong> ${idType}</p>
        <p>Please review and approve in the admin panel.</p>
      `,
    });

    res.json({
      success: true,
      message: 'Account created. Awaiting admin verification.',
      status: 'pending',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// ================================================================
// SIGN IN
// ================================================================
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = userStore.get(username.toLowerCase());

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    if (user.status !== 'approved') {
      return res.status(400).json({
        error: `Account status: ${user.status}. Please wait for admin approval.`,
      });
    }

    // In production, create JWT token here
    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        initials: user.username.substring(0, 2).toUpperCase(),
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Signin failed' });
  }
});

// ================================================================
// ADMIN: APPROVE USER
// ================================================================
app.post('/api/admin/approve-user', async (req, res) => {
  try {
    const { username, adminPassword } = req.body;

    // Simple admin check (in production, use proper authentication)
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = userStore.get(username.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    user.status = 'approved';
    user.verifiedAt = new Date().toISOString();

    // Send approval email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: '🎉 Welcome to Ignite Markets!',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #E8621A;">Welcome to Ignite Markets! 🎉</h1>
          <p>Your account has been approved and is ready to use.</p>
          <p>Username: <strong>${user.username}</strong></p>
          <a href="${process.env.SITE_URL}" style="display: inline-block; background: #E8621A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Start Predicting</a>
        </div>
      `,
    });

    res.json({ success: true, message: 'User approved' });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// ================================================================
// ADMIN: REJECT USER
// ================================================================
app.post('/api/admin/reject-user', async (req, res) => {
  try {
    const { username, adminPassword } = req.body;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = userStore.get(username.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Send rejection email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Ignite Markets - Verification Not Approved',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #E05252;">Verification Not Approved</h1>
          <p>Unfortunately, your submission did not meet our verification requirements.</p>
          <p>Please contact support@ignitemarkets.com for more information.</p>
        </div>
      `,
    });

    userStore.delete(username.toLowerCase());
    res.json({ success: true, message: 'User rejected and removed' });
  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({ error: 'Rejection failed' });
  }
});

// ================================================================
// GET ALL PENDING USERS (Admin)
// ================================================================
app.get('/api/admin/pending-users/:adminPassword', async (req, res) => {
  try {
    const { adminPassword } = req.params;

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const pending = Array.from(userStore.entries())
      .filter(([, user]) => user.status === 'pending')
      .map(([, user]) => ({
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      }));

    res.json({ pending });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ================================================================
// HEALTH CHECK
// ================================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ================================================================
// START SERVER
// ================================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Ignite Markets server running on port ${PORT}`);
});
