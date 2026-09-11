const halls = require("./Halls.model.js");
const AppError = require("../../utils/Apperror.js");
const catchAsync = require("../../utils/catchasync.js");

exports.CreateHall = catchAsync(async (req, res, next) => {
  const { name, rows, seatsPerRow } = req.body;

  const hall = await halls.create({ name, rows, seatsPerRow });

  res.status(201).json({
    success: true,
    result: hall
  });
});

exports.GetAllHalls = catchAsync(async (req, res, next) => {
 

  const hallList = await halls.find({isActive:true ,isDeleted:false});

  res.status(200).json({
    success: true,
    count: hallList.length,
    results: hallList
  });
});

exports.GetHall = catchAsync(async (req, res, next) => {
  const hall = await halls.findOne({ _id: req.params.id, isDeleted: false });

  if (!hall) {
    return next(new AppError(404, "Hall not found"));
  }

  res.status(200).json({
    success: true,
    result: hall
  });
});

exports.UpdateHall = catchAsync(async (req, res, next) => {
  const { name, rows, seatsPerRow, isActive } = req.body;

  const hall = await halls.findOne({ _id: req.params.id, isDeleted: false });
  if (!hall) {
    return next(new AppError(404, "Hall not found"));
  }

  if (name !== undefined) hall.name = name;
  if (rows !== undefined) hall.rows = rows;
  if (seatsPerRow !== undefined) hall.seatsPerRow = seatsPerRow;
  if (isActive !== undefined) hall.isActive = isActive;

  await hall.save();

  res.status(200).json({
    success: true,
    result: hall
  });
});

exports.DeleteHall = catchAsync(async (req, res, next) => {
  const hall = await halls.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (!hall) {
    return next(new AppError(404, `No hall found with this id ${req.params.id}`));
  }

  res.status(200).json({
    success: true,
    message: "hall deleted successfully"
  });
});