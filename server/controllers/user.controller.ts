require('dotenv').config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAyncError } from "../middleware/catchAsyncError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs"
import path from "path";
import sendMail from "../utils/sendMail";
import bcrypt from "bcryptjs";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../config/redis"
import { getUserById } from "../services/user.service";
import cloudinary from "cloudinary"

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
  const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, { expiresIn: "5m" })
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
    const newUser: { user: IUser; activationCode: string } = jwt.verify(activation_token, process.env.ACTIVATION_SECRET as string
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

// Login user
interface ILoginRequest {
  email: string,
  password: string
}

export const loginUser = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as ILoginRequest;
    if (!email && !password) {
      return next(new ErrorHandler("Please enter user and password", 400))
    }

    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("User Not Found , Register First ! ", 400))
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid user or password", 400))
    }
    sendToken(user, 200, res)
    res.status(201).json({
      success: true,
      user,
      message: "Login successfully !"
    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})

// logout user 
export const logoutUser = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('access_token', '', { maxAge: 1 })
    res.cookie('refresh_token', '', { maxAge: 1 })
    const userId = req.user?._id || '';

    redis.del(userId)

    res.status(200).json({
      success: true,
      message: "Logged out Successfully !"
    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})

// update access token 
export const updateAccessToken = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refresh_token = req.cookies.refresh_token as string;
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN as string) as JwtPayload
    const message = "Could not refresh token "
    if (!decoded) {
      return next(new ErrorHandler(message, 400))
    }
    const session = await redis.get(decoded.id as string);

    if (!session) {
      return next(new ErrorHandler(message, 400))
    }

    const user = JSON.parse(session)

    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
      expiresIn: "5m"
    })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
      expiresIn: "7d"
    })

    req.user = user;

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(200).json({
      success: true,
      accessToken
    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})

// get user info 
export const getUserInfo = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    await getUserById(userId, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})

interface ISocialAuthBody {
  email: string,
  name: string,
  avatar: string
}

// social auth 
export const socialAuth = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, avatar } = req.body as ISocialAuthBody;
    const user = await userModel.findOne({ email })
    if (!user) {
      const newUser = await userModel.create({ email, name, avatar })
      sendToken(newUser, 200, res)
    }
    else {
      sendToken(user, 200, res)
    }

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
});

// update user info 
interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body as IUpdateUserInfo;
    const userId = req.user?._id
    const user = await userModel.findById(userId)

    if (email && user) {
      const isEmailExit = await userModel.findOne({ email })
      if (isEmailExit) {
        return next(new ErrorHandler("Email already exit", 400))
      }
      user.email = email;
    }
    if (name && user) {
      user.name = name
    }
    await user?.save()

    await redis.set(userId, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user
    })
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))

  }
})

// update user passowrd
interface IUpdatePassword {
  oldPassword: string
  newPassword: string
}

export const updatePassword = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body as IUpdatePassword;

    if (!oldPassword || !newPassword) {
      return next(new ErrorHandler("Please enter Old and new Passowrd ", 400))
    }

    const user = await userModel.findById(req.user?._id).select("+password")

    if (user?.password === undefined) {
      return next(new ErrorHandler("Invalid user", 400))
    }

    const isPasswordMatched = await bcrypt.compare(oldPassword, user?.password)
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid password", 400))
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save()

    redis.set(req.user?._id, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user
    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})


interface IUpdateProfilePicture {
  avatar: string
}

// update profile picture 
export const updateProfilePicture = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body as IUpdateProfilePicture;

    const userId = req.user?._id;
    const user = await userModel.findById(userId)

    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        }

      }
      else {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150
        });
        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        }
      }
    }

    await user?.save()

    await redis.set(userId, JSON.stringify(user))

    res.status(200).json({
      success: true,
      user
    })

  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400))
  }
})
