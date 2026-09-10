const AppError = require("../utils/Apperror");

const restrictTo = (...roles) => (req, res, next) => {
    const { role } = req.user;
    if (roles.includes(role)) {
        return next();
    }
    return next(new AppError(403, "permission denied"));
};

module.exports = restrictTo;