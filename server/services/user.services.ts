import userModel from "../models/user.Model";
import { NextFunction, Response } from "express";
import { redis } from "../utils/redis";



export const getUserById = async (id: string, res: Response) => {
  const userJSON = await redis.get(id);

  if (userJSON) {
    const user = JSON.parse(userJSON);
    res.status(201).json({
      success: true,
      user,
    });
  }
};

//get All users

export const getAllUserService = async( res:Response) =>{
  const users = await userModel.find().sort({createdAt:-1});

  res.status(201).json({
    success:true,
    users
  })
}

//update user role
export const updateUserRoleService = async(res:Response,id:string,role:string)=>{
  const user = await userModel.findByIdAndUpdate(id,{role},{new:true});

  res.status(201).json({
    success:true,
    user,

  })
 
}