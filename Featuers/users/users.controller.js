const users = require("./users.model.js");
const AppError = require("../../utils/Apperror.js");
const catchasync = require("../../utils/catchasync.js");
const bcrypt = require("bcryptjs");
const uploadToCloudinary = require("../../utils/uploadToCloudinary.js");

exports.CreateUser = catchasync(
  async (req, res, next) => {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender
    } = req.body;

    const hashedpassword = await bcrypt.hash(
      password,
      +process.env.SALT_ROUNDS
    );

    let image;

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        "cinema/users"
      );

      image = result.secure_url;
    }

    const user = await users.create({
      name,
      email,
      password: hashedpassword,
      phone,
      dateOfBirth,
      gender,
      image
    });

    res.status(201).json({
      success: true,
      message: "user created successfully"
    });
  }
);

exports.GetallUsers = catchasync(
  async (req, res, next) => {
    const user = await users.find({ isActive: true, isDeleted: false });
    const count = await users.countDocuments({ isActive: true, isDeleted: false });
    res.status(200).json({
      success: true,
      count: count,
      results: user
    });
  }
);

exports.UpdatUser = catchasync(
  async (req, res, next) => {

   if (req.user.role === "user" && req.body.role === "admin") {
  return next(new AppError(403, "You can't change your role"));
}

    const user = await users.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      req.body,
      { runValidators: true, new: true }
    );

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      result: user
    });
  }
);

exports.DeleteUser = catchasync(
  async (req, res, next) => {
    const user = await users.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!user) return next(new AppError(404, `No user found with this id ${req.params.id}`));

    res.status(200).json({
      success: true,
      message: "user deleted successfully"
    });
  }
);

exports.GetUser = catchasync(
  async (req, res, next) => {
    const user = await users.findOne({ _id: req.params.id, isDeleted: false });

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      result: user
    });
  }
);

exports.BanUser = catchasync(
  async (req, res, next) => {
    const user = await users.findOneAndUpdate(
      { isActive: true, _id: req.params.id },
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      message: "user has been banned succcessfully"
    });
  }
);




exports.UpdateUserImage = catchasync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError(400, "Image is required"));
  }

  const user = await users.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    "cinema/users"
  );

  user.image = result.secure_url;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully",
    result: user
  });
});