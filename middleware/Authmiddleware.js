const jwt = require("jsonwebtoken")
const User = require("../Featuers/users/users.model.js")
const AppError = require("../utils/Apperror.js")
const catchAsync = require("../utils/catchasync.js")

const auth = catchAsync(async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        return next(new AppError(401, 'You are unauthorized please login first !'))
    }

    const token = req.headers.authorization.split(" ")[1]

    let decode
    try {
        decode = jwt.verify(token, process.env.SECRET_KEY)
    } catch (err) {
        return next(new AppError(401, 'Invalid or expired token, please login again'))
    }

    const user = await User.findOne({ isDeleted: false, isActive: true, _id: decode._id })
    if (!user) {
        return next(new AppError(401, 'This account no longer exists or has been banned'))
    }

    req.user = user
    next()
})

module.exports = auth