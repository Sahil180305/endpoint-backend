import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, regesterUser, updateAccountDetails, updateUserAvator } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/user.middleware.js";

const router = Router();


router.route("/register").post(
    upload.fields([   //internal working -> study this fields
        {
            name : "avator",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ])
    ,regesterUser
);

router.route("/login").post(loginUser);

// secured route
router.route("/logout").post(verifyJWT , logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT,changeCurrentPassword);
router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").patch(verifyJWT,updateAccountDetails);
router.route("/avator").patch(verifyJWT,upload.single("avator"),updateUserAvator);
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserAvator);

router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/watch-history").get(verifyJWT,getWatchHistory)


export default router;