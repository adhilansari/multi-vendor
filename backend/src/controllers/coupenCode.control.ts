import  { Request, Response, NextFunction, Router } from "express";
import  catchAsyncErrors  from "../middleWares/catchAsyncErrors.mid";
import { Document } from "mongoose";
import  ErrorHandler  from "../utils/errorHandler";
import { isSeller } from "../middleWares/auth.mid";
import CouponCode, { ICouponCode } from "../models/couponCode";
const router = Router();

// create coupon code
router.post(
  "/create-coupon-code",
  isSeller,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, userId, sellerId } = req.body;

      let couponCode: Document<ICouponCode>;

      const isCouponCodeExists: Document<ICouponCode>[] = await CouponCode.find({
        name,
      });

      if (isCouponCodeExists.length !== 0) {
        return next(new ErrorHandler("Coupon code already exists!", 400));
      }

      couponCode = await CouponCode.create({
        name,
        userId,
        sellerId,
      });

      res.status(201).json({
        success: true,
        couponCode,
      });
    } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get all coupons of a shop
router.get(
    "/get-coupon/:id",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const couponCodes: Document<ICouponCode>[] = await CouponCode.find({ shopId: req.seller?._id });
        res.status(201).json({
          success: true,
          couponCodes,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 400));
      }
    })
  );
  
  // delete coupon code of a shop
  router.delete(
    "/delete-coupon/:id",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const couponCode: Document<ICouponCode> | null = await CouponCode.findByIdAndDelete(req.params.id);
  
        if (!couponCode) {
          return next(new ErrorHandler("Coupon code doesn't exist!", 400));
        }
        res.status(201).json({
          success: true,
          message: "Coupon code deleted successfully!",
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 400));
      }
    })
  );
  
  // get coupon code value by its name
  router.get(
    "/get-coupon-value/:name",
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const couponCode: Document<ICouponCode> | null = await CouponCode.findOne({ name: req.params.name });
  
        res.status(200).json({
          success: true,
          couponCode,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 400));
      }
    })
  );

export default router;
