import { app } from "./app";
import connectDb from "./utils/db";
require("dotenv").config();
import {v2 as cloudinary} from "cloudinary"


// create a server 

app.listen(3000 , () => {
    console.log(`server is connected `);
    connectDb();
    

});

// cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_API,
    api_secret: process.env.CLOUD_API_SECRETE

})