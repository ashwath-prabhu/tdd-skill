const express = require('express');
const router = express.Router();
const User = require('../entities/user');

router.get('/users', async (req, res) => {
  const total_records = await User.countDocuments();

  const hasPaging = req.query.page !== undefined || req.query.limit !== undefined;
  const current_page = hasPaging ? Number(req.query.page) : 1;
  const limit = hasPaging ? Number(req.query.limit) : total_records;
  const total_pages = hasPaging ? Math.ceil(total_records / limit) : 1;

  const data = await User.find().skip((current_page - 1) * limit).limit(limit);

  return res.status(200).json({
    data,
    pagination: {
      total_records,
      current_page,
      total_pages,
    },
  });
});

module.exports = router;
