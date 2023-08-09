import mongoose, { Schema, Document } from "mongoose";

export interface IImage {
  public_id: string;
  url: string;
}

export interface IEvent extends Document {
  [x: string]: any;
  name: string;
  description: string;
  category: string;
  start_Date: Date;
  Finish_Date: Date;
  status: string;
  tags?: string;
  originalPrice?: number;
  discountPrice: number;
  stock: number;
  images: IImage[];
  shopId: string;
  shop: object; // You can define the properties of the shop object if needed.
  sold_out?: number;
  createdAt: Date;
}

const eventSchema: Schema<IEvent> = new Schema<IEvent>({
  name: {
    type: String,
    required: [true, "Please enter your event product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your event product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your event product category!"],
  },
  start_Date: {
    type: Date,
    required: true,
  },
  Finish_Date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: "Running",
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your event product price!"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter your event product stock!"],
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  shopId: {
    type: String,
    required: true,
  },
  shop: {
    type: Object,
    required: true,
  },
  sold_out: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Event = mongoose.model<IEvent>("Event", eventSchema);

export default Event;