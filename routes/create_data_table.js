const express = require('express');
const router = express.Router();
const DataTable = require('../entities/data_table');

router.post('/data-tables', async (req, res) => {
  const { alias } = req.body;

  if (!alias || alias.length > 32 || !/^[a-zA-Z0-9]+$/.test(alias)) {
    return res.status(400).json({
      error: 'alias is required and must be 1-32 characters, letters and numbers only',
    });
  }

  const existing = await DataTable.findOne({ alias });
  if (existing) {
    return res.status(409).json({ error: 'alias already exists' });
  }

  const dataTable = await DataTable.create({ alias });

  return res.status(201).json({
    id: dataTable.dataTableId,
    alias: dataTable.alias,
    aliasEditable: false,
    createdAt: dataTable.createdAt,
    updatedAt: dataTable.updatedAt,
  });
});

module.exports = router;
