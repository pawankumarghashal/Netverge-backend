import { Router } from "express";
import multer from "multer";
 import { activeCheck, comment, createPost, deleteComment, deletePost, get_comments, getAllPosts, increment_likes } from "../controllers/posts.controller.js";

const router = Router();

router.route("/home").get(activeCheck)

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,"uploads/")
    },
    filename:(req,file,cb)=>{
       cb(null,file.originalname)
    }

})

const upload =multer({storage:storage})

router.route("/post").post(upload.single('media'),createPost)
router.route("/posts").get(getAllPosts)
router.route("/delete_post").delete(deletePost)
router.route("/comment").post(comment)
router.route("/get_comments").get(get_comments)
router.route("/delete_commnet").delete(deleteComment)
router.route("/increment_likes").post(increment_likes)


export default router;


