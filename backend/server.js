require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const queueRoutes = require('./routes/queueRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to app for use in controllers
app.set('io', io);

// Routes
app.use('/queue', queueRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Navbat API ishlayapti ✅' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log(`🟢 Foydalanuvchi ulandi: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔴 Foydalanuvchi uzildi: ${socket.id}`);
  });
});

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB ga ulandi');
    server.listen(PORT, () => {
      console.log(`🚀 Server http://localhost:${PORT} da ishlamoqda`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB xatosi:', err.message);
    process.exit(1);
  });
