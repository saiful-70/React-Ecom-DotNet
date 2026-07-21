# DebuggerMind - Premium Next.js 15 E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Envato-green?style=flat-square)](https://codecanyon.net/licenses/standard)

A premium, production-ready e-commerce platform built with Next.js 15 App Router, featuring multi-language support (Bengali primary), real-time analytics, and seamless API integration. **Available exclusively on Envato Market.**

## ✨ Key Features

### 🛍️ E-commerce Essentials

- **Product Catalog** - Advanced filtering, search, pagination with server-side rendering
- **Shopping Cart** - Persistent cart with real-time updates and quantity management
- **Secure Checkout** - Multi-step checkout with order confirmation
- **Order Tracking** - Complete order history and status tracking
- **User Authentication** - JWT-based auth with protected routes
- **Wishlist** - Save products for later with sync across devices

### 🎨 User Experience

- **Multi-Language Support** - 6 languages (Bengali, English, Spanish, French, Hindi, Arabic)
- **RTL Support** - Full right-to-left layout for Arabic
- **Dark/Light Mode** - System-aware theme switching
- **Responsive Design** - Mobile-first, works on all devices
- **Live Chat Widget** - Real-time customer support
- **Cookie Consent** - GDPR-compliant cookie management

### � Analytics & Tracking

- **Google Analytics 4** - Complete e-commerce tracking
- **Meta Pixel** - Facebook conversion tracking
- **Custom Events** - Track user behavior and conversions
- **Privacy-First** - Consent-based analytics loading

### � Performance & SEO

- **Server-Side Rendering** - Optimal SEO with pre-rendered pages
- **Static Generation** - Fast page loads for static content
- **Structured Data** - Schema.org markup for rich snippets
- **Dynamic Sitemap** - Auto-generated with product pages
- **Image Optimization** - Next.js Image component with lazy loading
- **Code Splitting** - Automatic route-based splitting

### 🔧 Developer Experience

- **TypeScript** - Full type safety across the application
- **Fluent API Client** - Builder pattern for all HTTP requests
- **Server Actions** - Type-safe data mutations
- **Path Aliases** - Clean imports with `@/` prefix
- **Hot Reload** - Instant feedback during development
- **ESLint + Prettier** - Consistent code quality

## 📁 Project Structure

```
app/
├── (app-routes)/          # Protected routes with authentication
│   ├── (auth)/            # Login and register pages
│   ├── products/          # Product catalog with filters
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Order checkout
│   └── profile/           # User profile and orders
├── components/            # React components
│   ├── home/              # Homepage sections
│   ├── layout/            # Header, Footer, Navigation
│   ├── pages/             # Page-level components
│   ├── product/           # Product-related components
│   └── shared/            # Reusable shared components
├── contexts/              # React Context (Cart state)
├── hooks/                 # Custom React hooks
├── i18n/                  # Internationalization (6 languages)
├── lib/                   # Utilities and helpers
│   ├── api-client.ts      # Fluent API client interface
│   ├── api-route.ts       # API endpoint definitions
│   └── config/            # Configuration files
├── store/                 # Jotai atoms (state management)
└── layout.tsx             # Root layout with providers
```

## 🔐 Architecture Highlights

### Server-Side Rendering & SEO

- All product pages are server-rendered for optimal SEO
- Structured data and meta tags for search engines
- Automatic sitemap and robots.txt generation

### API Service Layer

- Fluent builder pattern for all HTTP requests
- Type-safe API responses
- Automatic authentication with JWT tokens
- Server-side caching for categories (1-hour TTL)

### Multi-Language Support

- 6 languages: English, Bengali (default), Spanish, French, Hindi, Arabic
- RTL support for Arabic
- Easy to add new languages

### State Management

- **Jotai**: Client-side state (user profile, wishlist)
- **React Context**: Cart management
- **Server Actions**: Data fetching and mutations

## � Quick Start

### Prerequisites

- **Node.js** 18+ and npm installed - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Backend API** endpoint (contact support for API access)

### Installation

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd e-commerce-envato

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local with your API credentials

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Configuration

#### Required Variables

Create `.env.local` for development or `.env.production` for production:

```env
# API Configuration (REQUIRED)
API_BASE_URL=https://your-api-endpoint.com
API_BASE_URL_V1=https://your-api-endpoint.com/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Analytics (OPTIONAL)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456
```

#### Environment Files Structure

```
.env.local       # Development (gitignored)
.env.production  # Production build (gitignored)
.env.example     # Template (committed to git)
```

## 📚 Available Commands

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Create optimized production build
npm start            # Start production server
npm run lint         # Run ESLint checks
npm run type-check   # Check TypeScript errors
```

## 🛠️ What technologies are used for this project?

This project is built with:

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **React** - UI library with Server/Client components
- **shadcn/ui** - High-quality component library
- **Tailwind CSS** - Utility-first CSS framework
- **Jotai** - Lightweight state management
- **React Hook Form** - Efficient form handling
- **Zod** - TypeScript-first schema validation
- **next-i18next** - Multi-language support (Bengali, English, Spanish, French, Hindi, Arabic)
- **Sonner** - Toast notifications
- **next-themes** - Dark/light mode support

## � Docker Deployment

### Development with Docker

```bash
# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down
```

### Production with Docker

```bash
# Start production environment
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

**Note:** Docker automatically loads `.env.local` for dev and `.env.production` for production.

## 🌐 Platform Deployment Guides

### Vercel (Recommended)

**Fastest and easiest deployment for Next.js:**

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project on [vercel.com](https://vercel.com)
3. Configure environment variables in Vercel dashboard:
   - `API_BASE_URL`
   - `API_BASE_URL_V1`
   - `NEXT_PUBLIC_SITE_URL`
   - (Optional) `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - (Optional) `NEXT_PUBLIC_META_PIXEL_ID`
4. Deploy automatically on every git push

### Railway

**Simple deployment with Docker support:**

1. Create new project on [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Railway auto-detects Next.js and builds
5. Get your deployment URL

See `deployment/RAILWAY.md` for detailed steps.

### VPS Deployment (AWS, DigitalOcean, Linode, etc.)

For any VPS provider, we provide a comprehensive guide covering Docker and manual (PM2) deployment.

See `deployment/VPS_GENERIC.md` for detailed instructions on:

- Docker Deployment (Recommended)
- Manual Deployment (PM2 + Nginx)
- SSL Configuration

Specific guides are also available:

- **AWS EC2**: `deployment/AWS_EC2.md`
- **DigitalOcean**: `deployment/DIGITALOCEAN.md`

### Other Platforms

This application works on any Node.js hosting platform:

- **Azure App Service** - Microsoft cloud platform
- **Google Cloud Run** - Serverless containers
- **Render** - Zero-config deployments
- **Netlify** - Edge functions support
- **Heroku** - Classic PaaS (buildpack support)

**General deployment requirements:**

- Node.js 18+
- Build command: `npm run build`
- Start command: `npm start`
- Port: 3000 (configurable via `PORT` env var)

## 📖 Documentation

- **Architecture & Patterns** - `.github/copilot-instructions.md`
- **Complete Feature Guide** - `DOCUMENTATION.html`
- **Deployment Guides** - `deployment/` directory
- **Changelog** - `CHANGELOG.md`

## 🔒 Security Best Practices

- ✅ JWT token stored in HTTP-only cookies
- ✅ CSRF protection with SameSite cookies
- ✅ Environment variables never exposed to client
- ✅ API routes protected by middleware
- ✅ Input validation with Zod schemas
- ✅ XSS protection via React's built-in escaping

## 🛠️ Troubleshooting

### Build Errors

**ESLint errors during build:**

```bash
npm run lint -- --fix
```

**TypeScript errors:**

```bash
npm run type-check
```

**Module not found:**

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Development Issues

**Port 3000 already in use:**

```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

**Hot reload not working:**

- Check if `.next` folder has proper permissions
- Try deleting `.next` folder and restart

### Docker Issues

**Container fails to start:**

```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📧 **Email Support** - Contact via Envato Market
- 📚 **Documentation** - Check `DOCUMENTATION.html`
- 🐛 **Bug Reports** - Create an issue in the repository
- 💬 **Feature Requests** - Open a discussion

## 📄 License

This project is licensed for use as purchased through Envato Market. See `LICENSE.txt` for details.

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Jotai](https://jotai.org/) - State management
- [React Hook Form](https://react-hook-form.com/) - Form handling
- [Zod](https://zod.dev/) - Schema validation

---

**Made with ❤️ by DebuggerMind Team** | **Version 1.0.0** | **Next.js 15**
