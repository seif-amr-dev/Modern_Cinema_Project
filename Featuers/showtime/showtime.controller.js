const movies = require("../Movies/movie.model.js");
const halls = require("../Halls/Halls.model.js");
const showtimes = require("./showtime.model.js");

const AppError = require("../../utils/Apperror.js");
const catchAsync = require("../../utils/catchasync.js");

exports.CreateShowtime = catchAsync(async (req, res, next) => {
  const { movie, hall, startTime, endTime, price } = req.body;

  if (
    movie === undefined ||
    movie === null ||
    hall === undefined ||
    hall === null ||
    startTime === undefined ||
    startTime === null ||
    endTime === undefined ||
    endTime === null ||
    price === undefined ||
    price === null
  ) {
    return next(
      new AppError(
        400,
        "movie, hall, startTime, endTime and price are required",
      ),
    );
  }

  const parsedStartTime = new Date(startTime);
  const parsedEndTime = new Date(endTime);

  if (
    Number.isNaN(parsedStartTime.getTime()) ||
    Number.isNaN(parsedEndTime.getTime())
  ) {
    return next(new AppError(400, "Invalid start time or end time"));
  }

  if (parsedStartTime >= parsedEndTime) {
    return next(new AppError(400, "Start time must be before end time"));
  }

  const now = new Date();

  if (parsedStartTime <= now) {
    return next(new AppError(400, "Showtime cannot start in the past or now"));
  }

  const existingMovie = await movies.findOne({
    _id: movie,
    isDeleted: false,
  });

  if (!existingMovie) {
    return next(new AppError(404, "Movie not found"));
  }

  const existingHall = await halls.findOne({
    _id: hall,
    isDeleted: false,
    isActive: true,
  });

  if (!existingHall) {
    return next(new AppError(404, "Hall not found or inactive"));
  }

  const showtimeDuration = parsedEndTime - parsedStartTime;
  const movieDurationMs = existingMovie.duration * 60 * 1000;

  if (showtimeDuration < movieDurationMs) {
    return next(
      new AppError(
        400,
        "Showtime duration cannot be shorter than the movie duration",
      ),
    );
  }

  const conflict = await showtimes.findOne({
    hall,
    isDeleted: false,
    startTime: { $lt: parsedEndTime },
    endTime: { $gt: parsedStartTime },
  });

  if (conflict) {
    return next(
      new AppError(409, "This hall already has a showtime during this period"),
    );
  }

  const showtime = await showtimes.create({
    movie,
    hall,
    startTime: parsedStartTime,
    endTime: parsedEndTime,
    price,
  });

  res.status(201).json({
    success: true,
    result: showtime,
  });
});

exports.GetAllShowtimes = catchAsync(async (req, res, next) => {
  let filter = { isDeleted: false };
  if (req.query.movie) {
    filter.movie = req.query.movie;
  }

  const results = await showtimes
    .find(filter)
    .populate("movie")
    .populate("hall")
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    count: results.length,
    results,
  });
});

exports.GetOneShowtime = catchAsync(async (req, res, next) => {
  const result = await showtimes
    .findOne({
      _id: req.params.id,
      isDeleted: false,
    })
    .populate("movie")
    .populate("hall");

  if (!result) {
    return next(new AppError(404, "Showtime not found"));
  }

  res.status(200).json({
    success: true,
    result,
  });
});

exports.UpdateShowtime = catchAsync(async (req, res, next) => {
  const { movie, hall, startTime, endTime, price } = req.body;

  const existingShowtime = await showtimes.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!existingShowtime) {
    return next(new AppError(404, "Showtime not found"));
  }

  let existingMovie;

  if (movie !== undefined) {
    existingMovie = await movies.findOne({
      _id: movie,
      isDeleted: false,
    });

    if (!existingMovie) {
      return next(new AppError(404, "Movie not found"));
    }
  }

  if (hall !== undefined) {
    const existingHall = await halls.findOne({
      _id: hall,
      isDeleted: false,
      isActive: true,
    });

    if (!existingHall) {
      return next(new AppError(404, "Hall not found or inactive"));
    }
  }

  let newStartTime = existingShowtime.startTime;
  let newEndTime = existingShowtime.endTime;

  if (startTime !== undefined) {
    newStartTime = new Date(startTime);
    if (Number.isNaN(newStartTime.getTime())) {
      return next(new AppError(400, "Invalid start time"));
    }
  }

  if (endTime !== undefined) {
    newEndTime = new Date(endTime);
    if (Number.isNaN(newEndTime.getTime())) {
      return next(new AppError(400, "Invalid end time"));
    }
  }

  if (newStartTime >= newEndTime) {
    return next(new AppError(400, "Start time must be before end time"));
  }

  if (movie === undefined) {
    existingMovie = await movies.findOne({
      _id: existingShowtime.movie,
      isDeleted: false,
    });

    if (!existingMovie) {
      return next(new AppError(404, "Movie not found"));
    }
  }

  const showtimeDuration = newEndTime - newStartTime;
  const movieDurationMs = existingMovie.duration * 60 * 1000;

  if (showtimeDuration < movieDurationMs) {
    return next(
      new AppError(
        400,
        "Showtime duration cannot be shorter than the movie duration",
      ),
    );
  }

  const conflict = await showtimes.findOne({
    _id: { $ne: req.params.id },
    hall: hall !== undefined ? hall : existingShowtime.hall,
    isDeleted: false,
    startTime: { $lt: newEndTime },
    endTime: { $gt: newStartTime },
  });

  if (conflict) {
    return next(
      new AppError(409, "This hall already has a showtime during this period"),
    );
  }

  const result = await showtimes.findOneAndUpdate(
    {
      _id: req.params.id,
      isDeleted: false,
    },
    {
      ...(movie !== undefined && { movie }),
      ...(hall !== undefined && { hall }),
      ...(startTime !== undefined && { startTime: newStartTime }),
      ...(endTime !== undefined && { endTime: newEndTime }),
      ...(price !== undefined && { price }),
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    success: true,
    result,
  });
});

exports.DeleteShowtime = catchAsync(async (req, res, next) => {
  const result = await showtimes.findOneAndUpdate(
    {
      _id: req.params.id,
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    {
      new: true,
    },
  );

  if (!result) {
    return next(new AppError(404, "Showtime not found"));
  }

  res.status(200).json({
    success: true,
    result,
  });
});
