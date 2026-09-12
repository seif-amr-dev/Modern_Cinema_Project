const mongoose = require("mongoose");

const ShowtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movies",
      required: true
    },

    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Halls",
      required: true
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"]
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    },

    deletedAt: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

const Showtime = mongoose.model("Showtimes", ShowtimeSchema);

module.exports = Showtime;