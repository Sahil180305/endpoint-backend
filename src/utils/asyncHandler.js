const asyncHandler = (requestHandler) => {
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res)).catch((error)=>{next(error)}); //doubt 
    }   
}


export {asyncHandler};


// const asyncHandler = () => {}
// const asyncHandler = (fun) => { () => {} }
// const asyncHandler = (fun) => () => {}
// const asyncHandler = (fun) => async () => {}


// const asyncHandler = (fun) => async (err,req,res,next) => {
//     try {
//         await fun(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500 ).json({
//             success: false,
//             message: error.message
//         })
//     }
// }
