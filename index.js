require("dotenv").config()
const express = require("express")
const app= express();
const userRoutes =require("./Featuers/users/users.routes.js")

const AppError = require("./utils/Apperror.js");
const authroute= require("./Featuers/Auth/Auth.routes.js")
const globalError=require("./middleware/globalerror.js")
const movieroutes=require("./Featuers/Movies/movie.routes.js")
app.use(express.json())
app.use("/auth",authroute)

app.use("/users",userRoutes)

app.use("/movie",movieroutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page not found"
  });
});



app.use(globalError);


module.exports=app





