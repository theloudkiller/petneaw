const mongoose = require("mongoose");

const clinicSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    clinicname: {
      type: String,
      required: [true, "clinic name is required"],
    },
    
    
    district: {
      type: String,
      required: [true, "district  is required"],
    },
    clinicemail: {
      type: String,
      required: [true, "clinic name is required"],
    },
    
  },
  { timestamps: true }
);

const clinicModel = mongoose.model("clinics", clinicSchema);
module.exports = clinicModel;