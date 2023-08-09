import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  groupTitle?: string;
  members: string[]; // Array of member IDs or usernames, adjust the type accordingly.
  lastMessage?: string;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema: Schema<IConversation> = new Schema<IConversation>(
  {
    groupTitle: {
      type: String,
    },
    members: {
      type: [String], // Array of member IDs or usernames, adjust the type accordingly.
    },
    lastMessage: {
      type: String,
    },
    lastMessageId: {
      type: String,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);

export default Conversation;