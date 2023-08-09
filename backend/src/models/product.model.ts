import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user.model";

export interface IProductImage {
  public_id: string;
  url: string;
}

export interface IReview {
  user: IUser; // You can define the properties of the user object if needed.
  rating: number;
  comment: string;
  productId: string;
  createdAt: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  tags?: string;
  originalPrice?: number;
  discountPrice: number;
  stock: number;
  images: IProductImage[];
  reviews: IReview[];
  ratings?: number;
  shopId: string;
  shop: object; // You can define the properties of the shop object if needed.
  sold_out?: number;
  createdAt: Date;
}

const productSchema: Schema<IProduct> = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, "Please enter your product name!"],
  },
  description: {
    type: String,
    required: [true, "Please enter your product description!"],
  },
  category: {
    type: String,
    required: [true, "Please enter your product category!"],
  },
  tags: {
    type: String,
  },
  originalPrice: {
    type: Number,
  },
  discountPrice: {
    type: Number,
    required: [true, "Please enter your product price!"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter your product stock!"],
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
  reviews: [
    {
      user: {
        type: Object,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      productId: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  ratings: {
    type: Number,
  },
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

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;