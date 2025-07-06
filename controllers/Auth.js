const User = require("../models/User")
const OTP = require("../models/Otp")
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
require("dotenv").config();

exports.sendOtp = async ( req,res) =>
{


      try {
        const {email}= req.body;

        const checkUserPresent = await User.findOne({email}) 
     
     
            if(checkUserPresent)
            {
             return res.status(401).json({
                 success:false,
                 message:"user already registered",
             })
            }
      
            //generate otp

            let otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,

            });
            console.log("otp generaeed", otp);

         //check unique otp or not
         const result = await OTP.findOne({otp:otp});

         while(result)
         {
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            })

             result = await OTP.findOne({otp:otp});
         }

       const otpPayload =  {email,otp};
              
       //create entry in db for otp
          const otpBody = await OTP.create(otpPayload);
          console.log(otpBody);
        

          res.status(200).json({
              success:true,
              message:"OTP Sent Successfully",
              otp,
          })

      } catch (error) {
        console.log(error);
        return  res.status(500).json({
            success:false,
            message:error.message
        })
      }

};

//signup 

exports.signup = async (req,res) =>
{

    try {
        
 //data fecth
 const {firstName, lastName,email, password,
    confirmPassword,accountType,contactNumber,otp} = req.body;
//validate krlo
if(!firstName || !lastName || !email || !password || 
   !confirmPassword  || !otp) {
       return res.status(403).json({
           success:false,
           message:"All fields are required",
       })
   }
// 2 password match krlo

if(password !== confirmPassword)
{
   return res.status(400).json({
       success:false,
       message :" confirm Password did not match"
   });
}
//check user already exist or not
const existingUser = await User.findOne({email});

if(existingUser)
{
   return res.status(400).json({
       success:false,
       message:"User is already exist"
   })
}

//find most recent otp stored in user
const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
console.log(recentOtp)
//validate otp
    if(recentOtp.length == 0)
    {
        //otp not found
        return res.status(400).json({
           success:false,
           message:"OTP not Found",
        })
    }  else if(otp !== recentOtp)
    {
       //invalid otp
       return res.status(400).json({
           success:false,
           message:"Invalid OTP",
       })
    }
//Hash Password

const hashedPassword = await bcrypt.hash(password, 10);

//create entry in DB

const  profileDetails= await Profile.create({
   gender:null,
   dateOfBirth:null,
   about:null,
   contactNumber:null,
})

const user = await User.create({
   firstName,
   lastName,
   email,
   contactNumber,
   password:hashedPassword,
   accountType,
   additionalDetails:profileDetails._id,
   image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
})

//return res

 return res.status(200).json({
    success:true,
    message:"User is registered succesfully".
    user,
 })

    } catch (error) {
         console.log(error)
         return res.status(500).json({
            success:false,
            message:"USer cannot be registered. Pleaswee try again"
         })
    }
      
}

//login

exports.login = async (req,res) =>
{
  
    try {
        
     const {email, password} = req.body;
       
      (!email || !password)
      {
        return res.status (403).json({
            success:false,
            message:"Fill all the details",
        })
      };
      
 const user = await User.findOne({email}).populate("additionalDetails");

  if(!user)
  {
    return res.status(401).json({
        success:false,
        message:"User is not registered, please signup first"

    })
  }

        if(await bcrypt.compare(password,user.password))
        {
         const payload ={
            email:user.email,
            id: user._id,
            accountType:user.accountType,
         }

            const  token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            })

            user.token=token;
            user.password = undefined;
                  
            const options ={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }

            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            })
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure, please try again'
        })
    }
      
}

exports.changePassword= async (req,res) =>
{

}