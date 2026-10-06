const mongoose = require('mongoose');

// Define the schema for a single Message inside a Conversation
const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId, // Link to the Conversation
    ref: 'Conversation',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'], // Limits the role to these two options
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true // Automatically removes extra spaces at the beginning and end
  }
}, {
  // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
  timestamps: true
});

// Add an index on conversationId to quickly find messages belonging to a conversation
messageSchema.index({ conversationId: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
