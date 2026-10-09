import { Router } from "express";
 import {acceptConnectionRequest, downloadProfile, getAllUserProfile,getUserProfileAndUserBasedOnUsername, getMyConnectionsRequests, getUserAndProfile, register, sentConnectionRequest, updateUserProfile, whatAreMyConncetions} from "../controllers/user.controller.js";
 import {login} from "../controllers/user.controller.js";
import multer from "multer"
import { updateProfileData } from "../controllers/user.controller.js";
import { uploadProfilePicture } from "../controllers/user.controller.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";


const router = Router();
const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,"uploads/")
    },
    filename:(req,file,cb)=>{
       cb(null,file.originalname)
    }
})

const upload = multer({storage:storage})

router.route("/update_profile_picture").post(upload.single("profile_picture"),uploadProfilePicture)

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/update_user_profile").post(updateUserProfile)
router.route("/get_user_and_profile").get(getUserAndProfile)
router.route("/update_profile_data").post(updateProfileData)
router.route("/get_all_user_profile").get(getAllUserProfile)
router.route("/user/download_resume").get(downloadProfile)
router.route("/user/sent_connection_request").post(sentConnectionRequest);
router.route("/user/getConnectionRequest").get(getMyConnectionsRequests);
router.route("/user/user_connection_request").get(whatAreMyConncetions)
router.route("/user/accpet_connection_request").post(acceptConnectionRequest);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername)

export default router;