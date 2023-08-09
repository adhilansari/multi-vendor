import { Response, CookieOptions } from "express";
import { IShop } from "../models/shop.model"; // Assuming you have defined IShop interface for the Shop model

const sendShopToken = (user: IShop, statusCode: number, res: Response) => {
  const token = user.getJwtToken!();

  // Options for cookies
  const options: CookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  };

  res
    .status(statusCode)
    .cookie("seller_token", token, options)
    .json({
      success: true,
      user,
      token,
    });
};

export default sendShopToken;
