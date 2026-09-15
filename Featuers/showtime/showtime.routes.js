const router = require("express").Router();

const {
  CreateShowtime,
  GetAllShowtimes,
  GetOneShowtime,
  UpdateShowtime,
  DeleteShowtime,
} = require("./showtime.controller.js");

const auth = require("../../middleware/Authmiddleware.js");
const restrictTo = require("../../middleware/restrictTO.js");

router
  .get("/", GetAllShowtimes)
  .post("/", auth, restrictTo("admin"), CreateShowtime);

router
  .get("/:id", GetOneShowtime)
  .patch("/:id", auth, restrictTo("admin"), UpdateShowtime)
  .delete("/:id", auth, restrictTo("admin"), DeleteShowtime);

module.exports = router;
