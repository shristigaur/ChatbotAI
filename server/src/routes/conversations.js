const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Profile = require('../models/Profile');
const aiClient = require('../services/aiClient');
const { buildSystemPrompt } = require('../services/prompt');
const auth = require('../middleware/auth');
const safety = require('../middleware/safety');

const router = new express.Router();

// Apply auth middleware to all routes in this file
router.use(auth);

// Get all conversations sorted by most recently updated
// GET /api/conversations
router.get('/', async (req, res) => {
  try {
    // Ensure we only fetch conversations belonging to the logged-in profile
    const conversations = await Conversation.find({ profileId: req.profileId })
      .sort({ updatedAt: -1 }); // -1 for descending order (newest first)
    
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch conversations.' });
  }
});

// Create a new empty conversation
// POST /api/conversations
router.post('/', async (req, res) => {
  try {
    const conversation = new Conversation({
      profileId: req.profileId
      // title will default to 'New Chat' automatically
    });
    
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(400).json({ error: 'Could not create conversation.' });
  }
});

// Get a single conversation and its messages
// GET /api/conversations/:id
router.get('/:id', async (req, res) => {
  try {
    // Fetch conversation only if it belongs to this profile
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      profileId: req.profileId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Fetch all messages belonging to this conversation
    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 }); // 1 for ascending order (oldest first)

    res.status(200).json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch conversation details.' });
  }
});

// Delete a single conversation and its messages
// DELETE /api/conversations/:id
router.delete('/:id', async (req, res) => {
  try {
    // Delete the conversation, verifying it belongs to this profile
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      profileId: req.profileId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Delete all associated messages
    await Message.deleteMany({ conversationId: conversation._id });

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete conversation.' });
  }
});

// Delete all conversations (and their messages) for this profile
// DELETE /api/conversations
router.delete('/', async (req, res) => {
  try {
    // Find all conversation IDs for this profile
    const conversations = await Conversation.find({ profileId: req.profileId });
    const conversationIds = conversations.map(c => c._id);

    // Delete all messages linked to those conversations
    await Message.deleteMany({ conversationId: { $in: conversationIds } });

    // Delete the conversations themselves
    await Conversation.deleteMany({ profileId: req.profileId });

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete all conversations.' });
  }
});

// Post a new message to a conversation
// POST /api/conversations/:id/messages
router.post('/:id/messages', safety, async (req, res) => {
  try {
    const { text } = req.body;
    
    // Verify conversation belongs to profile
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      profileId: req.profileId
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    // Save the user's message
    const userMessage = new Message({
      conversationId: conversation._id,
      role: 'user',
      text
    });
    await userMessage.save();

    // If this is the first message, update the conversation title
    const messageCount = await Message.countDocuments({ conversationId: conversation._id });
    if (messageCount === 1) {
      // Extract up to 30 characters for the title
      conversation.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
      await conversation.save();
    }

    // Load profile to build system prompt
    const profile = await Profile.findById(req.profileId);
    const systemPrompt = buildSystemPrompt(profile);

    // Load the last 10 messages for history (excluding the one we just saved)
    const history = await Message.find({ 
      conversationId: conversation._id,
      _id: { $ne: userMessage._id } 
    })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Reverse so they are passed to the AI in chronological order
    history.reverse(); 

    // Call the AI, unless safety middleware provided a fallback message
    let replyText = '';
    
    if (req.safetyFallback) {
      replyText = req.safetyFallback;
    } else {
      try {
        replyText = await aiClient.askAI({
          systemPrompt,
          history,
          userText: text
        });
      } catch (aiError) {
        console.error('AI call failed, using fallback:', aiError.message);
        replyText = "I'm having a little trouble thinking right now. Can we talk again in a minute? 🌻";
      }
    }

    // Save the assistant's message
    const assistantMessage = new Message({
      conversationId: conversation._id,
      role: 'assistant',
      text: replyText
    });
    await assistantMessage.save();

    // Return both messages
    res.status(201).json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not process message.' });
  }
});

module.exports = router;
