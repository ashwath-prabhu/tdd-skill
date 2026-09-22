const express = require('express');
const router = express.Router();
const User = require('../entities/user');

router.post('/users', async (req, res) => {
  const { firstName, lastName, email } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ error: 'firstName and email are required' });
  }

  const user = await User.create({ firstName, lastName, email });

  return res.status(201).json({
    id: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

module.exports = router;
