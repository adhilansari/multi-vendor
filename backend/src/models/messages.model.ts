import mongoose, { Schema, Document } from "mongoose";

export interface IImage {
  public_id: string;
  url: string;
}

export interface IMessage extends Document {
  conversationId: string;
  text: string;
  sender: string;
  images: IImage;
  createdAt: Date;
  updatedAt: Date;
}

const messagesSchema: Schema<IMessage> = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
    },
    text: {
      type: String,
    },
    sender: {
      type: String,
    },
    images: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const Messages = mongoose.model<IMessage>("Messages", messagesSchema);

export default Messages;