# Video Captioning Platform - Backend

Express.js backend with Remotion video rendering.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your OpenAI API key to .env

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

### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render / Heroku / DigitalOcean
- Build Command: `npm run build`
- Start Command: `npm start`
- Add environment variables in dashboard

## API Endpoints

- `POST /api/upload` - Upload video
- `POST /api/captions/generate` - Generate captions
- `POST /api/captions/save` - Save captions
- `GET /api/captions/:filename` - Get captions
- `POST /api/render/export` - Render video with captions
- `GET /download/:filename` - Download rendered video

## Tech Stack

- Express.js + TypeScript
- Remotion (server-side rendering)
- OpenAI Whisper API
- Multer (file uploads)
