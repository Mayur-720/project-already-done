
require('dotenv').config({ path: './.env' });
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const morgan = require('morgan');
const cors = require('cors');
const ConnectTODB = require('./configs/dbConnect');
const indexRoutes = require('./routes/indexRoutes');
const userRoutes = require('./routes/userRoutes');
const ghostCircleRoutes = require('./routes/ghostCircleRoutes');
const postRoutes = require('./routes/postRoutes');
const whisperRoutes = require('./routes/whisperRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const socketConfig = require('./configs/socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'https://shadow-whispers-social.lovable.app',
      'http://localhost:8080',
      'http://localhost:3000', // Add common React port
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: [
    'https://shadow-whispers-social.lovable.app',
    'http://localhost:8080',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Initialize Socket.IO
socketConfig(io);

// Connect to DB
ConnectTODB();

// Routes
app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ghost-circles', ghostCircleRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/whispers', whisperRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
