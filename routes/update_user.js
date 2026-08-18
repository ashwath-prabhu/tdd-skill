const express = require('express');
const router = express.Router();
const { users } = require('./users_store');

router.put('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  user.name = name;
  user.email = email;

  return res.status(200).json(user);
});

module.exports = router;
