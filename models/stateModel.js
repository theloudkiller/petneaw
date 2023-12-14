// models/stateModel.js
const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: [true, "name is require"],
  },

  districts: {
    type: [String],
    default: [],
  },
  
});


const State = mongoose.model("states", stateSchema);

module.exports = State;
