

const mongoose = require("mongoose");

const UsersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [30, "Name must be below 30 characters"],
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    dateOfBirth: {
      type: Date
    },

    gender: {
      type: String,
      enum: ["male", "female"]
    },

    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    isActive: {
      type: Boolean,
      default: true
    },
    
 image:{
  type:String
 },
isConfirmed:{
type:Boolean,
default:false,
select:false

},


otp: {
  type: String,
  select: false
},

otpExpires: {
  type: Date,
  select: false
},
 confirmOTP : {
        type : String, 
        select:false
    },
 
  resetToken : {
        type : String,
        select:false
    },
        isDeleted : {
        type : Boolean ,
        default : false,
        select:false 
    },
    deletedAt : {
        type : Date,
        select:false
    }
   
  },
  {
    timestamps: true
  }
);



const User = mongoose.model("Users", UsersSchema);

module.exports = User;