import  { Router, Request, Response, NextFunction } from "express";
import Shop, { ITransaction } from "../models/shop.model";
import  ErrorHandler  from "../utils/errorHandler";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";
import { isSeller, isAuthenticated, isAdmin } from "../middleWares/auth.mid";
import Withdraw from "../models/withdraw.model";
import  sendMail  from "../utils/sendMail";
import { IShop } from "../models/shop.model"; // Assuming that you have a defined type IShop for the Shop model
import { IWithdraw } from "../models/withdraw.model"; // Assuming that you have a defined type IWithdraw for the Withdraw model

const router = Router();

// create withdraw request --- only for seller
router.post(
  "/create-withdraw-request",
  isSeller,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount } = req.body;

      const data = {
        seller: req.seller,
        amount,
      };

      try {
        await sendMail({
          email: req.seller!.email,
          subject: "Withdraw Request",
          message: `Hello ${req.seller!.name}, Your withdraw request of ${amount}$ is processing. It will take 3 to 7 days for processing! `,
        });
        res.status(201).json({
          success: true,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }

      const withdraw: IWithdraw = await Withdraw.create(data);

      const shop: IShop | null = await Shop.findById(req.seller!._id);

      if (!shop) {
        throw new ErrorHandler("Shop not found", 404);
      }

      shop.availableBalance = shop.availableBalance! - amount;

      await shop.save!();

      res.status(201).json({
        success: true,
        withdraw,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get all withdraws --- admin
router.get(
  "/get-all-withdraw-request",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const withdraws: IWithdraw[] = await Withdraw.find().sort({
        createdAt: -1,
      });

      res.status(201).json({
        success: true,
        withdraws,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// update withdraw request ---- admin
router.put(
    "/update-withdraw-request/:id",
    isAuthenticated,
    isAdmin("Admin"),
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { sellerId } = req.body;
  
        const withdraw: IWithdraw | null = await Withdraw.findByIdAndUpdate(
          req.params.id,
          {
            status: "succeed",
            updatedAt: Date.now(),
          },
          { new: true }
        );
  
        if (!withdraw) {
          throw new ErrorHandler("Withdraw not found", 404);
        }
  
        const seller: IShop | null = await Shop.findById(sellerId);
  
        if (!seller) {
          throw new ErrorHandler("Seller not found", 404);
        }
  
        const transaction: ITransaction = {
            _id: withdraw._id,
            amount: withdraw.amount,
            updatedAt: withdraw.updatedAt,
            status: withdraw.status,
            createdAt: new Date()
        };
  
        seller.transactions = [...(seller.transactions ?? []), transaction];
  
        await seller.save!();
  
        try {
          await sendMail({
            email: seller.email,
            subject: "Payment confirmation",
            message: `Hello ${seller.name}, Your withdraw request of ${withdraw.amount}$ is on the way. Delivery time depends on your bank's rules, usually takes 3 to 7 days.`,
          });
        } catch (error) {
          return next(new ErrorHandler("Internal server error", 500));
        }
        res.status(201).json({
          success: true,
          withdraw,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );

export default router;
