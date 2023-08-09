import  { Request, Response, NextFunction, Router } from "express";
import { Stripe } from "stripe";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2022-11-15",
});

router.post(
  "/process",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
          company: "multi-vendor",
        },
      });

      res.status(200).json({
        success: true,
        client_secret: myPayment.client_secret,
      });
    } catch (error) {
      next(error);
    }
  })
);

router.get(
  "/stripeapikey",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ stripeApikey: process.env.STRIPE_API_KEY });
    } catch (error) {
      next(error);
    }
  })
);

export default router;