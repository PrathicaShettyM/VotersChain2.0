const Election = require('../models/Election');

// Create an Election
exports.createElection = async (req, res) => {
  try {
    let { name, description, start_time, duration_minutes } = req.body;

    // Convert start_time to a Date object
    start_time = new Date(start_time);
    
    if (isNaN(start_time.getTime())) {
      return res.status(400).json({ message: 'Invalid start time format' });
    }

    const newElection = new Election({
      name,
      description,
      start_time,
      duration_minutes,
    });

    await newElection.save();
    res.status(201).json({ message: 'Election created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
};

// View All Elections
exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find();
    res.status(200).json(elections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections', error: error.message });
  }
};
