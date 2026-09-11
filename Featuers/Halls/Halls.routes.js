const router = require("express").Router();

const {
  CreateHall,
  GetAllHalls,
  GetHall,
  UpdateHall,
  DeleteHall
} = require("./Halls.controller.js");

const auth = require("../../middleware/Authmiddleware.js");
const restrictTo = require("../../middleware/restrictTO.js");

router.get("/", GetAllHalls);
router.get("/:id", GetHall);

router.post("/", auth, restrictTo("admin"), CreateHall);
router.patch("/:id", auth, restrictTo("admin"), UpdateHall);
router.delete("/:id", auth, restrictTo("admin"), DeleteHall);

module.exports = router;