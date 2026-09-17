const AppError = require("../../utils/Apperror.js");
const catchAsync = require("../../utils/catchasync.js");
const users = require("../users/users.model.js");
const bcrypt = require("bcryptjs");
const { customAlphabet } = require("nanoid");
const emailTemplate = require("../../utils/emailtemp.js");
const generateOTP = customAlphabet("0123456789", 6);
const SendEmail=require("../../utils/sendmail.js")
const jwt= require("jsonwebtoken")
const crypto = require("crypto")
const {promisify} = require("util");
const jwtSign = promisify(jwt.sign)



exports.Signup = catchAsync(
  async (req, res, next) => {

    const { name, email, password } = req.body;

    const finduser = await users.findOne({ email });

    if (finduser) {
      return next(
        new AppError(400, "Email already exists")
      );
    }

    const hashedpassword = await bcrypt.hash(
      password,
      +process.env.SALT_ROUNDS
    );
    

    const otp = generateOTP();
     const confirmOTP = await bcrypt.hash(otp,+process.env.SALT_ROUNDS)

    const user = await users.create({
      name,
      email,
      password: hashedpassword,
      otp,
      confirmOTP,
      otpExpires: new Date(Date.now() + 5 * 60 * 1000)
    });



await SendEmail(
  email,
  "Verify Your Cinema Account",
  emailTemplate({
    name: user.name,
    type: "verify",
    otp
  }),
  `Your Cinema verification code is: ${otp}`
);


    res.status(201).json({
      success: true,
      message: "User created successfully"
    });
  }
);






exports.confirmEmail = catchAsync(async (req,res,next) => {
    const {email,confirmOTP} = req.body 
    // check if email is exist 
    const findUser = await users.findOne({isDeleted:false,email}).select("+confirmOTP +otpExpires +isConfirmed")
    if(!findUser) return next(new AppError(400,`This email doesn't exist please signup first!`))
    // check if email is active
    if(findUser.isConfirmed) return next(new AppError(400,`This email is already active`))
    // check otp 
    const check = await bcrypt.compare(confirmOTP,findUser.confirmOTP)
    if(!check || !confirmOTP || findUser.otpExpires < Date.now()) return next(new AppError(400,`Invalid OTP or Expired`)) 
    findUser.isConfirmed = true 
    findUser.confirmOTP = undefined 
    findUser.otpExpires = undefined 
    await findUser.save()
    res.status(200).json({
        success : true ,
        message : `your account is verifiyed successfully `
    })
})


exports.Login=catchAsync(




async(req,res,next)=>{
const {email,password}=req.body;

const finduser= await users.findOne({isDeleted:false, isActive:true, email:email }).select("+password +isConfirmed");
if(!finduser){

  return next(new AppError(400,"invalid credentials"));
}

  if(!finduser.isConfirmed) return next(new AppError(400, `your Account is not Verified please complete th everification  !`))


const checkpassword= await bcrypt.compare(password, finduser.password);

if(!checkpassword) return next(new AppError(400, `Invalid credentials`))


 const token = await jwtSign({_id:finduser._id,role:finduser.role},process.env.SECRET_KEY,{expiresIn:"7d"})


res.status(200).json({

success:true,
token:token

})




}





)



exports.forgetPassword = catchAsync(async (req,res,next) => {
    const {email} = req.body 
    const findUser = await users.findOne({isDeleted:false, isActive:true ,email})
    if(!findUser) return next(new AppError(404,'User is not found'))
    const resetToken = await crypto.randomBytes(32).toString("hex")
    findUser.resetToken = resetToken

    await findUser.save()
    console.log(resetToken)
    const link = `http://localhost:8000/auth/reset-password/${resetToken}`
  await SendEmail(
  email,
  "Reset Password",
  emailTemplate({
    name: findUser.name,
    type: "reset",
    link
  }),
  )

    res.status(200).json({
        success : true ,
        message : 'link sent to email'
    })
})



exports.resetPassword = catchAsync(async(req,res,next) => {
    const {token} = req.params 
    const {password} = req.body 
    const findUser = await users.findOne({isDeleted:false , isActive:true ,resetToken:token})
    if(!findUser) return next(new AppError(400,`The reset Token is invalid or expired`))
    if(password.length < 8) return next(new AppError(400,`password must be 8 char or more`))
    const hashPassword = await bcrypt.hash(password,+process.env.SALT_ROUNDS)
    findUser.password = hashPassword
    findUser.resetToken = undefined 
    await findUser.save()
    res.status(200).json({
        success : true ,
        message : "password is reset successfully"
    })
})


exports.GetMe=catchAsync(


async (req,res,next)=>{

const userdata= req.user;

res.status(200).json({

success:true,
data:userdata


}
)









}





)













exports.UpdateUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError(400, "Image is required"));
  }

  const user = await users.findOne({
    _id: req.params.id,
    isDeleted: false
  });

  if (!user) {
    return next(new AppError(404, "User not found"));
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    "cinema/users"
  );

  const oldPublicId = user.image?.publicId;

  user.image = {
    url: result.secure_url,
    publicId: result.public_id
  };

  await user.save();

  if (oldPublicId) {
    await cloudinary.uploader.destroy(oldPublicId);
  }

  res.status(200).json({
    success: true,
    message: "Profile image updated successfully",
    result: user
  });
});













