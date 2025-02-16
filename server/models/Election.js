const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const electionSchema = new mongoose.Schema({
  election_id: {
    type: Number,
    unique: true,
  },
  name: { 
    type: String, 
    required: true, 
    trim: true,
  },
  description: { 
    type: String, 
    trim: true,
  },
  start_time: { 
    type: Date, 
    required: true,
  },
  duration_minutes: { 
    type: Number, 
    required: true,
  },
  status: { 
    type: String, 
    enum: ['UPCOMING', 'ONGOING', 'COMPLETED'], 
    default: 'UPCOMING',
  },
  created_at: { 
    type: Date, 
    default: Date.now,
  },
});

// Auto-increment election_id
electionSchema.plugin(AutoIncrement, { inc_field: 'election_id' });
module.exports = mongoose.model('Election', electionSchema);
