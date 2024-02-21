require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import UserModel from "../models/user.Model";
import ErrorHandler from "../utils/ErrorHandler";
import { catchAsyncError } from "../middleware/catchAsyncError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import cloudinary from "cloudinary";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import { getAllUserService, getUserById, updateUserRoleService } from "../services/user.services";

interface IRegistractionBody {
  name: string;
  email: string;
  password: string;
  avatar: string;
}

export const registrationModel = async (
  req: Request<{}, {}, IRegistractionBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new ErrorHandler("Email already exists", 400));
    }

    const user: IRegistractionBody = {
      name,
      password,
      email,
      avatar: req.body.avatar,
    };

    // Create the user account
    const newUser = await UserModel.create(user);

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${newUser.email}`,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

//login user

interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("please enter email and password", 400));
      }

      const user = await UserModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        console.log(
          `${next(new ErrorHandler("Invalid email or password", 400))}`
        );
        return next(new ErrorHandler("Invalid email or password", 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      console.log(`something goes wrong ${error}`);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//logout user

export const logoutUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", " ", { maxAge: 1 });
      res.cookie("refresh_token", " ", { maxAge: 1 });

      const userId = req.user?._id || "";
      redis.del(userId);

      res.status(200).json({
        success: true,
        message: "Logged Out Successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update access_token
export const updateAcessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = "could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }

      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler("please login for access these resources", 400));
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "5m",
        }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "3d",
        }
      );

      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      await redis.set(user._id,JSON.stringify(user), 'EX' , 6048000)

      res.status(200).json({
        status: "success",
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get user info
export const getUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user info
interface IupdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body as IupdateUserInfo;
      const userId = req.user?._id;
      const user = await UserModel.findById(userId);

      if (email && user) {
        const isEmailExist = await UserModel.findOne({ email });

        if (isEmailExist) {
          return next(new ErrorHandler("email already exist", 400));
        }

        user.email = email;
      }
      if (name && user) {
        user.name = name;
      }
      await user?.save();
      await redis.set(userId, JSON.stringify(user));
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user password

interface IUpadtePassword {
  oldPassword: string;
  newPassword: string;
}

export const updatePassword = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpadtePassword;

      if (!oldPassword || !newPassword) {
       

        return next(new ErrorHandler("please enter old and new password", 400));
      }

      const user = await UserModel.findById(req.user?._id).select("+password");
      console.log("user ", user);

      if (user?.password === undefined) {

        return next(new ErrorHandler("Inavalid user", 400));
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {

        return next(new ErrorHandler("Invalid old password", 400));
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// user profile update
interface IUprofile {
  avatar: string;
}

export const updateProfilePicture = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body as IUprofile
      const userId = req.user?._id;

      const user = await UserModel.findById(userId);

      if (avatar && user) {
        if (user?.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await user?.save();
      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


// get all user -- only admin

export const getAllUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`run try block`);

      getAllUserService(res);
    } catch (error: any) {
      console.log(`${next(new ErrorHandler(error.message, 400))}`);

      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//update user role -- only for admin

export const updateUserRole = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;

      updateUserRoleService(res, id, role);
    } catch (error: any) {
      console.log(`${next(new ErrorHandler(error.message, 400))}`);

      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//delete user  ---only for admin

export const deleteUser = catchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
  try {
    console.log(`try run block`);
    
    const {id} = req.params

    const user = await UserModel.findById(id);

    if (!user) {
      return next(new ErrorHandler("User doesn't exist", 404));
      
    }

    await user.deleteOne({id});
    await redis.del(id);

    res.status(200).json({
      success:true,
      message:"User deleted sucessfully"

    });

    
  } catch (error: any) {
    console.log(`${next(new ErrorHandler(error.message, 400))}`);

    return next(new ErrorHandler(error.message, 400));
  }

})
