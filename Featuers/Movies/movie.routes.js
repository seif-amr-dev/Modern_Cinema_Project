const router = require("express").Router();

const {
  CreateMovie,
  GetAllMovies,
  GetMovie,
  UpdateMovie,
  DeleteMovie
} = require("./movie.controller.js");

const auth = require("../../middleware/Authmiddleware.js");
const restrictTo = require("../../middleware/restrictTO.js");
const upload = require("../../middleware/uploadImage.js");

router.get("/", GetAllMovies);
router.get("/:id", GetMovie);

router.post("/", auth, restrictTo("admin"), upload.single("poster"), CreateMovie);
router.patch("/:id", auth, restrictTo("admin"), upload.single("poster"), UpdateMovie);
router.delete("/:id", auth, restrictTo("admin"), DeleteMovie);

module.exports = router;