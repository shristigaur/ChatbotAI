const mongoose = require('mongoose');

// Define the schema for a kids' Profile
const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true, // Automatically removes spaces from the beginning and end
    minlength: [1, 'Name must be at least 1 character long'],
    maxlength: [20, 'Name cannot be more than 20 characters long']
  },
  age: {
    type: Number,
    required: true,
    min: [3, 'Age must be at least 3'],
    max: [15, 'Age cannot be more than 15']
  },
  favoriteType: {
    type: String,
    enum: ['animal', 'bird', 'cartoon', 'dinosaur', 'other'],
    required: true
  },
  favoriteCharacter: {
    type: String, // E.g., a string ID like "lion"
    required: true
  },
  characterName: {
    type: String,
    default: 'Funny' // Default AI friend name
  },
  theme: {
    type: String,
    default: 'day' // Default UI theme
  }
}, {
  // Mongoose automatically adds 'createdAt' and 'updatedAt' fields
  timestamps: true 
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
