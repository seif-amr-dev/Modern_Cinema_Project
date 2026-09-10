const router = require("express").Router();

const auth = require("../../middleware/Authmiddleware.js");
const { Signup, confirmEmail, Login, forgetPassword, resetPassword, GetMe } = require("./Auth.controller.js");

router.post("/signup", Signup);
router.route("/confirm-email").post(confirmEmail);
router.post("/login", Login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", auth, GetMe);

module.exports = router;