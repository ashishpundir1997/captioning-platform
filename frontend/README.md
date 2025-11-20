# Video Captioning Platform - Frontend

Next.js frontend for video captioning application.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update API URL in .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

See `.env.example` for required configuration.

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Netlify
- Build Command: `npm run build`
- Publish Directory: `.next`
- Add environment variables in Netlify dashboard

## Tech Stack

- Next.js 14
- React
- TypeScript
- Axios
- CSS3
