const express = require('express');
const router = express.Router();
const User = require('../entities/user');

router.put('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  const { firstName, lastName, email } = req.body;

  if (!firstName || !email) {
    return res.status(400).json({ error: 'firstName and email are required' });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  await user.save();

  return res.status(200).json({
    id: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
});

module.exports = router;
