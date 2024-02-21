import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  addQuestion,
  editCourse,
  getAllCourse,
  getCourseContent,
  getSingleCourse,
  uploadCourse,
} from "../controller/course.controller";
import { courseRecommendation } from "../services/course.services";
const courseRouter = express.Router();

courseRouter.post("/create-course", isAutheticated, uploadCourse);
courseRouter.put("/edit-course/:id", isAutheticated, editCourse);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourse);
courseRouter.get("/get-courses", getAllCourse);
courseRouter.get("/recommendations/:tags", courseRecommendation);
courseRouter.get("/course-content/:id",isAutheticated, getCourseContent);
courseRouter.put("/add-question",isAutheticated, addQuestion);
// courseRouter.put("/add-answer",isAutheticated, addAnswer);





export default courseRouter;
