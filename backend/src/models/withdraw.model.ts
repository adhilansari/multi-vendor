import mongoose, { Schema, Document } from "mongoose";

export interface ISeller {
  // Define the properties of the seller object if needed.
  // For example: name: string;
}

export interface IWithdraw extends Document {
  seller: ISeller;
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

const withdrawSchema: Schema<IWithdraw> = new Schema<IWithdraw>({
  seller: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
  },
});

const Withdraw = mongoose.model<IWithdraw>("Withdraw", withdrawSchema);

export default Withdraw;