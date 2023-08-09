import { Request, Response, NextFunction, Router } from "express";
import ErrorHandler  from "../utils/errorHandler";
import catchAsyncErrors from "../middleWares/catchAsyncErrors.mid";
import { isSeller, isAuthenticated } from "../middleWares/auth.mid";
import Conversation, { IConversation } from "../models/conversation.model";

const router = Router();

// create a new conversation
router.post(
  "/create-new-conversation",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { groupTitle, userId, sellerId } = req.body;

      const isConversationExist: IConversation | null = await Conversation.findOne({ groupTitle });

      if (isConversationExist) {
        const conversation: IConversation | null = isConversationExist;
        res.status(201).json({
          success: true,
          conversation,
        });
      } else {
        const conversation: IConversation = await Conversation.create({
          members: [userId, sellerId],
          groupTitle: groupTitle,
        });

        res.status(201).json({
          success: true,
          conversation,
        });
      }
    } catch (error: unknown) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get seller conversations
router.get(
  "/get-all-conversation-seller/:id",
  isSeller,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// get user conversations
router.get(
  "/get-all-conversation-user/:id",
  isAuthenticated,
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversations = await Conversation.find({
        members: {
          $in: [req.params.id],
        },
      }).sort({ updatedAt: -1, createdAt: -1 });

      res.status(201).json({
        success: true,
        conversations,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

// update the last message
router.put(
  "/update-last-message/:id",
  catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { lastMessage, lastMessageId } = req.body;

      const conversation = await Conversation.findByIdAndUpdate(req.params.id, {
        lastMessage,
        lastMessageId,
      });

      res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error: unknown) {
      return next(new ErrorHandler("Internal server error", 500));
    }
  })
);

export default router;
