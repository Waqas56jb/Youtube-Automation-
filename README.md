# 🎬 Video Caption Generator

A professional FastAPI web application that automatically generates captions for your videos in the exact universal format you specified: **Hook + Value + CTA + Hashtags**.

## ✨ Features

- **🎯 Universal Format**: Generates captions in your exact format (Hook, Value, CTA, Hashtags)
- **🔍 Smart Detection**: Automatically skips videos that already have captions
- **📝 Multiple Templates**: AI/Tech, Tutorial, and General content templates
- **🌐 Web Interface**: Beautiful, responsive web UI for easy management
- **🔧 FastAPI REST API**: Modern, fast API with automatic documentation
- **📊 Real-time Status**: Live updates on caption progress and completion
- **🗂️ File Management**: Automatic file organization and cleanup
- **⚡ Batch Processing**: Handle multiple videos at once
- **📺 YouTube Integration**: Direct upload to YouTube with generated titles and descriptions
- **🔐 OAuth2 Authentication**: Secure YouTube authentication with automatic token refresh
- **🔄 Lifetime Automation**: Never expires - automatic token refresh for continuous operation

## 🏗️ Architecture

### Backend (FastAPI)
```
backend/
├── main.py                 # FastAPI application entry point
├── routers/               # API route modules
│   ├── videos.py          # Video management endpoints
│   ├── captions.py        # Caption generation endpoints
│   ├── youtube.py         # YouTube integration endpoints
│   └── utils.py           # Utility endpoints
├── models/
│   ├── database.py        # Database operations
│   └── video_info.py      # Data models
├── services/
│   ├── caption_service.py # Caption generation logic
│   ├── video_service.py   # Video file management
│   └── youtube_service.py # YouTube API integration
└── utils/
    └── config.py          # Configuration management
```

### Frontend (HTML/CSS/JS)
```
frontend/
├── index.html             # Main application page
├── styles/
│   └── main.css          # Modern, responsive styling
└── js/
    ├── api.js            # API communication
    ├── ui.js             # UI utilities and components
    └── app.js            # Main application logic
```

## 🚀 Quick Start

### 1. Installation

**Prerequisites:**
- Python 3.8+
- Node.js 14+ (for frontend development)
- pip (Python package manager)
- npm (Node package manager)

**Steps:**
1. Clone or download the project
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install Node.js dependencies:
   ```bash
   npm install
   ```

### 2. Run the Application

**Option 1: Using the start script (Recommended)**
```bash
python start_backend.py
```

**Option 2: Using uvicorn directly**
```bash
py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Option 3: Frontend development server**
```bash
npm run dev
```

### 3. Access the Application

- **Main App**: `http://localhost:8000`
- **API Documentation**: `http://localhost:8000/docs`
- **Frontend Dev**: `http://localhost:3000` (if using npm run dev)
- **Health Check**: `http://localhost:8000/api/health`

## 📺 YouTube Integration

### Setup
1. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create OAuth 2.0 credentials
   - Download the `client_secrets.json` file

2. **Place credentials file**:
   - Put `client_secrets.json` in the project root
   - The app will automatically detect and use it

### Usage
1. **Generate captions** for your videos using the web interface
2. **Click the red "Upload" button** next to any captioned video
3. **Authenticate with Google** when prompted
4. **Video uploads automatically** with generated title, description, and tags

### Features
- **Automatic Title Generation**: From your captions
- **Smart Descriptions**: With timestamps and hashtags
- **Topic-Based Tags**: AI, tech, tutorial tags
- **Private Uploads**: Start private, change later in YouTube Studio
- **Progress Tracking**: Shows upload progress
- **Upload History**: Track all your YouTube uploads

## 🎯 Caption Format

The application generates captions in your specified universal format:

```
🚀 [HOOK - 1 line]: Grab attention immediately

[VALUE - 2-3 lines]: Explain what the video is about or what viewers will gain.

👉 [CTA]: Encourage viewers to like, share, comment, or follow.

#Hashtags (10-15 max): Balanced mix of broad + niche tags
```

### Example Output:
```
🚀 Ready to take your AI skills to the next level?

In this video, I break down how decision-making works for pilots using real-time stability analysis. Perfect for anyone interested in AI, computer vision, or safety-critical systems.

👉 Follow for more AI/ML insights & practical projects!

#AI #MachineLearning #DeepLearning #ComputerVision #DataScience #Innovation #TechForGood #FutureOfWork #AIProjects #ArtificialIntelligence #PilotSafety #SmartTechnology #WatchTillEnd
```

## 🔧 API Endpoints

### Video Management
- `GET /api/videos` - Get all videos and their caption status
- `GET /api/videos/status` - Get detailed status of all videos

### Caption Management
- `POST /api/captions/generate` - Generate captions for videos
- `POST /api/captions/regenerate` - Regenerate caption for specific video
- `DELETE /api/captions/delete` - Delete caption for specific video
- `GET /api/captions/list` - List all videos with captions

### YouTube Integration
- `GET /api/youtube/auth/status` - Check YouTube authentication status
- `POST /api/youtube/upload` - Upload video to YouTube
- `GET /api/youtube/uploads` - Get YouTube upload history
- `POST /api/youtube/auth/revoke` - Revoke YouTube authentication

### Utilities
- `POST /api/cleanup` - Clean up orphaned caption files
- `GET /api/health` - Health check endpoint

## 🛠️ Development

### Project Structure
```
video-caption-generator/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── routers/            # API route modules
│   ├── models/             # Data models
│   ├── services/           # Business logic
│   └── utils/              # Utilities
├── frontend/               # Frontend application
│   ├── index.html          # Main page
│   ├── styles/             # CSS files
│   └── js/                 # JavaScript files
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
├── start_backend.py        # Backend start script
└── README.md              # This file
```

### Running in Development

**Backend (FastAPI with auto-reload):**
```bash
py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend (Live server with auto-reload):**
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
YOUTUBE_CREDENTIALS_FILE=client_sectets.json
YOUTUBE_TOKEN_FILE=data/youtube_token.pickle
```

## 🚀 Deployment

### Local Production
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Run backend
python start_backend.py

# Run frontend (in another terminal)
npm run dev
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📝 Configuration

### Caption Templates

The application supports multiple caption templates:

1. **AI/Tech Template** (`ai_tech`): For AI, machine learning, and technology content
2. **Tutorial Template** (`tutorial`): For educational and how-to content
3. **General Template** (`general`): For general-purpose content

### Video File Support

Supported video formats:
- `.mp4`
- `.avi`
- `.mov`
- `.mkv`
- `.wmv`
- `.flv`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the API documentation at `http://localhost:8000/docs`
2. Verify your YouTube credentials are properly configured
3. Ensure all dependencies are installed
4. Check the console for error messages

## 🎉 Features in Detail

### Smart Caption Generation
- **Template-based**: Uses different templates for different content types
- **Context-aware**: Analyzes video content to generate relevant captions
- **Format compliance**: Strictly follows your universal format specification
- **Hashtag optimization**: Balances broad and niche hashtags for maximum reach

### YouTube Automation
- **OAuth2 Integration**: Secure authentication with Google
- **Automatic Metadata**: Generates titles, descriptions, and tags from captions
- **Batch Upload**: Upload multiple videos with one click
- **Progress Tracking**: Real-time upload progress and status
- **Error Handling**: Comprehensive error handling and recovery

### Professional UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live status updates and progress tracking
- **Intuitive Interface**: Easy-to-use interface for all skill levels
- **Modern Styling**: Clean, professional design

---

**Ready to revolutionize your video content workflow?** 🚀

Start generating professional captions and uploading to YouTube with just a few clicks!