import { authorizeRoles, isAuthenticated } from './../middleware/auth';
import express from "express"
import { activateUser, getUserInfo, loginUser, logoutUser, RegistrationUser, socialAuth, updateAccessToken, updatePassword, updateProfilePicture, updateUserInfo } from './../controllers/user.controller';
const userRouter = express.Router()

userRouter.post("/registration", RegistrationUser)
userRouter.post("/activate-user", activateUser)
userRouter.post("/login", loginUser)
userRouter.get("/logout", isAuthenticated, logoutUser)

userRouter.get("/refresh", updateAccessToken)

userRouter.get("/me", isAuthenticated, getUserInfo)

userRouter.post("/social-auth", socialAuth)

userRouter.put("/update-user-info", isAuthenticated, updateUserInfo)

userRouter.put("/update-user-password", isAuthenticated, updatePassword)

userRouter.put("/update-user-avatar", isAuthenticated, updateProfilePicture)

export default userRouter;