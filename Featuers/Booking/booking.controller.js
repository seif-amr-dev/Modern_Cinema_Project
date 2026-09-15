const mongoose = require("mongoose");

const { Booking, ActiveBookedSeat } = require("./booking.model.js");
const showtimes = require("../showtime/showtime.model.js");
const movies = require("../Movies/movie.model.js");
const halls = require("../Halls/Halls.model.js");

const AppError = require("../../utils/Apperror.js");
const catchAsync = require("../../utils/catchasync.js");

const seatKey = (row, number) => `${String(row).trim().toUpperCase()}-${Number(number)}`;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeSeats = (seats) =>
  seats.map((seat) => ({
    row: String(seat.row).trim().toUpperCase(),
    number: Number(seat.number)
  }));

const getConfirmedBookedSeatKeys = async (showtimeId) => {
  const lockedSeats = await ActiveBookedSeat.find({ showtime: showtimeId }).lean();
  return new Set(lockedSeats.map((seat) => seatKey(seat.row, seat.number)));
};

exports.GetShowtimeSeats = catchAsync(async (req, res, next) => {
  const { showtimeId } = req.params;

  if (!isValidObjectId(showtimeId)) {
    return next(new AppError(400, "Invalid showtime id"));
  }

  const showtime = await showtimes
    .findOne({ _id: showtimeId, isDeleted: false })
    .populate("movie", "title poster duration genre status")
    .populate("hall");

  if (!showtime) {
    return next(new AppError(404, "Showtime not found"));
  }

  const movie = await movies.findOne({
    _id: showtime.movie?._id || showtime.movie,
    isDeleted: false
  });

  if (!movie) {
    return next(new AppError(404, "Movie not found"));
  }

  const hall = await halls.findOne({
    _id: showtime.hall?._id || showtime.hall,
    isDeleted: false
  });

  if (!hall) {
    return next(new AppError(404, "Hall not found"));
  }

  const bookedKeys = await getConfirmedBookedSeatKeys(showtime._id);

  const seats = hall.seatMap.map((seat) => ({
    row: seat.row,
    number: seat.number,
    type: seat.type,
    isBooked: bookedKeys.has(seatKey(seat.row, seat.number))
  }));

  res.status(200).json({
    success: true,
    result: {
      showtime: {
        _id: showtime._id,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        movie: showtime.movie
      },
      hall: {
        _id: hall._id,
        name: hall.name,
        rows: hall.rows,
        seatsPerRow: hall.seatsPerRow,
        capacity: hall.capacity
      },
      seats
    }
  });
});

exports.CreateBooking = catchAsync(async (req, res, next) => {
  const { showtime, seats } = req.body;

  if (showtime === undefined || showtime === null) {
    return next(new AppError(400, "showtime is required"));
  }

  if (!isValidObjectId(showtime)) {
    return next(new AppError(400, "Invalid showtime id"));
  }

  if (!Array.isArray(seats)) {
    return next(new AppError(400, "seats must be an array"));
  }

  if (seats.length === 0) {
    return next(new AppError(400, "At least one seat must be selected"));
  }

  for (const seat of seats) {
    if (
      seat === null ||
      typeof seat !== "object" ||
      seat.row === undefined ||
      seat.row === null ||
      String(seat.row).trim() === "" ||
      seat.number === undefined ||
      seat.number === null ||
      Number.isNaN(Number(seat.number))
    ) {
      return next(
        new AppError(400, "Each seat must include a valid row and number")
      );
    }
  }

  const normalizedSeats = normalizeSeats(seats);

  const seen = new Set();
  for (const seat of normalizedSeats) {
    const key = seatKey(seat.row, seat.number);
    if (seen.has(key)) {
      return next(new AppError(400, "Duplicate seats are not allowed in the same booking"));
    }
    seen.add(key);
  }

  const existingShowtime = await showtimes.findOne({
    _id: showtime,
    isDeleted: false
  });

  if (!existingShowtime) {
    return next(new AppError(404, "Showtime not found"));
  }

  const existingMovie = await movies.findOne({
    _id: existingShowtime.movie,
    isDeleted: false
  });

  if (!existingMovie) {
    return next(new AppError(404, "Movie not found"));
  }

  const existingHall = await halls.findOne({
    _id: existingShowtime.hall,
    isDeleted: false
  });

  if (!existingHall) {
    return next(new AppError(404, "Hall not found"));
  }

  for (const seat of normalizedSeats) {
    const existsInHall = existingHall.seatMap.some(
      (hallSeat) =>
        seatKey(hallSeat.row, hallSeat.number) === seatKey(seat.row, seat.number)
    );

    if (!existsInHall) {
      return next(
        new AppError(
          400,
          `Seat ${seat.row}${seat.number} does not exist in this hall`
        )
      );
    }
  }

  const bookedKeys = await getConfirmedBookedSeatKeys(existingShowtime._id);
  const conflict = normalizedSeats.some((seat) =>
    bookedKeys.has(seatKey(seat.row, seat.number))
  );

  if (conflict) {
    return next(new AppError(409, "One or more selected seats are already booked"));
  }

  const totalPrice = normalizedSeats.length * existingShowtime.price;
  const bookingId = new mongoose.Types.ObjectId();

  // Lock seats first via unique index so concurrent requests cannot claim the same seat.
  try {
    await ActiveBookedSeat.insertMany(
      normalizedSeats.map((seat) => ({
        showtime: existingShowtime._id,
        row: seat.row,
        number: seat.number,
        booking: bookingId
      })),
      { ordered: true }
    );
  } catch (err) {
    await ActiveBookedSeat.deleteMany({ booking: bookingId });

    if (err && err.code === 11000) {
      return next(
        new AppError(409, "One or more selected seats are already booked")
      );
    }

    throw err;
  }

  try {
    await Booking.create({
      _id: bookingId,
      user: req.user._id,
      showtime: existingShowtime._id,
      seats: normalizedSeats,
      totalPrice,
      status: "confirmed"
    });
  } catch (err) {
    await ActiveBookedSeat.deleteMany({ booking: bookingId });
    throw err;
  }

  const populatedBooking = await Booking.findById(bookingId)
    .populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title poster duration genre status" },
        { path: "hall", select: "name rows seatsPerRow" }
      ]
    })
    .populate("user", "name email");

  res.status(201).json({
    success: true,
    result: populatedBooking
  });
});

exports.GetMyBookings = catchAsync(async (req, res, next) => {
  const results = await Booking.find({ user: req.user._id })
    .populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title poster duration genre status" },
        { path: "hall", select: "name rows seatsPerRow" }
      ]
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: results.length,
    results
  });
});

exports.GetOneBooking = catchAsync(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError(400, "Invalid booking id"));
  }

  const booking = await Booking.findById(req.params.id)
    .populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title poster duration genre status" },
        { path: "hall", select: "name rows seatsPerRow" }
      ]
    })
    .populate("user", "name email");

  if (!booking) {
    return next(new AppError(404, "Booking not found"));
  }

  const isOwner = booking.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError(403, "You can only access your own booking"));
  }

  res.status(200).json({
    success: true,
    result: booking
  });
});

exports.CancelBooking = catchAsync(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return next(new AppError(400, "Invalid booking id"));
  }

  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError(404, "Booking not found"));
  }

  const isOwner = booking.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return next(new AppError(403, "You can only cancel your own booking"));
  }

  if (booking.status === "cancelled") {
    return next(new AppError(400, "Booking is already cancelled"));
  }

  booking.status = "cancelled";
  await booking.save();

  await ActiveBookedSeat.deleteMany({ booking: booking._id });

  const populatedBooking = await Booking.findById(booking._id)
    .populate({
      path: "showtime",
      populate: [
        { path: "movie", select: "title poster duration genre status" },
        { path: "hall", select: "name rows seatsPerRow" }
      ]
    })
    .populate("user", "name email");

  res.status(200).json({
    success: true,
    result: populatedBooking
  });
});
