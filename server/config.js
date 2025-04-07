const fs = require('fs');
const path = require('path');

const config = {
  development: {
    port: 5000,
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  },
  production: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CLIENT_URL || 'https://watchtogether-tawny.vercel.app',
      methods: ['GET', 'POST'],
      credentials: true
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development']; 