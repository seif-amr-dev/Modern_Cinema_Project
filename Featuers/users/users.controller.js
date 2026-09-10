const users = require("./users.model.js");
const AppError = require("../../utils/Apperror.js");
const catchasync = require("../../utils/catchasync.js");
const bcrypt = require("bcryptjs");

exports.CreateUser = catchasync(
  async (req, res, next) => {
    const { name, email, password, phone, dateOfBirth, gender, image } = req.body;

    const hashedpassword = await bcrypt.hash(password, +process.env.SALT_ROUNDS);

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
    const { name, phone, dateOfBirth, gender, image } = req.body;

    const user = await users.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { name, phone, dateOfBirth, gender, image },
      { returnDocument: "after", runValidators: true, new: true }
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