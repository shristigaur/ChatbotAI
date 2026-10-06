const blockedWords = require('../config/blockedWords');

const safety = (req, res, next) => {
  let text = req.body.text || '';
  
  // Strip HTML tags using regex
  text = text.replace(/<[^>]*>?/gm, '').trim();

  // Reject empty text
  if (!text) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  // Limit to 500 characters
  if (text.length > 500) {
    return res.status(400).json({ error: 'Message is too long. Please keep it under 500 characters.' });
  }

  // Save the sanitized text back to the body so the route uses it
  req.body.text = text;

  // Detect Email or Phone Number
  // Email-like text
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
  // Simple Phone heuristic (7-11 digits, with optional dashes/dots/spaces)
  const hasPhone = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(text) || /\b\d{7,11}\b/.test(text);

  if (hasEmail || hasPhone) {
    // Flag to bypass AI and return this specific message
    req.safetyFallback = "Let's keep private things private!";
    return next();
  }

  // Check for blocked words
  const hasBlockedWord = blockedWords.some(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(text)
  );

  if (hasBlockedWord) {
    // Flag to bypass AI and return this specific message
    req.safetyFallback = "Let's talk about something fun instead!";
    return next();
  }

  next();
};

module.exports = safety;
