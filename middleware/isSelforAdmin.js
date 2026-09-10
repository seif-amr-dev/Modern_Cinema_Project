const AppError = require("../utils/Apperror.js");

const isSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new AppError(401, "You are unauthorized please login first !"));
    }

    if (req.user.role === "admin" || req.user._id.toString() === req.params.id) {
        return next();
    }

    return next(new AppError(403, "You can only access your own account"));
};

module.exports = isSelfOrAdmin;