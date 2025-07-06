const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = ()=> {
    mongoose.connect(process.env.MONGODB_URL)
    .then (()=> console.log("database connected succesfully"))
    .catch((err)=>{
         console.log("error while connecting DB")
         console.log(err)
         process.exit(1);
        })
}