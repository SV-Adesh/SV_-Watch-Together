# Watch Together

A real-time video synchronization application that allows multiple users to watch YouTube videos, YouTube Shorts, and MP4 videos together.

![Watch Together](https://i.imgur.com/oqzM2Pu.png)

## Features

- **Room System**: Create or join rooms with a simple code
- **Video Sync**: Perfect synchronization of video playback across all users
- **Multiple Video Types**: Support for YouTube videos, YouTube Shorts, and MP4 videos
- **Reel Mode**: TikTok/Instagram Reels-style interface for vertical videos
- **Real-time Chat**: Built-in chat system for all users in the room
- **Emoji Reactions**: Send emoji reactions that float across the screen
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode**: Sleek dark interface for comfortable viewing

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.io
- **Deployment**: Vercel (frontend), Render (backend)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Local Development Setup

#### Clone the repository

```bash
git clone https://github.com/yourusername/watch-together.git
cd watch-together
```

#### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the server directory (or copy from `.env.example`):

```
PORT=5000
CLIENT_URL=http://localhost:3000
```

4. Start the development server:

```bash
npm run dev
```

The backend server will run on http://localhost:5000

#### Frontend Setup

1. Open a new terminal and navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the client directory (or copy from `.env.example`):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

4. Start the development server:

```bash
npm run dev
```

The frontend will run on http://localhost:3000

### Using the Application

1. Open your browser and go to http://localhost:3000
2. Create a new room or join an existing one with a room code
3. Enter your display name
4. As the host (first person in the room), you can:
   - Play YouTube videos by pasting URLs
   - Play MP4 videos from direct links
   - Create a playlist of videos for Reel Mode
5. All participants will see the video in sync
6. Use the chat to communicate with other viewers
7. Send emoji reactions that appear on everyone's screens

## Deployment

### Deploy the Frontend to Vercel

1. Create a Vercel account if you don't have one: https://vercel.com/signup
2. Install the Vercel CLI:

```bash
npm install -g vercel
```

3. Navigate to the client directory:

```bash
cd client
```

4. Deploy to Vercel:

```bash
vercel
```

5. Follow the prompts to connect to your Vercel account
6. Set the environment variable during deployment:
   - `NEXT_PUBLIC_BACKEND_URL` = Your backend URL (from Render)

Alternatively, you can deploy directly from the Vercel dashboard:
1. Import your repository
2. Set the root directory to `client`
3. Add the environment variable in the project settings

### Deploy the Backend to Render

1. Create a Render account if you don't have one: https://render.com/signup
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure the service:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add environment variables:
   - `PORT` = 5000 (or let Render choose)
   - `CLIENT_URL` = Your frontend URL (from Vercel)

## Project Structure

```
/watch-together
├── /client                # Frontend Next.js application
│   ├── /components        # React components
│   ├── /pages             # Next.js pages
│   ├── /public            # Static files
│   └── /styles            # CSS styles
│
└── /server                # Backend Node.js application
    ├── server.js          # Main server file
    └── package.json       # Node.js dependencies
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Socket.io](https://socket.io/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference) 