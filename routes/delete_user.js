const express = require('express');
const router = express.Router();
const { users } = require('./users_store');

router.delete('/users/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'user not found' });
  }

  users.splice(index, 1);

  return res.status(204).send();
});

module.exports = router;
