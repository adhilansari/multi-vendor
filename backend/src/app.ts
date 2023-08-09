import * as express from "express";
import  { Request, Response, NextFunction } from "express";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as cors from "cors";

const app = express();

app.use(
  cors({
    // origin: ["https://eshop-tutorial-pyri.vercel.app"],
    origin: ["*"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/test", (req: Request, res: Response) => {
  res.send("Hello world!");
});

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: "config/.env",
  });
}

// import routes
import user from "./controllers/user.control";
import shop from "./controllers/shop.control";
import product from "./controllers/product.control";
import event from "./controllers/event.control";
import coupon from "./controllers/coupenCode.control";
import payment from "./controllers/payment.control";
import order from "./controllers/order.control";
import conversation from "./controllers/conversation.control";
import message from "./controllers/message.control";
import withdraw from "./controllers/withdraw.control";

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ success: false, message: "Unauthorized" });
  } else {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.use("/api/v1/user", user);
app.use("/api/v1/conversation", conversation);
app.use("/api/v1/message", message);
app.use("/api/v1/order", order);
app.use("/api/v1/shop", shop);
app.use("/api/v1/product", product);
app.use("/api/v1/event", event);
app.use("/api/v1/coupon", coupon);
app.use("/api/v1/payment", payment);
app.use("/api/v1/withdraw", withdraw);



export default app;
