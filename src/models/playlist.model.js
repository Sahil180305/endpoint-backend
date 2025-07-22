import mongoose,{Schema} from "mongoose";

const playlistSchema = new Schema({
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],

},{timestamps:true})

const Like = mongoose.model("Like",likeSchema);