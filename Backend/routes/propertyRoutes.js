const express = require('express');
const router = express.Router();
const Property = require('../Models/properties');

// GET all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.findAll();
    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

module.exports = router;
