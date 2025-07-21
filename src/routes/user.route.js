import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, regesterUser } from "../controllers/user.controller.js";
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
router.route("/refresh-token").post(refreshAccessToken)


export default router;