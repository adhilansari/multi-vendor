import { Request, Response, NextFunction } from "express";

const errorHandler = (theFunc: Function) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(theFunc(req, res, next)).catch(next);
};

export default errorHandler;