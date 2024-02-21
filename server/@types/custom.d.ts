import { Request } from "express";
import { IUser } from "../models/user.Model";

declare global{
    namespace Express{
        interface Request{
            user?:IUser
        }
    }
}