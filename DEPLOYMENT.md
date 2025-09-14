# 🚀 Deployment Guide

## Overview

This guide covers deploying the Stock Portfolio Tracker application to various platforms, with detailed instructions for production deployment, environment configuration, and monitoring setup.

## 🌐 Platform Options

### Recommended Platforms

1. **Vercel** (Recommended)

   - ✅ Native Next.js support
   - ✅ Automatic deployments
   - ✅ Built-in analytics
   - ✅ Edge functions
   - ✅ Free tier available

2. **Netlify**

   - ✅ Static site hosting
   - ✅ Serverless functions
   - ✅ Form handling
   - ✅ Free tier available

3. **Railway**

   - ✅ Full-stack deployment
   - ✅ Database support
   - ✅ Environment management
   - ✅ Automatic scaling

4. **AWS (Advanced)**
   - ✅ Complete control
   - ✅ Scalability
   - ✅ Integration options
   - ❌ More complex setup

## 🎯 Vercel Deployment (Recommended)

### Prerequisites

- GitHub/GitLab/Bitbucket account
- Vercel account
- Environment variables ready

### Step 1: Prepare Repository

1. **Push to Git Repository**:

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verify Build Locally**:
   ```bash
   pnpm build
   pnpm start
   ```

### Step 2: Deploy to Vercel

1. **Connect Repository**:

   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Select "Next.js" framework (auto-detected)

2. **Configure Build Settings**:

   ```bash
   # Build Command
   pnpm build

   # Output Directory
   .next

   # Install Command
   pnpm install

   # Development Command
   pnpm dev
   ```

3. **Environment Variables**:

   ```bash
   # Add in Vercel dashboard under Settings > Environment Variables
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   KITE_API_KEY=your_kite_api_key
   KITE_API_SECRET=your_kite_api_secret
   KITE_ACCESS_TOKEN=your_kite_access_token
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build completion
   - Visit your deployed application

### Step 3: Custom Domain (Optional)

1. **Add Domain**:

   - Go to Project Settings > Domains
   - Add your custom domain
   - Configure DNS settings

2. **SSL Certificate**:
   - Automatically provided by Vercel
   - HTTPS enforced by default

### Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["bom1", "sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, s-maxage=300, stale-while-revalidate=300"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Stock Data APIs
ALPHA_VANTAGE_API_KEY=prod_alpha_vantage_key

# Zerodha Kite API (Production)
KITE_API_KEY=prod_kite_api_key
KITE_API_SECRET=prod_kite_api_secret
KITE_ACCESS_TOKEN=prod_kite_access_token

# Application Settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Environment Variable Management

1. **Development (.env.local)**:

   ```bash
   ALPHA_VANTAGE_API_KEY=demo
   KITE_API_KEY=dev_kite_key
   KITE_API_SECRET=dev_kite_secret
   KITE_ACCESS_TOKEN=dev_access_token
   ```

2. **Production (Vercel Dashboard)**:

   - Set via web interface
   - Use CLI: `vercel env add`
   - Import from file: `vercel env pull`

3. **Staging Environment**:

   ```bash
   # Create staging branch
   git checkout -b staging

   # Deploy to staging
   vercel --target staging
   ```

## 🏗️ Build Optimization

### Next.js Configuration

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
    ],
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },

  // Compression
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config) => {
      config.plugins.push(
        new (require("@next/bundle-analyzer"))({
          enabled: true,
        })
      );
      return config;
    },
  }),
};

export default nextConfig;
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "build:analyze": "ANALYZE=true npm run build",
    "deploy": "vercel --prod",
    "deploy:staging": "vercel"
  }
}
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Use official Node.js runtime
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN corepack enable pnpm && pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  stock-tracker:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY}
      - KITE_API_KEY=${KITE_API_KEY}
      - KITE_API_SECRET=${KITE_API_SECRET}
      - KITE_ACCESS_TOKEN=${KITE_ACCESS_TOKEN}
    restart: unless-stopped

  # Optional: Redis for caching
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

### Deployment Commands

```bash
# Build and run with Docker
docker build -t stock-tracker .
docker run -p 3000:3000 --env-file .env.local stock-tracker

# Using Docker Compose
docker-compose up -d

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Setup Amplify**:

   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   amplify init
   ```

2. **Deploy**:
   ```bash
   amplify add hosting
   amplify publish
   ```

### Using AWS ECS

1. **Create Task Definition**:
   ```json
   {
     "family": "stock-tracker",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "stock-tracker",
         "image": "your-account.dkr.ecr.region.amazonaws.com/stock-tracker:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "ALPHA_VANTAGE_API_KEY",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:stock-tracker-secrets"
           }
         ]
       }
     ]
   }
   ```

## 📊 Monitoring & Analytics

### Vercel Analytics

1. **Enable Analytics**:

   ```bash
   pnpm add @vercel/analytics
   ```

2. **Add to Layout**:

   ```typescript
   import { Analytics } from "@vercel/analytics/react";

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

### Error Monitoring

1. **Sentry Integration**:

   ```bash
   pnpm add @sentry/nextjs
   ```

2. **Configuration**:

   ```javascript
   // sentry.client.config.js
   import * as Sentry from "@sentry/nextjs";

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 1.0,
   });
   ```

### Performance Monitoring

1. **Web Vitals**:

   ```typescript
   // pages/_app.tsx
   export function reportWebVitals(metric: NextWebVitalsMetric) {
     console.log(metric);

     // Send to analytics
     if (metric.label === "web-vital") {
       gtag("event", metric.name, {
         value: Math.round(metric.value),
         event_label: metric.id,
         non_interaction: true,
       });
     }
   }
   ```

## 🔒 Security Configuration

### Security Headers

```javascript
// next.config.mjs
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
```

### Environment Security

1. **Secret Management**:

   ```bash
   # Use secure secret management
   vercel env add KITE_API_SECRET production

   # Encrypt sensitive values
   echo "secret_value" | openssl enc -aes-256-cbc -base64
   ```

2. **API Key Rotation**:
   ```bash
   # Rotate keys regularly
   # Update in deployment platform
   # Test with new keys
   # Remove old keys
   ```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Code review completed
- [ ] All tests passing
- [ ] Build successful locally
- [ ] Environment variables configured
- [ ] Security headers implemented
- [ ] Performance optimizations applied
- [ ] Error handling tested

### Deployment

- [ ] Deploy to staging first
- [ ] Test all functionality
- [ ] Verify API integrations
- [ ] Check mobile responsiveness
- [ ] Test error scenarios
- [ ] Verify analytics tracking

### Post-Deployment

- [ ] Monitor application logs
- [ ] Check performance metrics
- [ ] Verify SSL certificate
- [ ] Test from different locations
- [ ] Monitor API usage
- [ ] Set up alerts

### Ongoing Maintenance

- [ ] Regular dependency updates
- [ ] Security patches
- [ ] Performance monitoring
- [ ] API key rotation
- [ ] Backup configurations
- [ ] Documentation updates

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "pnpm"

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Build application
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## 📈 Performance Tips

### Build Optimization

1. **Bundle Analysis**:

   ```bash
   pnpm add -D @next/bundle-analyzer
   ANALYZE=true pnpm build
   ```

2. **Code Splitting**:

   ```typescript
   import dynamic from "next/dynamic";

   const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
     loading: () => <p>Loading...</p>,
   });
   ```

3. **Image Optimization**:

   ```typescript
   import Image from "next/image";

   <Image
     src="/stock-chart.png"
     alt="Stock Chart"
     width={800}
     height={400}
     priority={false}
     placeholder="blur"
   />;
   ```

### Runtime Optimization

1. **API Caching**:

   ```typescript
   // Add caching headers
   res.setHeader(
     "Cache-Control",
     "public, s-maxage=300, stale-while-revalidate=300"
   );
   ```

2. **Database Optimization**:
   ```typescript
   // Use connection pooling
   // Implement query optimization
   // Add database indexes
   ```

This comprehensive deployment guide ensures your Stock Portfolio Tracker application is deployed securely, efficiently, and with proper monitoring in place.
