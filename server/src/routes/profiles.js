const express = require('express');
const jwt = require('jsonwebtoken');
const Profile = require('../models/Profile');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = new express.Router();

// Create a new profile
// POST /api/profiles
router.post('/', async (req, res) => {
  try {
    const { name, age, favoriteType, favoriteCharacter, characterName, theme } = req.body;
    
    // Create the new profile. characterName defaults to 'Funny' if not provided.
    const profile = new Profile({
      name,
      age,
      favoriteType,
      favoriteCharacter,
      characterName: characterName || 'Funny',
      theme
    });

    await profile.save();

    // Create a JWT token that lasts for 365 days
    const token = jwt.sign(
      { profileId: profile._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '365d' }
    );

    // Return the created profile and the token
    res.status(201).json({ profile, token });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not create profile.' });
  }
});

// Get the current profile (Protected Route)
// GET /api/profiles/me
router.get('/me', auth, async (req, res) => {
  try {
    // req.profileId is set by the auth middleware
    const profile = await Profile.findById(req.profileId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch profile.' });
  }
});

// Update the current profile (Protected Route)
// PATCH /api/profiles/me
router.patch('/me', auth, async (req, res) => {
  try {
    // Only allow updating 'theme' and 'favoriteCharacter'
    const updates = Object.keys(req.body);
    const allowedUpdates = ['theme', 'favoriteCharacter'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates. You can only update theme and favoriteCharacter.' });
    }

    const profile = await Profile.findById(req.profileId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    // Apply the allowed updates
    updates.forEach(update => {
      profile[update] = req.body[update];
    });

    await profile.save();
    
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Could not update profile.' });
  }
});

// @route   DELETE /api/profiles/me
// @desc    Delete the current profile and all associated data
// @access  Private
router.delete('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findById(req.profileId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete all conversations and messages
    const conversations = await Conversation.find({ profileId: req.profileId });
    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length > 0) {
      await Message.deleteMany({ conversationId: { $in: conversationIds } });
    }
    await Conversation.deleteMany({ profileId: req.profileId });
    
    // Delete the profile
    await Profile.findByIdAndDelete(req.profileId);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
