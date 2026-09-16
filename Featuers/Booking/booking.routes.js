const router = require("express").Router();
const auth = require("../../middleware/Authmiddleware.js");

const {
  GetShowtimeSeats,
  CreateBooking,
  GetMyBookings,
  GetOneBooking,
  CancelBooking,
} = require("./booking.controller.js");

//"booking/showtime/:showtimeId/seats"
router.get("/showtime/:showtimeId/seats", GetShowtimeSeats);

router
  .get("/", auth, GetMyBookings)
  .post("/", auth, CreateBooking);

router
  .get("/:id", auth, GetOneBooking)
  .patch("/:id/cancel", auth, CancelBooking);

module.exports = router;
