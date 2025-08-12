require('dotenv').config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAyncError } from "../middleware/catchAsyncError";
import Jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs"
import path from "path";
import sendMail from "../utils/sendMail";
import bcrypt from "bcryptjs";
// Register user

interface IRegistrationBody {
  name: string,
  email: string,
  password: string,
  avatar?: string
}

export const RegistrationUser = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, avatar } = req.body as IRegistrationBody;
    const isEmailExist = await userModel.findOne({ email })
    if (isEmailExist) {
      return next(new ErrorHandler("Email already exist", 400))
    }

    const user: IRegistrationBody = {
      name,
      email,
      password
    }

    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;
    // const token = activationToken.token;

    const data = { user: { name: user.name }, activationCode }
    const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        template: "activation-mail.ejs",
        data,
      })
      res.status(201).json({
        suceess: true,
        message: `Please check your email ${user.email} to activate your account !`,
        activationToken: activationToken.token,
      })
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400))
    }

  } catch (error: any) {
    console.log(error)
    return next(new ErrorHandler(error.message, 400))
  }
})

interface IActivationToken {
  token: string,
  activationCode: string
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = Jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" })
  return { token, activationCode }
}

// activate user 
interface IActivationRequest {
  activation_token: string,
  activation_code: string,
}

export const activateUser = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activation_token, activation_code } = req.body as IActivationRequest;
    const newUser: { user: IUser; activationCode: string } = Jwt.verify(activation_token, process.env.ACTIVATION_SECRET as string
    ) as { user: IUser; activationCode: string }

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler("Invalid activation code", 400))
    }
    const { name, email, password } = newUser.user;

    const existUser = await userModel.findOne({ email })
    if (existUser) {
      return next(new ErrorHandler("Email already exist", 400))
    }

    const user = await userModel.create({
      name, email, password: await bcrypt.hash(password, 10)
    })

    res.status(201).json({
      success: true,
      message: "User Created Successfully ! Pleaase login "

    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})