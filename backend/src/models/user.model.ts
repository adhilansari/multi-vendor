import mongoose, { Schema, Document } from "mongoose";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export interface IAddress {
  _id: any;
  country: string;
  city: string;
  address1: string;
  address2: string;
  zipCode: number;
  addressType: string;
}

export interface IUser  {
  _id?: any;
  id?: unknown;
  isModified?(arg0: string): unknown;
  name: string;
  email: string;
  password: string;
  phoneNumber?: number;
  addresses?: IAddress[];
  role?: string;
  avatar?: {
    public_id: string;
    url: string;
  };
  createdAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTime?: Date;

  comparePassword?(enteredPassword: string): Promise<boolean>;
  getJwtToken?(): string;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email!"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },
  phoneNumber: {
    type: Number,
  },
  addresses: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      address1: {
        type: String,
      },
      address2: {
        type: String,
      },
      zipCode: {
        type: Number,
      },
      addressType: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    default: "user",
  },
  // avatar: {
  //   public_id: {
  //     type: String,
  //     required: true,
  //   },
  //   url: {
  //     type: String,
  //     required: true,
  //   },
  // },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
});

// Hash password
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified!("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT token
userSchema.methods.getJwtToken = function (): string {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY!, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// Compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;