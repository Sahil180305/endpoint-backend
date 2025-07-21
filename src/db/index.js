import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async ()=>{
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`);
        // console.log(connectionInstance);
        console.log(`MongoDb connected !! DB HOST : ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Connection to database is Failed \n",error);
        throw error;
    }
}

export default connectDB;