const User =require("../models/User")
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt")

exports.resetPasswordToken = async (req,res) =>
{
 try {
    
    const {email} = req.body.email;

    const user = await User.findOne({email:email});
    if(!user)
    {
      return res.json({success:false,
      message:"Your email is not registered"})
    }

      //generate token
      const token = crypto.randomUUID();

      const updateDetails = await User.findOneAndUpdate(
          {email:email},
          {
              token:token,
              resetPasswordExpires:Date.now() + 5*60*1000
          },
          {new:true}
      );


  const url = `http://localhost:3000/update-password/${token}`


await mailSender(email,"Password Reset Link",` Click here to Reset your password ${url}` )

return res.json({
  success:true,
  message:"Reset Passsword successfully"
})

 } catch (error) {
    console.log(error)

    return res.status(500).json({
        success:false,
        message:"Error while resetting password"
    })
 }

}

//reset password


exports.resetPassword = async(req,res) =>
{

      try {

        const {password, confirmPassword ,token} = req.body;

    if(!password || !confirmPassword || !token)
    {
        return res.status(403).json({
            status:false,
            message:"Fill all the entry"
        })
    }

    if(password !== confirmPassword)
    {
        return res.json({
            success:false,
            message:'password does not match'
        })
    }
     

    const userDetails = await user.findOne({token:token});

    if(!userDetails)
    {
        return res.json({
            success:false,
            message:"Token is invalid"
        })
    }

   if(userDetails.resetPasswordExpires < Date.now())
   {
       return res.json({
        success:false,
        message:"token is expired , please regenraten it"
       })
   }
     
    // hash password

    const hashedPassword = await bcrypt.hash(password ,10);

    await User.findByIdAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    )


    return res.status(200).json({
        success:true,
        message :"Password reset done"
    })
        
      } catch (error) {
        
       console.log(error)
       return res.status(400).json({
        success:false,
        message:"error while resetting password"
       })

      }


    

}