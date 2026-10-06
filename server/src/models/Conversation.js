const mongoose = require('mongoose');

// Define the schema for a Conversation between the child and Funny
const conversationSchema = new mongoose.Schema({
  profileId: {
    type: mongoose.Schema.Types.ObjectId, // Link to the Profile
    ref: 'Profile',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  }
}, {
  // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
  timestamps: true
});

// Add an index on profileId to quickly find a profile's conversations
conversationSchema.index({ profileId: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
