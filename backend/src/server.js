require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://flashlink-fullstack.vercel.app', 'https://flashlink-fullstack-mlnsuq6zn-serges-projects-fd201acd.vercel.app', 'http://localhost:3000'] || 'http://localhost:3000',
    credentials: true,
  }
});

connectDB();
app.use(helmet());
app.use(cors({
  
  credentials: true,
}));
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Store chat messages in memory (replace with DB for production)
const chatMessages = {};
const adminSockets = new Set();
const userSockets = {};

io.on('connection', (socket) => {
  console.log('💬 Socket connected:', socket.id);

  // User joins their room
  socket.on('join', ({ userId, role, name }) => {
    socket.userId = userId;
    socket.userName = name;
    socket.userRole = role;

    if (role === 'admin') {
      adminSockets.add(socket.id);
      socket.join('admin-room');
      // Send all chat sessions to admin
      socket.emit('all-chats', chatMessages);
    } else {
      userSockets[userId] = socket.id;
      socket.join(`user-${userId}`);
      // Send existing messages for this user
      socket.emit('chat-history', chatMessages[userId] || []);
    }
  });

  // User or admin sends message
  socket.on('send-message', ({ userId, userName, message, isAdmin }) => {
    const msg = {
      id: Date.now(),
      userId,
      userName,
      message,
      isAdmin: isAdmin || false,
      timestamp: new Date().toISOString(),
    };

    if (!chatMessages[userId]) chatMessages[userId] = [];
    chatMessages[userId].push(msg);

    // Send to user
    io.to(`user-${userId}`).emit('new-message', msg);
    // Send to all admins
    io.to('admin-room').emit('new-message', { ...msg, userId });
    io.to('admin-room').emit('all-chats', chatMessages);
  });

  socket.on('disconnect', () => {
    adminSockets.delete(socket.id);
    if (socket.userId) delete userSockets[socket.userId];
    console.log('💬 Socket disconnected:', socket.id);
  });
});

app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'FlashLink API is running', version: '1.0.0', timestamp: new Date() }));
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/quotes',     require('./routes/quotes'));
app.use('/api/contact',    require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/shipments',  require('./routes/shipments'));
app.use('/api/admin',      require('./routes/admin.routes'));
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 FlashLink API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;