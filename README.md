# 🎬 Remotion Video Captioning Platform

A full-stack AI-powered video captioning application that automatically generates captions for videos using OpenAI Whisper API and renders them with Remotion. Supports **Hinglish** (Hindi + English mixed language) captions.

## ✨ Features

- 🎥 **Video Upload**: Upload MP4, MPEG, MOV files (up to 100MB)
- 🤖 **AI-Powered Transcription**: Automatic speech-to-text using OpenAI Whisper API
- 🗣️ **Hinglish Support**: Detects and transcribes mixed Hindi-English audio (Devanagari + English)
- ⏱️ **Timestamped Captions**: Precise start/end times for each caption segment
- 🎨 **Caption Styles**: Choose from Bottom, Top, or Karaoke styles
- ✏️ **Caption Editor**: Edit, delete, and modify generated captions
- 🎬 **Remotion Integration**: Render videos with captions using Remotion
- 📱 **Responsive UI**: Clean, modern interface with Noto Sans fonts

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js** (TypeScript)
- **Multer** for file uploads
- **OpenAI Whisper API** for speech-to-text
- **CORS** enabled for frontend communication

### Frontend
- **Next.js 14** (TypeScript)
- **React** for UI components
- **Axios** for API calls
- **Remotion** for video composition and rendering

### Monorepo Structure
```
Remotion-Captioning-Platform/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── server.ts     # Main server file
│   │   ├── routes/       # API routes
│   │   │   ├── upload.ts
│   │   │   └── captions.ts
│   │   └── services/     # Business logic
│   │       └── whisperService.ts
│   ├── uploads/          # Temporary video storage
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # Next.js application
│   ├── pages/           # Next.js pages
│   │   ├── index.tsx
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── components/      # React components
│   │   ├── VideoUpload.tsx
│   │   ├── VideoPreview.tsx
│   │   └── CaptionEditor.tsx
│   ├── remotion/        # Remotion compositions
│   │   ├── Root.tsx
│   │   ├── compositions/
│   │   │   └── VideoWithCaptions.tsx
│   │   └── components/
│   │       └── CaptionOverlay.tsx
│   ├── lib/             # Utilities and API client
│   │   ├── api.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   └── tsconfig.json
│
├── package.json         # Root package.json (workspace)
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **OpenAI API Key** (for Whisper API)

### Installation

1. **Clone the repository**
   ```bash
   cd "/Users/ashishpundir/Desktop/Personal/Remotion-Captioning -Platform"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   BACKEND_PORT=5000
   BACKEND_URL=http://localhost:5000
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Install workspace dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   
   # Return to root
   cd ..
   ```

### Running the Application

#### Option 1: Run Both Frontend and Backend Together

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend on `http://localhost:3000`

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 Usage Guide

### 1. Upload a Video

1. Click "Choose Video File (.mp4)"
2. Select your video file (MP4, MPEG, or MOV)
3. Wait for upload to complete

### 2. Generate Captions

1. Click "Auto-Generate Captions" button
2. The backend will:
   - Extract audio from video
   - Send to OpenAI Whisper API
   - Process transcription with timestamps
   - Return caption segments
3. Wait for transcription (typically 30-60 seconds for a 1-minute video)

### 3. Select Caption Style

Choose from three preset styles:
- **Bottom**: Traditional bottom-aligned captions (black background)
- **Top**: Top-aligned captions
- **Karaoke**: Animated gradient captions with pulse effect

### 4. Preview Video

- Video plays with real-time caption overlay
- Captions appear automatically based on timestamp
- Current caption text shown below video

### 5. Edit Captions (Optional)

- Click ✏️ to edit caption text
- Click 🗑️ to delete a caption
- Save changes before exporting

### 6. Export Video (Coming Soon)

Remotion rendering integration for final video export.

## 🔧 API Endpoints

### Backend API

#### Upload Video
```http
POST /api/upload
Content-Type: multipart/form-data

Request:
- video: File (mp4, mpeg, mov)

Response:
{
  "success": true,
  "message": "Video uploaded successfully",
  "file": {
    "filename": "video-1234567890.mp4",
    "originalName": "my-video.mp4",
    "path": "/path/to/uploads/video-1234567890.mp4",
    "size": 1234567,
    "mimetype": "video/mp4",
    "uploadedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Generate Captions
```http
POST /api/captions/generate
Content-Type: application/json

Request:
{
  "filename": "video-1234567890.mp4",
  "language": "hi" // optional, auto-detect by default
}

Response:
{
  "success": true,
  "captions": [
    {
      "id": 1,
      "start": 0.0,
      "end": 2.5,
      "text": "नमस्ते, welcome to our video"
    },
    {
      "id": 2,
      "start": 2.5,
      "end": 5.0,
      "text": "आज हम बात करेंगे about AI"
    }
  ],
  "language": "hindi",
  "duration": 60.5
}
```

#### Save Captions
```http
POST /api/captions/save
Content-Type: application/json

Request:
{
  "filename": "video-1234567890.mp4",
  "captions": [...]
}

Response:
{
  "success": true,
  "message": "Captions saved successfully",
  "path": "/path/to/uploads/video-1234567890-captions.json"
}
```

#### Get Saved Captions
```http
GET /api/captions/:filename

Response:
{
  "success": true,
  "captions": [...]
}
```

## 🎨 Caption Styles

### Bottom Style
- Position: Bottom of video (120px from bottom)
- Background: Semi-transparent black (85% opacity)
- Font: Noto Sans / Noto Sans Devanagari
- Size: 48px, Bold

### Top Style
- Position: Top of video (80px from top)
- Background: Semi-transparent black (85% opacity)
- Font: Noto Sans / Noto Sans Devanagari
- Size: 48px, Bold

### Karaoke Style
- Position: Bottom of video (120px from bottom)
- Background: Gradient (red to yellow)
- Animation: Pulse effect (scale 1.0 to 1.05)
- Font: Noto Sans / Noto Sans Devanagari
- Size: 48px, Bold
- Shadow: Text shadow for readability

## 🌐 Hinglish Support

The platform fully supports **Hinglish** (mixed Hindi-English) transcription:

- ✅ Devanagari script (हिंदी)
- ✅ English text
- ✅ Mixed sentences (e.g., "आज हम discuss करेंगे about AI")
- ✅ Automatic language detection
- ✅ Proper Unicode support
- ✅ Noto Sans Devanagari font for correct rendering

### Example Hinglish Captions:
```
"नमस्ते friends, आज का topic है machine learning"
"यह video बहुत important है for beginners"
"Let's start करते हैं with basics"
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for Whisper | Required |
| `BACKEND_PORT` | Backend server port | 5000 |
| `BACKEND_URL` | Backend URL | http://localhost:5000 |
| `NEXT_PUBLIC_API_URL` | Frontend API endpoint | http://localhost:5000 |

## 🧪 Development

### Build for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

### Lint Code

**Frontend:**
```bash
cd frontend
npm run lint
```

### Clean Build

**Backend:**
```bash
cd backend
npm run clean
```

## 📝 API Key Setup

### Getting OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Note**: OpenAI Whisper API charges based on audio duration. Check [OpenAI Pricing](https://openai.com/pricing) for current rates.

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
```

### Backend not starting
- Check if port 5000 is available
- Verify `.env` file exists and has correct values
- Check backend logs for errors

### Frontend not connecting to backend
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env`
- Verify CORS is enabled in backend

### Whisper API errors
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has credits
- Ensure video file has audio track

### Video not playing in preview
- Check video file format (must be web-compatible MP4)
- Verify backend `/uploads` folder exists
- Check browser console for errors

## 🚀 Future Enhancements

- [ ] Video rendering with Remotion (export final video)
- [ ] Support for more caption styles (shadow, outline, custom colors)
- [ ] Batch video processing
- [ ] Custom font selection
- [ ] Caption timing adjustment UI
- [ ] SRT/VTT export format
- [ ] Multiple language support beyond Hinglish
- [ ] Cloud storage integration (S3, GCS)
- [ ] User authentication
- [ ] Project/workspace management

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [OpenAI Whisper](https://openai.com/research/whisper) - Speech recognition
- [Remotion](https://www.remotion.dev/) - Video rendering framework
- [Next.js](https://nextjs.org/) - React framework
- [Express.js](https://expressjs.com/) - Backend framework
- [Noto Fonts](https://fonts.google.com/noto) - Typography

## 📞 Support

For issues, questions, or contributions:
1. Check existing issues
2. Create a new issue with detailed description
3. Include error logs and steps to reproduce

---

**Made with ❤️ for video creators and developers**
