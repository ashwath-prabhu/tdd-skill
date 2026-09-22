const express = require('express');
const router = express.Router();
const User = require('../entities/user');

router.delete('/users/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  return res.status(204).send();
});

module.exports = router;
