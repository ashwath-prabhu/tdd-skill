const express = require('express');
const router = express.Router();
const { users } = require('./users_store');

router.get('/users', (req, res) => {
  return res.status(200).json(users);
});

module.exports = router;
