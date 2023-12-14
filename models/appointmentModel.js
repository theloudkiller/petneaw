const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
      index: true,
    },
    doctorInfo: {
      type: String,
      required: true,
    },
    userInfo: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: false,
      index: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    timings: {
      type: Object,
      required: [false, "work timing is required"],
    },
    bookingDate: {  // Add the new parameter
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1 });

const appointmentModel = mongoose.model("appointments", appointmentSchema);

module.exports = appointmentModel;