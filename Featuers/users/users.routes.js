const {

 CreateUser,

 GetallUsers,

 UpdatUser,

 DeleteUser,

 GetUser,

 BanUser,

 UpdateUserImage

} = require("./users.controller.js");

const auth = require("../../middleware/Authmiddleware.js");

const restrictTo = require("../../middleware/restrictTO.js");

const isSelfOrAdmin = require("../../middleware/isSelforAdmin.js");
const upload = require("../../middleware/uploadImage.js");

const router = require("express").Router();

router.post(
  "/",
  auth,
  restrictTo("admin"),
  upload.single("image"),
  CreateUser
);

router.get("/", auth, restrictTo("admin"), GetallUsers);

router.patch("/ban/:id", auth, restrictTo("admin"), BanUser);

router.delete("/:id", auth, restrictTo("admin"), DeleteUser);

router.get("/:id", auth, isSelfOrAdmin, GetUser);

router.patch("/:id", auth, isSelfOrAdmin, UpdatUser);

router.patch("/:id/image", auth, isSelfOrAdmin , upload.single("image")   , UpdateUserImage);

module.exports = router;