import mongoose, { Schema, Document } from "mongoose";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export interface ITransaction {
  amount: number;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  _id: any;
}

export interface IShop  {
  isModified(arg0: string): unknown;
  _id?: string;
  name: string;
  email: string;
  password: string;
  description?: string;
  address: string;
  phoneNumber: number;
  role?: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  zipCode: number;
  withdrawMethod?: object | null | undefined;
  availableBalance?: number;
  transactions: ITransaction[] | undefined;
  createdAt: Date;
  resetPasswordToken?: string;
  resetPasswordTime?: Date;
  toJSON?: () => Partial<IShop>;
  save?(): Promise<IShop>;

  comparePassword?(enteredPassword: string): Promise<boolean>;
  getJwtToken?(): string;
}

const shopSchema: Schema<IShop> = new Schema<IShop>({
  name: {
    type: String,
    required: [true, "Please enter your shop name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your shop email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  description: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    default: "Seller",
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  zipCode: {
    type: Number,
    required: true,
  },
  withdrawMethod: {
    type: Object,
  },
  availableBalance: {
    type: Number,
    default: 0,
  },
  transactions: [
    {
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
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
shopSchema.pre<IShop>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
shopSchema.methods.getJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Compare password
shopSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Shop = mongoose.model<IShop>("Shop", shopSchema);

export default Shop;