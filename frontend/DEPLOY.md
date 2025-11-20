# Frontend - Video Captioning UI

Next.js application for video captioning with Remotion rendering.

## 🚀 Quick Deploy

### Vercel (Recommended)
```bash
vercel
```

### Environment Variables (Set in Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Local Development
```bash
npm install
cp .env.example .env
# Update NEXT_PUBLIC_API_URL
npm run dev
```

## 📦 What's Included
- Video upload UI
- Caption editor
- Remotion video preview
- Video export functionality

## 🔗 Connects To
- Backend API: For video upload & caption generation
- Browser: Renders UI and Remotion previews

## ⚠️ Note
Remotion components stay in frontend - they're only used for client-side preview.
Video export happens via backend API calls.
