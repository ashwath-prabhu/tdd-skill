const express = require('express');
const router = express.Router();
const { users } = require('./users_store');

router.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(200).json(user);
});

module.exports = router;
