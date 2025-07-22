import { Router } from "express";


import {verifyJWT} from "../middlewares/user.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addCount)
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router;