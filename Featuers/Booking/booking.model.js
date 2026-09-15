const mongoose = require("mongoose");

const BookingSeatSchema = new mongoose.Schema(
  {
    row: {
      type: String,
      required: true,
      trim: true
    },
    number: {
      type: Number,
      required: true,
      min: [1, "Seat number must be at least 1"]
    }
  },
  { _id: false }
);

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    },

    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtimes",
      required: true
    },

    seats: {
      type: [BookingSeatSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one seat is required"
      }
    },

    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"]
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    }
  },
  {
    timestamps: true
  }
);

const ActiveBookedSeatSchema = new mongoose.Schema(
  {
    showtime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtimes",
      required: true
    },
    row: {
      type: String,
      required: true,
      trim: true
    },
    number: {
      type: Number,
      required: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bookings",
      required: true
    }
  },
  {
    timestamps: true
  }
);

ActiveBookedSeatSchema.index(
  { showtime: 1, row: 1, number: 1 },
  { unique: true }
);

const Booking = mongoose.model("Bookings", BookingSchema);
const ActiveBookedSeat = mongoose.model(
  "ActiveBookedSeats",
  ActiveBookedSeatSchema
);

module.exports = { Booking, ActiveBookedSeat };
