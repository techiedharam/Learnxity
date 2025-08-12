import express from "express"
import { activateUser, RegistrationUser } from './../controllers/user.controller';
const userRouter = express.Router()

userRouter.post("/registration", RegistrationUser)
userRouter.post("/activate-user", activateUser)

export default userRouter;