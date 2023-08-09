import { CookieOptions, Response } from "express";
import { IUser } from "../models/user.model"; // Assuming you have defined IUser interface for the User model

const sendToken = (user: IUser | any, statusCode: number, res: Response) => {
  const token = user.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options as CookieOptions)
    .json({
      success: true,
      user,
      token,
    });
};

export default sendToken;