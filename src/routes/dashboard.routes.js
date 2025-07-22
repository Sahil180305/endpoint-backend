import { Router } from "express";

import {verifyJWT} from "../middlewares/user.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/stats").get(getChannelStats);
router.route("//videos").get(getChannelVideos);


export default router;