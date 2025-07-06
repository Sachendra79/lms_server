const SubSection = require("../models/SubSection")
const Section = require ("../models/Section");
const { uploadImageToClodinary } = require("../utils/imageUploader");

  exports.createSubSection = async(req,res) =>
  {
     try {
        
        //fetch data from req.body
        const {sectionId, title,timeDuration,description} =req.body;

        //extract file
        const video = req.files.videoFile;
        //validation

        if(!sectionId || !title  || !timeDuration || !description )
        {
              return res.status(400).json({
                success:false,
                message:'all fields are required'
              })
        }
        //uplaod video in clodinary
            const uploadDetails = await uploadImageToClodinary(video, process.env.FOLDER_NAME);

        //create subsection

        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videos:uploadDetails.secure_url,
        })

        //update tje section with this subsection
        const  updatedSection = await Section.findByIdAndUpdate({_id:sectionId},
            {
                $push:{
                    subSection:SubSectionDetails._id,
                }
            },{new:true}
            
            );

        //return response

        return res.status(200).json({
            success:true,
            message:'SubSection created succesfully',
            updatedSection,
        })

     } catch (error) {
         return res.status(500).json({
            success:false,
            message:"sub section creation failed",
            error:error.message,
         })
     }
  }

// HW. update sebsection

exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId,subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      const updatedSection = await Section.findById(sectionId).populate("subSection")


      return res.json({
        success: true,
        data:updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }

//delete sbssection

exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }