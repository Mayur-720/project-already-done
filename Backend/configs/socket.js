const { socketAuth } = require('../middleware/authMiddleware');
const { saveWhisper } = require('../controllers/whisperController');

module.exports = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);

    socket.on('joinConversation', (partnerId) => {
      const room = [socket.user._id.toString(), partnerId].sort().join(':');
      socket.join(room);
      console.log(`User ${socket.user._id} joined room ${room}`);
    });

    socket.on('sendWhisper', async ({ receiverId, content }, callback) => {
      try {
        const whisper = await saveWhisper({
          senderId: socket.user._id,
          receiverId,
          content,
          senderAlias: socket.user.anonymousAlias,
          senderEmoji: socket.user.avatarEmoji,
        });

        const room = [socket.user._id.toString(), receiverId].sort().join(':');
        io.to(room).emit('receiveWhisper', whisper);
        callback({ status: 'success', whisper });
      } catch (error) {
        callback({ status: 'error', message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });
};