const express = require('express');
const router = express.Router();
const { users } = require('./users_store');

router.post('/users', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  const user = {
    id: users.length + 1,
    name,
    email,
  };

  users.push(user);

  return res.status(201).json(user);
});

module.exports = router;
