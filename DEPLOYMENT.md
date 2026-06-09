# 🚀 DEPLOYMENT GUIDE - Ignite Markets

Deploy your sports prediction platform to the world in under 5 minutes!

## ⚡ Quickest Option: Heroku (Free Tier Available)

### Step 1: Setup Heroku Account
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login
# Opens browser for authentication
```

### Step 2: Create & Configure App
```bash
# Create new Heroku app
heroku create ignite-markets-[your-name]

# Set environment variables
heroku config:set GMAIL_USER=your-email@gmail.com
heroku config:set GMAIL_PASSWORD=your-app-specific-password
heroku config:set ADMIN_PASSWORD=your-secure-password
heroku config:set ADMIN_EMAIL=admin@yourdomain.com
heroku config:set SITE_URL=https://ignite-markets-[your-name].herokuapp.com
heroku config:set NODE_ENV=production
```

### Step 3: Deploy
```bash
# Push code to Heroku
git push heroku main

# View logs
heroku logs --tail

# Open live app
heroku open
```

**Cost**: Free! (with limitations: 550 dyno hours/month)

---

## 🚀 Better Option: Railway.app (Faster, More Reliable)

Railway is a modern alternative that's **faster than Heroku** and offers better free tier.

### Step 1: Connect GitHub
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Authorize & select `mtbag25-creator/Ignite`

### Step 2: Add Environment Variables
In Railway Dashboard:
1. Click your project → Variables
2. Add:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=your-app-password
   ADMIN_PASSWORD=your-admin-pw
   ADMIN_EMAIL=admin@yourdomain.com
   NODE_ENV=production
   ```

### Step 3: Deploy
Railway auto-deploys on push to GitHub!
```bash
git push origin main  # Railway auto-detects and deploys
```

**Cost**: $5/month credit (generous free tier)

---

## 💪 Best Option: DigitalOcean App Platform

### Step 1: Create DigitalOcean Account
1. Sign up at https://digitalocean.com
2. Create new App → GitHub

### Step 2: Configure
1. Select repository: `mtbag25-creator/Ignite`
2. Add environment variables (same as above)
3. Set build: `npm install && npm start`

### Step 3: Deploy
Click "Deploy" and your app is live!

**Cost**: $12/month (includes unlimited bandwidth, good uptime)

---

## 🔧 Production Checklist

Before deploying, ensure:

### Security ✅
```javascript
// 1. Hash passwords (in server.js)
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);

// 2. Use environment variables for secrets
const adminPw = process.env.ADMIN_PASSWORD;

// 3. Enable HTTPS (all platforms do this auto)
```

### Performance ✅
```bash
# Add compression
npm install compression

# Add caching
npm install helmet

# Add rate limiting
npm install express-rate-limit
```

Update `server.js`:
```javascript
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(compression());
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Monitoring ✅
```bash
# Heroku monitoring (auto-included)
heroku logs --tail

# Railway monitoring (dashboard built-in)
# DigitalOcean monitoring (included)
```

---

## 📧 Gmail App Password Setup

### Required for Email Verification to Work

1. Go to: https://myaccount.google.com/apppasswords
2. Select: **Mail** + **Windows Computer** (or your OS)
3. Copy the 16-character password
4. Paste in `.env`:
   ```
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASSWORD=ywqe ncpm xxxx xxxx
   ```

**Important**: 
- Use App Password, NOT your regular password
- 2FA must be enabled on your Google account
- Never share this password publicly

---

## 🔍 Testing Before Deploy

### Local Testing
```bash
# Terminal 1: Start server
npm start

# Terminal 2: Test endpoints
curl -X POST http://localhost:3000/api/health
# Expected: {"status":"ok"}

# Terminal 3: Test email
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Browser Testing
1. Open http://localhost:3000
2. Click "Sign in"
3. Try sign up with test email
4. Check inbox for verification code

---

## 🎯 Performance Optimization

### Frontend
```html
<!-- Add in <head> for faster loads -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.example.com">
```

### Backend
```javascript
// Add response caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});

// Add JSON compression
app.use(compression());
```

### Database (Future)
```bash
# Consider MongoDB Atlas for production
# Free tier: https://www.mongodb.com/cloud/atlas
npm install mongoose
```

---

## 🆘 Troubleshooting

### Email Not Sending
```bash
# Check credentials
heroku config  # or Railway dashboard

# Verify App Password is set
# Go to: https://myaccount.google.com/apppasswords

# Check logs
heroku logs --tail
# Look for: "Email sent successfully" or error messages
```

### App Won't Start
```bash
# Check Node version
node --version  # Should be 14+

# Check for missing dependencies
npm install

# Verify all env variables are set
heroku config  # or Railway dashboard

# Check logs for errors
heroku logs --tail
```

### Verification Code Not Working
- Code must be entered within 10 minutes
- 6 digits exactly
- Only 5 attempts allowed
- Check email spam folder

---

## 📊 Monitoring & Maintenance

### Daily
- Check app is running: `heroku ps` or dashboard
- Monitor error logs: `heroku logs --tail`

### Weekly
- Review user registrations
- Check email delivery rate
- Monitor server performance

### Monthly
- Backup user data
- Review security logs
- Update dependencies: `npm update`

---

## 🔐 SSL/HTTPS

All major platforms provide free SSL:
- **Heroku**: Automatic (https://app-name.herokuapp.com)
- **Railway**: Automatic (https://your-domain.railway.app)
- **DigitalOcean**: Included with App Platform
- **Custom Domain**: Use CloudFlare (free SSL)

---

## 💾 Backup & Recovery

### Database Backup
```bash
# Heroku Postgres (if using database)
heroku pg:backups:capture
heroku pg:backups:download
```

### Code Backup
```bash
# Your GitHub repo IS your backup!
git push origin main
```

---

## 🎉 Success Checklist

After deployment, verify:
- ✅ App loads at `https://your-app-name`
- ✅ Sign up works with email verification
- ✅ Admin login works
- ✅ Markets display correctly on mobile
- ✅ Markets display correctly on desktop
- ✅ Comments post successfully
- ✅ Email verification codes arrive

---

## 🚀 Next Steps

1. **Custom Domain** (recommended)
   ```
   Heroku: heroku domains:add yourdomain.com
   Railway: Connect in settings
   DigitalOcean: Add DNS records
   ```

2. **Database** (when scaling)
   ```
   MongoDB Atlas: https://mongodb.com/cloud/atlas
   PostgreSQL: Heroku Postgres / Railway
   ```

3. **Email Service** (for higher volume)
   ```
   SendGrid: npm install @sendgrid/mail
   Mailgun: npm install mailgun.js
   AWS SES: npm install aws-sdk
   ```

4. **Analytics** (track users)
   ```
   Mixpanel: npm install mixpanel
   Sentry: npm install @sentry/node
   ```

---

**Questions?** Check the main [README.md](README.md)

Happy shipping! 🚀
