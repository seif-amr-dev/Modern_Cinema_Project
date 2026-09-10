const mongoose = require("mongoose");

const MoviesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Title is required"],
      maxlength: [150, "Title must be below 150 characters"]
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Description must be below 2000 characters"]
    },

    poster: {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    },

    genre: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one genre is required"
      }
    },

    duration: {
      type: Number, // minutes
      required: true,
      min: [1, "Duration must be at least 1 minute"]
    },

    ageRating: {
      type: String,
      enum: ["G", "PG", "PG-13", "R", "NC-17"],
      required: true
    },

    score: {
      type: Number, // e.g. IMDb-style rating out of 10
      min: 0,
      max: 10,
      default: 0
    },

    releaseDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["coming_soon", "now_showing", "ended"],
      default: "coming_soon"
    },

    director: {
      type: String,
      trim: true
    },

    cast: {
      type: [String],
      default: []
    },

    trailerUrl: {
      type: String
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

MoviesSchema.index({ title: "text", description: "text" });

const Movie = mongoose.model("Movies", MoviesSchema);

module.exports = Movie;