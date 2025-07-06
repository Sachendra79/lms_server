const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//create rating

exports.createRating = async (req, res) => {
  try {
    //get userId
    const userId = req.user.id;

    //fetchdata from body
    const { rating, review, courseId } = req.body;
    //check if user is enrolled or not

    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $eleMatch: { $eq: userId } },
    });

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is not enrolled in this course",
      });
    }
    //check if user already reviewed

    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      cousre: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course is aleady reviewed",
      });
    }

    //create rating
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });

    //update the course
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    //return response
    return res.status(200).json({
      success: true,
      message: "raitng and Review created succesfully",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//get  avg rating

 exports.getAverageRating = async (req,res) =>
 {
    try {

       //get courseId
       const courseId = req.body.courseId;

       //calculate avg rating
          const result = await RatingAndReview.aggregate([
            {
                   $match :{
                    course:new mongoose.Types.ObjectId(courseId)
                   },

            },
            {
                $group:{
                    _id:null,
                    averageRating :{ $avg : "$rating"},
                }
            }
          ])

       //return rating
       if(result.length >0)
       {
        return res.status(200).json({
            success:true,
            averageRating: result[0].averageRating,
        })
       }

       //if no rating review exist

       return res.status(200).json({
        success:true,
        message:"Average Rating is 0 , no rating is given till now",
        averageRating:0,
       })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
 }


//get all rating


exports.getAllRatingAndReview = async(req,res) =>
{
    try {
         
         
        const allReviews = await RatingAndReview.find({})
        .sort({rating:"desc"})
        .populate({
            path:"user",
            select:"firstName lastName email image"
        })
        .populate({
            path:"course",
            select:" courseName"
        })
         exec();

  return res.status(200).json({
    success:true,
    message:"all reviews fetched succesfully",
    data:allReviews,
  })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
          success: false,
          message: error.message,
        });
    }
}