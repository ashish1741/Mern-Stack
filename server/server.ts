import { app } from "./app";
import connectDb from "./utils/db";
require("dotenv").config();


// create a server 

app.listen(3002 , () => {
    console.log(`server is connected `);
    connectDb();
    

});

