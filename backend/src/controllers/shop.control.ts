import  { Request, Response, NextFunction, Router } from "express";
// import path from "path";
import * as jwt from "jsonwebtoken";
import sendMail from "../utils/sendMail";
import Shop, { IShop } from "../models/shop.model";
import { isAuthenticated, isSeller, isAdmin } from "../middleWares/auth.mid";
import  { UploadApiResponse } from "cloudinary";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";
import ErrorHandler from "../utils/errorHandler";
import sendShopToken from "../utils/shopToken";
import * as cloudinary from 'cloudinary'

const router = Router();

// create shop
router.post("/create-shop", catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as { email: string }; // Specify the type of req.body here
      const sellerEmail = await Shop.findOne({ email });
      if (sellerEmail) {
        return next(new ErrorHandler("User already exists", 400));
      }
  
      const myCloud: UploadApiResponse = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
      });
  
      const seller: IShop = {
        name: req.body.name,
        email: email,
        password: req.body.password,
        avatar: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        },
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
        isModified: function (arg0: string | string[] | undefined): boolean {
          throw new Error("Function not implemented.");
        },
        createdAt: new Date(),
        transactions: undefined
      };
  
      const activationToken = createActivationToken(seller);
  
      const activationUrl = `https://eshop-tutorial-pyri.vercel.app/seller/activation/${activationToken}`;
  
      try {
        await sendMail({
          email: seller.email,
          subject: "Activate your Shop",
          message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
        });
        res.status(201).json({
          success: true,
          message: `please check your email:- ${seller.email} to activate your shop!`,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 400));
    }
  }));

// create activation token
const createActivationToken = (seller: IShop) => {
  return jwt.sign(seller.toJSON!(), process.env.ACTIVATION_SECRET!, {
    expiresIn: "5m",
  });
};

// activate user
router.post(
    "/activation",
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { activation_token } = req.body;
  
        const newSeller: IShop = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET!
        ) as unknown as IShop;
  
        if (!newSeller) {
          return next(new ErrorHandler("Invalid token", 400));
        }
        const { name, email, password, avatar, zipCode, address, phoneNumber } = newSeller;
  
        let seller = await Shop.findOne({ email });
  
        if (seller) {
          return next(new ErrorHandler("User already exists", 400));
        }
  
        seller = await Shop.create({
          name,
          email,
          avatar,
          password,
          zipCode,
          address,
          phoneNumber,
        });
  
        sendShopToken(seller, 201, res);
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // login shop
  router.post(
    "/login-shop",
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, password } = req.body;
  
        if (!email || !password) {
          return next(new ErrorHandler("Please provide all fields!", 400));
        }
  
        const user = await Shop.findOne({ email }).select("+password");
  
        if (!user) {
          return next(new ErrorHandler("User doesn't exist!", 400));
        }
  
        const isPasswordValid = await user.comparePassword!(password);
  
        if (!isPasswordValid) {
          return next(
            new ErrorHandler("Please provide the correct information", 400)
          );
        }
  
        sendShopToken(user, 201, res);
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // load shop
  router.get(
    "/getSeller",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const seller = await Shop.findById(req.seller!!._id);
  
        if (!seller) {
          return next(new ErrorHandler("User doesn't exist", 400));
        }
  
        res.status(200).json({
          success: true,
          seller,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
// log out from shop
router.get(
    "/logout",
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.cookie("seller_token", null, {
          expires: new Date(Date.now()),
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.status(201).json({
          success: true,
          message: "Log out successful!",
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // get shop info
  router.get(
    "/get-shop-info/:id",
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const shop = await Shop.findById(req.params.id);
        res.status(201).json({
          success: true,
          shop,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // update shop profile picture
  router.put(
    "/update-shop-avatar",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        let existsSeller = await Shop.findById(req.seller!._id);
  
        const imageId = existsSeller!.avatar!.public_id;
  
        await cloudinary.v2.uploader.destroy(imageId);
  
        const myCloud: UploadApiResponse = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
        });
  
        existsSeller!.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
  
        await existsSeller!.save();
  
        res.status(200).json({
          success: true,
          seller: existsSeller,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // update seller info
  router.put(
    "/update-seller-info",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { name, description, address, phoneNumber, zipCode } = req.body;
  
        const shop = await Shop.findById(req.seller!._id);
  
        if (!shop) {
          return next(new ErrorHandler("User not found", 400));
        }
  
        shop.name = name;
        shop.description = description;
        shop.address = address;
        shop.phoneNumber = phoneNumber;
        shop.zipCode = zipCode;
  
        await shop.save();
  
        res.status(201).json({
          success: true,
          shop,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // all sellers --- for admin
  router.get(
    "/admin-all-sellers",
    isAuthenticated,
    isAdmin("Admin"),
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const sellers = await Shop.find().sort({
          createdAt: -1,
        });
        res.status(201).json({
          success: true,
          sellers,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // delete seller ---admin
  router.delete(
    "/delete-seller/:id",
    isAuthenticated,
    isAdmin("Admin"),
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const seller = await Shop.findById(req.params.id);
  
        if (!seller) {
          return next(
            new ErrorHandler("Seller is not available with this id", 400)
          );
        }
  
        await Shop.findByIdAndDelete(req.params.id);
  
        res.status(201).json({
          success: true,
          message: "Seller deleted successfully!",
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // update seller withdraw methods --- sellers
  router.put(
    "/update-payment-methods",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { withdrawMethod } = req.body;
  
        const seller = await Shop.findByIdAndUpdate(req.seller!._id, {
          withdrawMethod,
        });
  
        res.status(201).json({
          success: true,
          seller,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  // delete seller withdraw methods --- only seller
  router.delete(
    "/delete-withdraw-method/",
    isSeller,
    catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const seller = await Shop.findById(req.seller!._id);
  
        if (!seller) {
          return next(new ErrorHandler("Seller not found with this id", 400));
        }
  
        seller.withdrawMethod = null;
  
        await seller.save();
  
        res.status(201).json({
          success: true,
          seller,
        });
      } catch (error) {
        return next(new ErrorHandler("Internal server error", 500));
      }
    })
  );
  
  export default router;
  
  
