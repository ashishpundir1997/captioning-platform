# 🎬 Remotion Video Captioning Platform

AI-powered video captioning with OpenAI Whisper API and Remotion. Supports Hinglish (Hindi + English) transcription.

## ✨ Features

- 🎥 Video upload (MP4, MPEG, MOV - up to 100MB)
- 🤖 AI transcription with OpenAI Whisper
- 🗣️ Hinglish support (Devanagari + English)
- ⏱️ Timestamped captions
- 🎨 Multiple caption styles (Bottom, Top, Karaoke)
- ✏️ Caption editor
- 🎬 Remotion video rendering

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- OpenAI API Key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit `.env`:
```env
ASSEMBLYAI_API_KEY=sk-your-key-here
BACKEND_PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run Application

```bash
# Start both frontend and backend
npm run dev
```

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

## 📖 Usage

1. **Upload Video**: Select MP4/MPEG/MOV file
2. **Generate Captions**: Click "Auto-Generate Captions"
3. **Select Style**: Choose Bottom, Top, or Karaoke
4. **Preview**: View video with real-time captions
5. **Edit**: Modify captions as needed
6. **Export**: Render final video (coming soon)

## 🔧 API Endpoints

- `POST /api/upload` - Upload video
- `POST /api/captions/generate` - Generate captions
- `POST /api/captions/save` - Save captions
- `GET /api/captions/:filename` - Get saved captions

## 🌐 Hinglish Support

Fully supports mixed Hindi-English text:
- Devanagari script (हिंदी)
- English text
- Mixed sentences
- Noto Sans Devanagari font

## 🐛 Troubleshooting

**Dependencies issue:**
```bash
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

**Backend not starting:**
- Check port 5000 availability
- Verify `.env` configuration

**Assembly API errors:**
- Confirm Assembly API key is valid
- Ensure account has credits

## 📄 License

MIT License

---

**Made with ❤️ for video creators**
