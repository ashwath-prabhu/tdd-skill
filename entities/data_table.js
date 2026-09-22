const mongoose = require('../db');

const dataTableSchema = new mongoose.Schema(
  {
    dataTableId: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    alias: { type: String, required: true, unique: true, maxlength: 32 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DataTable', dataTableSchema);
