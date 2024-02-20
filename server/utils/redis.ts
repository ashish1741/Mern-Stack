import {Redis} from "ioredis";
require("dotenv").config();

const redisClient = () => {
    if (process.env.REDIS_URL) {
        console.log(`Redis is Connected`);
        return process.env.REDIS_URL
        
        
    }
    throw new Error(`Redis connection is failed`)
}


export const redis = new Redis(redisClient());
