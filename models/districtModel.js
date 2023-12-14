// models/districtModel.js
const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  stateName: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: [true, "districtName is required"],
  },
});

const District = mongoose.model("districts", districtSchema);

module.exports = District;
