import mongoose , {Schema} from "mongoose"
import jwt from "jsonwebtoken" //its a bearer token 
import bcrypt from "bcrypt";

const userSchema = new Schema ({
    username:{
        type:String,
        required:true,
        unique:true,
        index:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullName:{
        type:String,
        required:true,
        index:true,
        trim:true
    },
    avator:{
        type:String, //claudinary url
        required:true
    },
    coverImage:{
        type:String //claudeinary url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true," Password is required "],
    },
    refreshToken : {
        type : String,
    }
},
{
    timestamps:true
}
)

userSchema.pre("save", async function (next) {   //arrow function this -> differtly behave karta hai
    if(!this.isModified("password")) return next(); //how ismodified work

    this.password = await bcrypt.hash(this.password,5)
    next();
}
)

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password); //how this is pointing to userSchema
}

userSchema.methods.generateAccessToken = function (){
    return jwt.sign(
        {
            _id : this._id,
            username : this.username,
            email : this.email,
            fullName  : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema);

