// backend/routes/history.js

const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { History } = require('../models'); // Adjust path if needed

// ✅ Fetch history for logged-in user
router.get('/fetchhistory', fetchuser, async (req, res) => {
  try {
    const history = await History.findAll({
      where: { userId: req.user.id },
      order: [['date', 'DESC']],
    });
    res.json(history);
  } catch (error) {
    console.error("Error in /fetchhistory:", error);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Add new history entry with validation
router.post(
  '/addhistory',
  fetchuser,
  [
    body('action', 'Action is required').notEmpty(),
    body('title', 'Title is required').notEmpty(),
    body('description').optional(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { action, title, description } = req.body;
      const history = await History.create({
        action,
        title,
        description,
        userId: req.user.id,
      });
      res.json(history);
    } catch (error) {
      console.error("Error in /addhistory:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

// ✅ Simple test route
router.get('/test', (req, res) => {
  try {
    res.status(200).json({ message: 'Test route works!' });
  } catch (error) {
    console.error('Error in /test route:', error);
    res.status(500).json({ error: 'Failed to access test route' });
  }
});

module.exports = router;
