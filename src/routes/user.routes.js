import {Router}  from "express";
import { loginUser, registerUser ,logoutUser ,refreshAccessToken} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

// router.route("/register").post(
//     upload.fields([
//         {
//             name : "avatar",
//             maxCount : 1
//         },
//         {
//             name : "coverImage",
//             maxCount : 1
//         }
//     ]),
//     registerUser
// )

router.route("/register").post(
  (req, res, next) => {
    console.log("Before multer");
    next();
  },
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
  ]),
  (req, res, next) => {
    console.log("After multer, files:", req.files);
    next();
  },
  registerUser
);

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh_token").post(refreshAccessToken)


export default router