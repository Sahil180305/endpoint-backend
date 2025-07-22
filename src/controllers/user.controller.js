import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) =>{
    const user =await User.findById(userId);
    const accessToken = user.generateAccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; //is it pointing or creating a copy

    await user.save({validateBeforeSave : false});

    return {accessToken , refreshToken};
}


const regesterUser = asyncHandler( async (req,res) => {
   
    // get user details from frontend
    // validation - not empty
    // check if user already exits - username and email
    // check for images , check for avator
    // upload them to claudinary , avator
    // create user object - create entry to db
    // remove password and refresh token
    // check user creation 
    // return res


    const {fullName , username , password , email} = req.body;

    // console.log(fullName , username);

    if( [fullName , username , password , email].some(
        (field) =>field?.trim()===""
    ) ){
        throw new ApiError(400 , "All field are required ");
    }

    const existedUser = await User.findOne({
        $or: [{username} , {email}]
    })

    if(existedUser){
        throw new ApiError(409 , "User with emial or username already exits ");
    }

    const avatorLocalPath=req.files?.avator[0]?.path;
    // const coverImageLocalPath=req.files?.coverImage[0]?.path;
    let coverImageLocalPath;


    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0 ){
        coverImageLocalPath=req.files.coverImage[0].path;
    }



    if(!avatorLocalPath){
        throw new ApiError(400 , "Avatar file is required ")
    }

    const avator=await uploadOnCloudinary(avatorLocalPath);
    const coverImage=await uploadOnCloudinary(coverImageLocalPath);

    if(!avator){
        throw new ApiError(400 , "Avator file is required")
    }
    
    const user = await User.create({  
        username : username.toLowerCase(),
        fullName,
        email,
        password,
        avator : avator.url,
        coverImage : coverImage?.url || "" 
    })

    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, " Something went wrong while regestering the user ")
    }

    res.status(200).json(
        new ApiResponse(
            202,
            createdUser,
            "User is successfully registered in DB "
        )
    )
})



const loginUser = asyncHandler( async (req,res) => {
    // req.body => data (usernmae /email , password)
    // valid data (isempty)
    // is present in db (username / email)
    // if present check is password correct
    // create tokens
    // update db refresh token
    // send data /cookie

    const {username , email ,password} = req.body;

    if((!username && !email) || !password){
        throw new ApiError(400 , "username or email is required ")
    }

    if(!password){
        throw new ApiError(400 , "Password is required ")
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiError(401, " User does not exits ")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(400 , "Invalid user credentials ")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken , refreshToken
            },
            "User logged In Successfully"
        )
    )
} 

)


const logoutUser = asyncHandler( async (req,res) => {
    // find whom to logout ->token
    // token accessing
    // token -> id ->user 
    // token deletion (both in cookie and db)

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken : ""
            }
        },
        {
            new :true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200 , {} , "User logged Out")
    )
})

const refreshAccessToken = asyncHandler( async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = User.findById(decodedRefreshToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid  refresh Token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure :true
        }
    
        const {newAccessToken , newRefreshToken} = generateAccessAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken" , newAccessToken , options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken:newAccessToken , refreshToken:newRefreshToken},
                "Access Token refresed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async (req , res )=>{
    const {oldPassword , newPassword} = req.body
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid old Password")
    }
    user.password = newPassword;
    user.save({validateBeforeSave:false});
    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(
    async (req,res) =>{
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "User fetched successfully"
            )
        )

    }
) 

const updateAccountDetails = asyncHandler(
    async (req,res) => {
        // check if user is login ->middleware
        // get data from frontend
        // validation of data
        // find and update the user db
        // return 

        const {fullName , email } = req.body;

        if(!fullName || !email){
            throw new ApiError(401,"All fields are required")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set : {
                    fullName,
                    email
                }
            },
            {
                new: true
            }
        ).select("-password")

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "Account details updated successfully"
            )
        )
    }
)

const updateUserAvator = asyncHandler( async (req,res) =>{
    const avatorLocalPath  = req.file?.path

    if(!avatorLocalPath){
        throw new ApiError(401,"Avator file is missing")
    }

    const avator = await uploadOnCloudinary(avatorLocalPath);

    if(!avator.url){
        throw new ApiError(500,"Error while uploading on avator")
    }

    const user = await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            avator : avator.url
        }
    },
    {new:true}
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(
            501,
            "Can not find the user in Database try again"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avator image updated successfully")
    )
})

const updateUserCoverImage = asyncHandler( async (req,res) =>{
    const coverImageLocalPath  = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(401,"Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(500,"Error while uploading on avator")
    }

    const user = await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            coverImage : coverImage.url
        }
    },
    {new:true}
    ).select("-password -refreshToken")

    if(!user){
        throw new ApiError(
            501,
            "Can not find the user in Database try again"
        )
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover image updated successfully")
    )
})

export {
    regesterUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvator,
    updateUserCoverImage
};