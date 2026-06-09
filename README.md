# 🔥 Ignite Markets - Sports Prediction Platform

A fully responsive, accessible sports prediction markets platform with email-based user verification, built for both mobile and desktop devices.

## ✨ Features

### 🎯 Core Features
- **Real-time Betting Markets** - Predict sports outcomes and track live odds
- **Email Verification** - 6-digit codes sent via Gmail with auto-fill & paste support
- **Admin Dashboard** - Manage users, featured games, and comments
- **Live Odds Aggregation** - Sync with Kalshi & Polymarket
- **Discussion Forum** - Community comments on each market

### 📱 Mobile Optimizations
- **Touch-friendly UI** - Optimized for all screen sizes (320px → 1440px+)
- **Gesture Support** - Swipe navigation, tap-to-interact
- **Safe Area Support** - Notch-aware padding for iPhone/Android devices
- **No-camera Fallback** - Simulated verification for devices without camera access
- **Fast Input** - Auto-focus digit inputs, clipboard paste support

### ♿ Accessibility
- **ARIA Labels** - Screen reader support for all interactive elements
- **Keyboard Navigation** - Full keyboard support with Tab/Escape
- **High Contrast Mode** - Respects user's system preferences
- **Motion Reduction** - Respects `prefers-reduced-motion` setting
- **Focus Indicators** - Clear 2px orange outlines on all inputs

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm/yarn
- Gmail account with App Password enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mtbag25-creator/Ignite.git
cd Ignite

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Generate Gmail App Password
# Go to: https://myaccount.google.com/apppasswords
# Select "Mail" and "Windows Computer" (or your device)
# Use the generated password in .env

# 5. Start the server
npm start
# Server runs on http://localhost:3000
```

## 📧 Email Verification Flow

### User Perspective
1. **Sign Up** → Enter username, email, password
2. **Code Sent** → 6-digit code arrives in inbox (2 seconds)
3. **Enter Code** → 
   - Type each digit (auto-advances)
   - OR paste 6-digit code
   - OR auto-fill from clipboard
4. **Admin Approval** → Wait for verification email
5. **Verified** → Ready to place bets!

### Code Details
- **Lifetime**: 10 minutes
- **Attempts**: 5 max (then must request new code)
- **Resend**: Available after 60-second cooldown
- **Rate Limit**: 1 email per 10 minutes per email address

## 🔐 Admin Panel

### Access
- URL: `http://localhost:3000/admin`
- Username: `admin`
- Password: Set in `.env` (ADMIN_PASSWORD)

### Functions
- **User Management** - Approve/reject pending verifications
- **Featured Games** - Toggle which markets appear in carousel
- **Comment Moderation** - Delete inappropriate comments
- **User Statistics** - Track registration and activity

## 📱 Responsive Breakpoints

| Device | Width | Navigation | Layout |
|--------|-------|-----------|--------|
| **Mobile** | 320-480px | Stacked | Single column |
| **Tablet** | 481-768px | Condensed | 2 columns |
| **Desktop** | 769-1440px | Full | Multi-column |
| **Ultra-wide** | 1440px+ | Full | 4+ columns |

## 🎨 Mobile-First CSS Features

### Viewport Configuration
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Safe Area Support
- Respects notches on iPhone 13+
- Handles Android edge-to-edge
- Adjusts padding automatically

### Touch Optimizations
- **Min tap target**: 44×44px (iOS standard)
- **No tap delay**: Removed 300ms delay with `touch-action`
- **Gesture support**: Swipe, long-press, pinch

### Font Size Strategy
```css
/* Prevents zoom on iOS when focusing input */
input { font-size: 16px; }

/* Scales down on mobile appropriately */
@media (max-width: 480px) {
  body { font-size: 14px; }
}
```

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/send-verification
  { email: "user@example.com" }
  → Returns: { success: true, message: "Code sent" }

POST /api/auth/verify-code
  { email: "user@example.com", code: "123456" }
  → Returns: { success: true, message: "Verified" }

POST /api/auth/signup
  { username, email, password, idType, idPhoto, facePhoto }
  → Returns: { success: true, status: "pending" }

POST /api/auth/signin
  { username, password }
  → Returns: { success: true, user: { username, email, initials } }
```

### Admin
```
GET /api/admin/pending-users/:adminPassword
POST /api/admin/approve-user
POST /api/admin/reject-user
```

## 🛠️ Development

### File Structure
```
Ignite/
├── server.js              # Node.js backend
├── package.json           # Dependencies
├── .env.example           # Environment template
├── public/
│   └── index-responsive.html  # Responsive frontend
└── README.md
```

### Running in Development
```bash
npm run dev  # Auto-reloads on file changes (requires nodemon)
```

### Testing Email Locally
```javascript
// In development, check console for verification codes
// Or use a test email service like Mailtrap or SendGrid
```

## 🔒 Security Considerations

⚠️ **Important for Production**

1. **Hash Passwords** - Replace with bcrypt
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPW = await bcrypt.hash(password, 10);
   ```

2. **Use JWT Tokens** - Don't pass credentials in headers
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = jwt.sign({ username }, process.env.JWT_SECRET);
   ```

3. **Rate Limiting** - Add `express-rate-limit`
   ```bash
   npm install express-rate-limit
   ```

4. **HTTPS Only** - All traffic should be encrypted
   ```javascript
   app.use((req, res, next) => {
     if (!req.secure && process.env.NODE_ENV === 'production') {
       return res.redirect(`https://${req.headers.host}${req.url}`);
     }
     next();
   });
   ```

5. **CSRF Protection** - Add `csrf-sync` or similar
   ```bash
   npm install csrf-sync
   ```

6. **Input Validation** - Sanitize all user input
   ```bash
   npm install express-validator
   ```

## 🌍 Deployment

### Heroku
```bash
# 1. Login to Heroku
heroku login

# 2. Create app
heroku create ignite-markets

# 3. Set environment variables
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASSWORD=your-app-password
heroku config:set ADMIN_PASSWORD=your-admin-pw
heroku config:set NODE_ENV=production

# 4. Deploy
git push heroku main
```

### Railway.app
```bash
# Push to GitHub, connect GitHub repo to Railway
# Railway auto-reads package.json and deploys
```

### AWS/DigitalOcean
```bash
# Deploy Node.js app with PM2 for process management
npm install -g pm2
pm2 start server.js --name "ignite"
```

## 📞 Support

- **Email**: support@ignitemarkets.com
- **Issues**: GitHub Issues
- **Discussion**: GitHub Discussions

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ by Ignite Markets**

*Sports prediction markets, built different.*
