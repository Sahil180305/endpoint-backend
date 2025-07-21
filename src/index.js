// require("dotenv").config({path:"./env"});   -> cannot be used 
// import express from "express"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/index.js";
import "dotenv/config"

// const app = express();
// app.listen(process.env.PORT,()=>{
//     console.log(`APP IS LISTING ON PORT : ${process.env.PORT}`);
// });

connectDB()
.then(
    ()=>{
        console.log("MongoDb connection Succesful");
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`Server is runnung at port ${process.env.PORT} `);
        })
    }
)
.catch((err)=>{
    console.log("MongoDb connection Failed !!! \n",err);
    app.on("error",(err)=>{
        console.log("ERROR ! ",err);
        throw err;
    })
})



// METHOD 1 OF CONNNECTING WITH DB
/*
;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`);
        console.log("Connection to database is succesful ");
        app.on("error",(error)=>{
            console.log("ERRR: ",error);
            throw error;
        });
        app.listen(process.env.PORT,()=>{
            console.log(`APP IS LISTING ON PORT : ${process.env.PORT}`);
        });

        
    } catch (error) {
        console.log("Database Connection Failed ",error);
        throw error;
    }

})();

*/