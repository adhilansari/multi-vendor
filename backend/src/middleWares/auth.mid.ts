import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";
import * as jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model"; // Assuming you have defined IUser interface for the User model
import Shop, { IShop } from "../models/shop.model"; // Assuming you have defined IShop interface for the Shop model

// Extend the Request interface to include the 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      seller?: IShop;
    }
  }
}

export const isAuthenticated = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as jwt.JwtPayload;

  req.user = await User.findById(decoded.id) as IUser;

  next();
});

export const isSeller = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
  const { seller_token } = req.cookies;
  if (!seller_token) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY!) as jwt.JwtPayload;

  req.seller = await Shop.findById(decoded.id) as IShop;

  next();
});

export const isAdmin = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role!)) {
      return next(new ErrorHandler("Access denied. You are not authorized to access this resource.", 403));
    }
    next();
  };
};
