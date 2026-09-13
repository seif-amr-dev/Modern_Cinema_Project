require("dotenv").config()
const express = require("express")
const cors = require("cors");
const app= express();
const userRoutes =require("./Featuers/users/users.routes.js")
const cors = require("cors")

const AppError = require("./utils/Apperror.js");
const authroute= require("./Featuers/Auth/Auth.routes.js")
const globalError=require("./middleware/globalerror.js")
const movieroutes=require("./Featuers/Movies/movie.routes.js")
const hallroutes= require("./Featuers/Halls/Halls.routes.js")
const showtimeroutes =require("./Featuers/showtime/showtime.routes.js")
<<<<<<< HEAD
app.use(cors());
=======
app.use(cors())
>>>>>>> f9266dd2e7777de3e719ccd9e9273a3d6d7e8272
app.use(express.json())
app.use("/auth",authroute)

app.use("/users",userRoutes)

app.use("/movie",movieroutes)
app.use("/hall", hallroutes);
app.use("/showtime", showtimeroutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found"
  });
});



app.use(globalError);


module.exports=app





