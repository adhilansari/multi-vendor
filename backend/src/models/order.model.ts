import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
    [x: string]: string;
  // Define the properties of the cart item if needed.
  // For example: productId: string, quantity: number, price: number, etc.
}

export interface IShippingAddress {
  // Define the properties of the shipping address if needed.
  // For example: country: string, city: string, address: string, etc.
}

export interface IUser {
    [x: string]: any;
  // Define the properties of the user object if needed.
  // For example: name: string, email: string, etc.
}

export interface IPaymentInfo {
  id?: string;
  status?: string;
  type?: string;
}

export interface IOrder extends Document {
  cart: ICartItem[];
  shippingAddress: IShippingAddress;
  user: IUser;
  totalPrice: number;
  status: string;
  paymentInfo: IPaymentInfo;
  paidAt?: Date;
  deliveredAt?: Date | number;
  createdAt: Date;
}

const orderSchema: Schema<IOrder> = new Schema<IOrder>({
  cart: {
    type: [Object],
    required: true,
  },
  shippingAddress: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "Processing",
  },
  paymentInfo: {
    id: {
      type: String,
    },
    status: {
      type: String,
    },
    type: {
      type: String,
    },
  },
  paidAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;