const movies = require("./movie.model.js");
const AppError = require("../../utils/Apperror.js");
const catchAsync = require("../../utils/catchasync.js");
const cloudinary = require("../../utils/cloudinary.js");
const uploadToCloudinary = require("../../utils/uploadToCloudinary.js");

exports.CreateMovie = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    genre,
    duration,
    ageRating,
    score,
    releaseDate,
    status,
    director,
    cast,
    trailerUrl
  } = req.body;

  if (!req.file) {
    return next(new AppError(400, "A poster image is required"));
  }

  const result = await uploadToCloudinary(req.file.buffer, "cinema/posters");

  const movie = await movies.create({
    title,
    description,
    poster: { url: result.secure_url, publicId: result.public_id },
  
    duration,
    ageRating,
    score,
    releaseDate,
    status,
    director,
    genre: genre ? JSON.parse(genre) : [],
cast: cast ? JSON.parse(cast) : [],

    trailerUrl
  });

  res.status(201).json({
    success: true,
    result: movie
  });
});

exports.GetAllMovies = catchAsync(async (req, res, next) => {
  const filter = { isDeleted: false };

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.genre) {
    filter.genre = req.query.genre;
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  const page = Math.max(+req.query.page || 1, 1);
  const limit = Math.min(+req.query.limit || 20, 50);
  const skip = (page - 1) * limit;

  const [movieList, count] = await Promise.all([
    movies.find(filter).skip(skip).limit(limit).sort({ releaseDate: -1 }),
    movies.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    count,
    page,
    pages: Math.ceil(count / limit),
    results: movieList
  });
});

exports.GetMovie = catchAsync(async (req, res, next) => {
  const movie = await movies.findOne({ _id: req.params.id, isDeleted: false });

  if (!movie) {
    return next(new AppError(404, "Movie not found"));
  }

  res.status(200).json({
    success: true,
    result: movie
  });
});

exports.UpdateMovie = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    genre,
    duration,
    ageRating,
    score,
    releaseDate,
    status,
    director,
    cast,
    trailerUrl
  } = req.body;

  const existing = await movies.findOne({ _id: req.params.id, isDeleted: false });
  if (!existing) {
    return next(new AppError(404, "Movie not found"));
  }

const updateData = {
  title,
  description,
  duration,
  ageRating,
  score,
  releaseDate,
  status,
  director,
  trailerUrl
};

if (genre !== undefined) {
  updateData.genre = JSON.parse(genre);
}

if (cast !== undefined) {
  updateData.cast = JSON.parse(cast);
}

  // Only touch the poster if a new file was uploaded
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, "cinema/posters");
    updateData.poster = { url: result.secure_url, publicId: result.public_id };

    // clean up the old image so it doesn't sit orphaned in Cloudinary
    if (existing.poster && existing.poster.publicId) {
      await cloudinary.uploader.destroy(existing.poster.publicId);
    }
  }

  const movie = await movies.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    result: movie
  });
});

exports.DeleteMovie = catchAsync(async (req, res, next) => {
  const movie = await movies.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!movie) {
    return next(new AppError(404, `No movie found with this id ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    message: "movie deleted successfully"
  });
});