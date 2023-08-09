import  { Request, Response, NextFunction, Router } from "express";
import * as cloudinary from "cloudinary";
import Messages, { IMessage } from "../models/messages.model";
import ErrorHandler from "../utils/errorHandler";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";
const router = Router();

// create new message
router.post(
  "/create-new-message",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messageData = req.body;

      if (req.body.images) {
        const myCloud = await cloudinary.v2.uploader.upload(req.body.images, {
          folder: "messages",
        });
        messageData.images = {
          public_id: myCloud.public_id,
          url: myCloud.url,
        };
      }

      messageData.conversationId = req.body.conversationId;
      messageData.sender = req.body.sender;
      messageData.text = req.body.text;

      const message: IMessage = new Messages({
        conversationId: messageData.conversationId,
        text: messageData.text,
        sender: messageData.sender,
        images: messageData.images ? messageData.images : undefined,
      });

      await message.save();

      res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get all messages with conversation id
router.get(
  "/get-all-messages/:id",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const messages: IMessage[] = await Messages.find({
        conversationId: req.params.id,
      });

      res.status(201).json({
        success: true,
        messages,
      });
    } catch (error) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

export default router;
