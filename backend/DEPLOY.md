# Backend - Video Captioning API

Express.js API server for video captioning platform.

## 🚀 Quick Deploy

### Railway (Recommended)
```bash
railway login
railway init
railway up
```

### Environment Variables (Set in Railway Dashboard)
```
OPENAI_API_KEY=sk-xxx
FRONTEND_URL=https://your-vercel-app.vercel.app
PORT=5001
```

### Local Development
```bash
npm install
cp .env.example .env
# Add your OPENAI_API_KEY
npm run dev
```

## 📦 What's Included
- Video upload endpoint
- OpenAI Whisper transcription
- Caption generation & storage
- CORS configured

## 🔗 Connects To
- Frontend: Receives API calls from Next.js app
- OpenAI: Uses Whisper API for transcription
