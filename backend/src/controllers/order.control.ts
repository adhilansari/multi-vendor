import  { Request, Response, NextFunction, Router } from "express";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";
import { isAuthenticated, isSeller, isAdmin } from "../middleWares/auth.mid";
import Order, { IOrder, ICartItem } from "../models/order.model";
import Shop from "../models/shop.model";
import Product from "../models/product.model";

const router = Router();

// create new order
router.post(
  "/create-order",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;

      //   group cart items by shopId
      const shopItemsMap = new Map<string, ICartItem[]>();

      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) {
          shopItemsMap.set(shopId, []);
        }
        shopItemsMap.get(shopId)?.push(item);
      }

      // create an order for each shop
      const orders: IOrder[] = [];

      for (const [shopId, items] of shopItemsMap) {
        const order = await Order.create({
          cart: items,
          shippingAddress,
          user,
          totalPrice,
          paymentInfo,
        });
        orders.push(order);
      }

      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get all orders of user
router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await Order.find({ "user._id": req.params.userId }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get all orders of seller
router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await Order.find({
        "cart.shopId": req.params.shopId,
      }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// update order status for seller
router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      if (req.body.status === "Transferred to delivery partner") {
        order.cart.forEach(async (o: ICartItem) => {
          await updateOrder(o._id, parseInt(o.qty));
        });
      }

      order.status = req.body.status;

      if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
        order.paymentInfo.status = "Succeeded";
        const serviceCharge = order.totalPrice * 0.10;
        await updateSellerInfo(order.totalPrice - serviceCharge);
      }

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
      });

      async function updateOrder(id: string, qty: number) {
        const product = await Product.findById(id);

        if (product) {
          product.stock -= qty;
          product.sold_out! += qty;

          await product.save({ validateBeforeSave: false });
        }
      }

      async function updateSellerInfo(amount: number) {
        const seller = await Shop.findById(req.seller!._id);

        if (seller) {
          seller.availableBalance = amount;

          await seller.save();
        }
      }
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// give a refund ----- user
router.put(
  "/order-refund/:id",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
        order,
        message: "Order Refund Request successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// accept the refund ---- seller
router.put(
  "/order-refund-success/:id",
  isSeller,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }

      order.status = req.body.status;

      await order.save();

      res.status(200).json({
        success: true,
        message: "Order Refund successful!",
      });

      if (req.body.status === "Refund Success") {
        order.cart.forEach(async (o: ICartItem) => {
          await updateOrder(o._id, parseInt(o.qty));
        });
      }

      async function updateOrder(id: string, qty: number) {
        const product = await Product.findById(id);

        if (product) {
          product.stock += qty;
          product.sold_out! -= qty;

          await product.save({ validateBeforeSave: false });
        }
      }
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// all orders --- for admin
router.get(
  "/admin-all-orders",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await Order.find().sort({
        deliveredAt: -1,
        createdAt: -1,
      });
      res.status(201).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

export default router;
