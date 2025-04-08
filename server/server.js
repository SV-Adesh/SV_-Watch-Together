const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const config = require('./config');

const app = express();

// Create server
const server = http.createServer(app);

// Enable CORS
app.use(cors(config.cors));

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: config.cors
});

// Store active rooms and their data
const rooms = {};

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Retrieve roomId from the connection query
  const { roomId } = socket.handshake.query;
  
  if (roomId) {
    // Add user to the room's users list
    if (!rooms[roomId]) {
      // If room doesn't exist, create it and make this user the host
      rooms[roomId] = {
        host: socket.id,
        users: [socket.id],
        videoUrl: null,
        videoType: 'youtube',
        videoMode: 'normal',
        reelVideos: [],
        reelIndex: 0
      };
      socket.emit('host-assigned', true);
    } else {
      // Room exists, add user to it
      rooms[roomId].users.push(socket.id);
      socket.emit('host-assigned', false);
      
      // Send current video state to the new user
      if (rooms[roomId].videoUrl) {
        socket.emit('video-change', {
          videoUrl: rooms[roomId].videoUrl,
          videoType: rooms[roomId].videoType,
          videoMode: rooms[roomId].videoMode
        });
      }
      
      // Send reel videos if in reel mode
      if (rooms[roomId].videoMode === 'reel' && rooms[roomId].reelVideos.length > 0) {
        socket.emit('reel-videos', rooms[roomId].reelVideos);
        socket.emit('reel-index', rooms[roomId].reelIndex);
      }
    }
    
    // Add socket to the room
    socket.join(roomId);
    
    // Notify all users in the room about the updated user count
    io.to(roomId).emit('user-count', rooms[roomId].users.length);
  }
  
  // Handle user joining room
  socket.on('join-room', (data) => {
    console.log(`User ${socket.id} joined room ${data.roomId} as ${data.userName}`);
    socket.data.userName = data.userName || `User-${socket.id.substring(0, 5)}`;
  });
  
  // Handle update username
  socket.on('update-username', (data) => {
    socket.data.userName = data.userName;
  });
  
  // Handle video change
  socket.on('video-change', (data) => {
    const { roomId, videoUrl, videoType, videoMode } = data;
    
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      rooms[roomId].videoUrl = videoUrl;
      rooms[roomId].videoType = videoType;
      rooms[roomId].videoMode = videoMode;
      
      // Broadcast to all users in the room
      socket.to(roomId).emit('video-change', { videoUrl, videoType, videoMode });
    }
  });
  
  // Handle reel videos change
  socket.on('reel-videos', (data) => {
    const { roomId, videos } = data;
    
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      rooms[roomId].reelVideos = videos;
      
      // Broadcast to all users in the room
      socket.to(roomId).emit('reel-videos', videos);
    }
  });
  
  // Handle reel index change
  socket.on('reel-index', (data) => {
    const { roomId, index } = data;
    
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      rooms[roomId].reelIndex = index;
      
      // Broadcast to all users in the room
      socket.to(roomId).emit('reel-index', index);
    }
  });
  
  // Handle video play
  socket.on('video-play', (data) => {
    const { roomId } = data;
    
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      // Broadcast to all users in the room
      socket.to(roomId).emit('video-play');
    }
  });
  
  // Handle video pause
  socket.on('video-pause', (data) => {
    const { roomId } = data;
    
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      // Broadcast to all users in the room
      socket.to(roomId).emit('video-pause');
    }
  });
  
  // Handle video seek
  socket.on('video-seek', (data) => {
    const { roomId, time } = data;
    
    if (rooms[roomId] && rooms[roomId].host === socket.id) {
      // Broadcast to all users in the room
      socket.to(roomId).emit('video-seek', time);
    }
  });
  
  // Handle chat messages
  socket.on('chat-message', (data) => {
    const { roomId, message } = data;
    const userName = socket.data.userName || `User-${socket.id.substring(0, 5)}`;
    
    // Broadcast to all users in the room
    io.to(roomId).emit('chat-message', {
      userName,
      message,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle emoji reactions
  socket.on('emoji-reaction', (data) => {
    const { roomId, emoji } = data;
    const userName = socket.data.userName || `User-${socket.id.substring(0, 5)}`;
    
    // Broadcast to all users in the room
    socket.to(roomId).emit('emoji-reaction', {
      userName,
      emoji
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Find the room this user was in
    const roomId = Object.keys(rooms).find(id => 
      rooms[id].users.includes(socket.id)
    );
    
    if (roomId) {
      // Remove user from the room
      rooms[roomId].users = rooms[roomId].users.filter(id => id !== socket.id);
      
      if (rooms[roomId].users.length === 0) {
        // If room is empty, delete it
        delete rooms[roomId];
      } else if (rooms[roomId].host === socket.id) {
        // If the host left, assign a new host
        rooms[roomId].host = rooms[roomId].users[0];
        io.to(rooms[roomId].host).emit('host-assigned', true);
      }
      
      // Notify remaining users about updated count
      if (rooms[roomId]) {
        io.to(roomId).emit('user-count', rooms[roomId].users.length);
      }
    }
  });
});

// API routes
app.get('/', (req, res) => {
  res.send('Watch Together API is running');
});

// Check if room exists
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  res.json({ exists: !!rooms[roomId] });
});

// Start server
server.listen(config.port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${config.port}`);
}); 