const Course = require("../models/Course")
const Section = require("../models/Section");



exports.createSection = async (req,res) =>
{

         try {
            
           const { sectionName, courseId} = req.body;

           if(!sectionName || !courseId)
           {
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            })
           }

                 const newSection = await Section.create({sectionName});

                 const updatedCourseDeatils = await Course.findByIdAndUpdate(
                    courseId,{
                        $push:{
                            courseContent:newSection._id,
                        }
                    } ,{new:true}
                 )
//use populate to repalce section and subsection both in the pdatedcourse detaiols
                 return res.json(200).json({
                       success:true,
                       message:"section created succesfully",
                       updatedCourseDeatils,
                 })
            

         } catch (error) {
              return res.json(400).json({
                success:false,
                message:"failed to create the section",
                error:error.message,
              })
         }
}


exports.updateSection =async (req,res) =>
{
    try {
        
          //data input
          const {sectionName, sectionId}= req.body;

          //data validation

          if(!sectionName || !sectionId)
           {
            return res.status(400).json({
                success:false,
                message:'Missing Properties'
            })
           }
          //update data 
           const updatedSection = await Section.findByIdAndUpdate(sectionId,{sectionName}, {new:true});


           return res.json(200).json({
            success:true,
            message:"section updated succesfully",
            updatedSection,
      })


    } catch (error) {
         return res.status(500).json({
            success:false,
            message:"failed to update the section",
            error:error.message,
         })
    }
}

exports.deleteSection = async (req,res) =>
{
    try {
        
          //get ID - assuming we are sending in params
          const {sectionId} = req.params;
            
          await Section.findByIdAndDelete(sectionId);

          return res.json(200).json({
            success:true,
            message:"Section deleted succesfully",
            
      })


    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"failed to delete the section",
            error:error.message,
         })
    }
}
