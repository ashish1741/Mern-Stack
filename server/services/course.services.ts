import { Response, Request, NextFunction } from "express";
import CourseModel from "../models/course.model";
import { catchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";

//create course

export const createCourse = catchAsyncError(
  async (data: any, res: Response) => {
    console.log("create course is called");

    const course = await CourseModel.create(data);
    console.log(course);

    res.status(201).json({
      success: true,
      course,
    });
  }
);

//get All courses

export const getAllCourseService = async (res: Response) => {
  const courses = await CourseModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    courses,
  });
};


// content-based filtering 


interface IRecommendation{
    tag:string
}
export const courseRecommendation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = req.body.tag;
      // Fetch all courses
      const courses = await CourseModel.find();
  
      // Filter courses based on the tag
      const recommendedCourses = courses.filter(course => course.tag.toLowerCase().includes(tag.toLowerCase()));
  
      res.status(200).json({
        success: true,
        recommendedCourses,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  };