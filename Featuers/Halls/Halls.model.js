const mongoose = require("mongoose");

const SeatSchema = new mongoose.Schema(
  {
    row: {
      type: String, // e.g. "A", "B", "C"
      required: true
    },
    number: {
      type: Number, 
      required: true
    },
    type: {
      type: String,
      enum: ["standard", "vip"],
      default: "standard"
    }
  },
  { _id: false }
);

const HallsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Name is required"],
      maxlength: [50, "Name must be below 50 characters"]
    },

    rows: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 row"],
      max: [26, "Cannot exceed 26 rows (A-Z)"]
    },

    seatsPerRow: {
      type: Number,
      required: true,
      min: [1, "Must have at least 1 seat per row"]
    },

    seatMap: {
      type: [SeatSchema],
      default: []
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

// Auto-generate the seat map from rows/seatsPerRow whenever either changes
HallsSchema.pre("save", function (next) {
  if (this.isModified("rows") || this.isModified("seatsPerRow")) {
    const seatMap = [];
    for (let r = 0; r < this.rows; r++) {
      const rowLabel = String.fromCharCode(65 + r); // A, B, C...
      for (let n = 1; n <= this.seatsPerRow; n++) {
        seatMap.push({ row: rowLabel, number: n, type: "standard" });
      }
    }
    this.seatMap = seatMap;
  }
  next();
});

// Total capacity is derived, not stored separately, so it never drifts out of sync
HallsSchema.virtual("capacity").get(function () {
  return this.rows * this.seatsPerRow;
});
HallsSchema.set("toJSON", { virtuals: true });
HallsSchema.set("toObject", { virtuals: true });

const Hall = mongoose.model("Halls", HallsSchema);

module.exports = Hall;