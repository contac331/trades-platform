# 🚀 Trades Platform - All-in-One Deployment

This package contains everything needed to deploy the Trades Platform as a single application.

## 📁 Structure
```
fullstack-deploy/
├── server.js              # Unified server (API + Static files)
├── package.json           # Root dependencies
├── .env.example           # Environment variables template
├── render.yaml           # Render.com configuration
├── backend/              # API server code
├── frontend/             # React application
└── README.md            # This file
```

## 🌐 Deployment Platforms

### Option 1: Render.com (Recommended)
1. Fork/upload this code to GitHub
2. Go to [render.com](https://render.com) and connect your GitHub repo
3. Create a new "Web Service"
4. Settings:
   - **Root Directory**: Leave blank
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Plan**: Free tier available

5. Set Environment Variables (in Render dashboard):
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secure-32-char-secret
   FRONTEND_URL=https://your-app-name.onrender.com
   ```

6. Deploy! Your app will be available at `https://your-app-name.onrender.com`

### Option 2: Railway.app
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Railway will auto-detect and deploy
4. Set environment variables in Railway dashboard
5. Your app will be available at the provided URL

### Option 3: Heroku
1. Install Heroku CLI
2. Commands:
   ```bash
   heroku create your-app-name
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   ```

### Option 4: DigitalOcean App Platform
1. Go to DigitalOcean Apps
2. Create app from GitHub
3. Configure build and start commands
4. Set environment variables
5. Deploy

## 📋 Pre-Deployment Checklist

1. **Update Environment Variables**:
   - Copy `.env.example` to `.env`
   - Set secure `JWT_SECRET` (32+ characters)
   - Update `FRONTEND_URL` with your deployment URL

2. **Database Setup**:
   - SQLite database is included
   - Default admin: `admin@example.com` / `admin123`
   - **Change admin password after deployment!**

3. **Security**:
   - Generate strong JWT secret
   - Update CORS settings
   - Change default admin credentials

## 🔧 Local Development
```bash
# Install all dependencies
npm run install-all

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📡 API Endpoints
- Frontend: `https://your-app.com/`
- API: `https://your-app.com/api/`
- Health Check: `https://your-app.com/api/health`

## 🛠️ Features Included
- ✅ User authentication (Customer/Tradesperson/Admin)
- ✅ Service listings and search
- ✅ User profiles and management
- ✅ Admin dashboard with user/service management
- ✅ Responsive design
- ✅ SQLite database with sample data
- ✅ File upload support
- ✅ Security middleware (CORS, Helmet, Rate limiting)

## 📞 Support
- Check deployment logs for errors
- Verify environment variables are set
- Ensure all dependencies are installed
- Test API endpoints after deployment

## 🔒 Security Notes
- **IMPORTANT**: Change default admin password immediately
- Use HTTPS in production
- Set strong JWT_SECRET
- Configure proper CORS origins
- Enable rate limiting for API endpoints

Your full-stack application is ready to deploy! 🎉
