# Funny - Kids AI Chat Friend

"Funny" is a highly interactive, safe, and magical AI chat friend designed exclusively for kids aged 3-15. It features bright animations, voice interactions, child-friendly themes, and strict backend safety checks.

## Tech Stack
- **Client**: Next.js (App Router), Tailwind CSS, Framer Motion, Web Speech API (Voice/TTS)
- **Server**: Express.js, MongoDB (Mongoose), JWT Authentication, OpenAI-Compatible API

## Installation and Setup

### 1. Server Setup
The backend handles all data storage, profile isolation, and AI filtering.

```bash
cd server
npm install
```

Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/funnydb
JWT_SECRET=your_super_secret_jwt_key
CLIENT_ORIGIN=http://localhost:3000
AI_API_URL=https://api.openai.com/v1/chat/completions # Or any compatible provider
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-3.5-turbo # Or your model
```

Start the development server:
```bash
npm run dev
```

### 2. Client Setup
The frontend provides the animated wizard and chat UI.

```bash
cd client
npm install
```

Create a `.env.local` file in the `/client` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start the frontend server:
```bash
npm run dev
```

### 3. Usage
- Open `http://localhost:3000` in your browser.
- Complete the onboarding wizard to pick a character and age.
- Chat away using text or your voice!

## Features
- **Total Data Privacy**: Kids' accounts are strictly isolated using `profileId`. A built-in "Ask a parent" button allows parents to instantly wipe all data from the database.
- **Safety First**: Backend middleware strips bad words and blocks PII (phone numbers, emails) from ever reaching the AI.
- **Voice Friendly**: Talk directly to the AI, and it talks back (auto-pitch tuned for ages 3-7).
- **Themes**: Multiple beautiful, animated backgrounds that adapt dynamically (e.g., auto-night mode).
