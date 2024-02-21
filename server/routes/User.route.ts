import express from "express";

import {
  deleteUser,
  getAllUser,
  getUserInfo,
  loginUser,
  logoutUser,
  registrationModel,
  updateAcessToken,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole,
} from "../controller/user.controller";


import { isAutheticated, authorizeRoles } from "../middleware/auth";


const userRouter = express.Router();

userRouter.post("/registration", registrationModel);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAutheticated, logoutUser);
userRouter.get("/refresh", updateAcessToken);
userRouter.get("/me", isAutheticated, getUserInfo);
userRouter.put("/update-user-info", isAutheticated, updateUserInfo);
userRouter.put("/update-user-password", isAutheticated, updatePassword);
userRouter.put("/update-user-profile", isAutheticated, updateProfilePicture);
userRouter.get("/get-all-user", isAutheticated,authorizeRoles("admin"),  getAllUser);
userRouter.put("/update-user-role", isAutheticated,authorizeRoles("admin"), updateUserRole);
userRouter.delete("/delete-user/:id", isAutheticated, authorizeRoles("admin"),deleteUser);

export default userRouter;
