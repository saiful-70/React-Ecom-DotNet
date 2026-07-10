# 🚀 DebuggerMind Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Installation

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local and add your API URLs

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🔐 Environment Setup

### Required Configuration

Edit `.env.local` with your backend API endpoint:

```env
# Backend API (REQUIRED)
API_BASE_URL=https://your-api-endpoint.com
API_BASE_URL_V1=https://your-api-endpoint.com/api/v1

# Site URL (REQUIRED for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (OPTIONAL)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

### Environment Files Strategy

This project uses separate environment files:

| File              | Purpose     | Usage                               |
| ----------------- | ----------- | ----------------------------------- |
| `.env.local`      | Development | Local development (`npm run dev`)   |
| `.env.production` | Production  | Production builds (`npm run build`) |
| `.env.example`    | Template    | Reference (committed to git)        |

**Important:**

- ❌ Never commit `.env.local` or `.env.production` to git
- ✅ Always update `.env.example` when adding new variables
- ✅ Both files are automatically gitignored

### How Next.js Loads Environment Files

When you run `npm run dev`:

- Loads `.env.local` (development)

When you run `npm run build`:

- Loads `.env.production` if `NODE_ENV=production`
- Otherwise loads `.env.local`

**Note:** Seeing "Environments: .env.local, .env.production" during build is normal - Next.js shows all available files but only loads the appropriate one.

## 📦 Docker Setup

### Development with Hot Reload

```bash
# Uses .env.local automatically
docker-compose -f docker-compose.dev.yml up --build

# Access at http://localhost:3000
```

### Production Deployment

```bash
# Uses .env.production automatically
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 📝 Available Commands

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start development server (port 3000) |
| `npm run build`      | Create production build              |
| `npm start`          | Start production server              |
| `npm run lint`       | Check code quality                   |
| `npm run type-check` | Verify TypeScript                    |

## 🌐 Production Deployment

### Vercel (Fastest)

1. Push code to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically ✨

### Railway

1. Create project on [railway.app](https://railway.app)
2. Connect GitHub repo
3. Add environment variables
4. Deploy with one click 🚂

### AWS/DigitalOcean/VPS

For any VPS provider (DigitalOcean, AWS, Linode, etc.), we provide a comprehensive guide.

See `deployment/VPS_GENERIC.md` for detailed instructions on:

- Docker Deployment (Recommended)
- Manual Deployment (PM2 + Nginx)
- SSL Configuration

See `deployment/` folder for other platform-specific guides.

## 🎯 Next Steps

1. ✅ Configure backend API URL in `.env.local`
2. ✅ Test the application at http://localhost:3000
3. ✅ Customize branding (logo, colors, metadata)
4. ✅ Set up analytics (Google Analytics, Meta Pixel)
5. ✅ Review features in `DOCUMENTATION.html`
6. ✅ Deploy using guides in `deployment/` folder

## 🛠️ Common Issues

### Port 3000 Already in Use

```bash
# Kill the process
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Module Not Found

```bash
rm -rf node_modules package-lock.json .next
npm install --legacy-peer-deps
```

### Build Errors

```bash
# Fix linting issues
npm run lint -- --fix

# Check TypeScript
npm run type-check
```

## 📚 Documentation

- **Full Features** - `DOCUMENTATION.html`
- **Architecture** - `.github/copilot-instructions.md`
- **Deployment** - `deployment/` directory
- **API Guide** - `README.md` (API Service Layer section)
- **Changelog** - `CHANGELOG.md`

## 💬 Support

**This is a premium product purchased from Envato Market.**

### Getting Help

- 📧 **Support Ticket** - Open via your Envato purchase page
- 📚 **Documentation** - Complete guide in `DOCUMENTATION.html`
- 🐛 **Bug Reports** - Report through Envato support system
- � **Feature Requests** - Submit via Envato comments

### Support Coverage

- ✅ 6 months support included with purchase
- ✅ Extended support available for purchase
- ✅ Regular updates and bug fixes
- ✅ Priority email support

### Before Requesting Support

1. Check `DOCUMENTATION.html` for detailed feature guides
2. Review this Quick Start guide
3. Check `TROUBLESHOOTING` section above
4. Verify your environment configuration

---

**DebuggerMind v1.0.0** | Premium E-commerce Solution | Available on [Envato Market](https://themeforest.net)

© 2025 DebuggerMind. All rights reserved.
