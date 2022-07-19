import { NextFunction, Request, RequestHandler, Response } from 'express';
import { formatSortString } from '../helpers/functions';
import * as ProductOrders from '../models/productOrders';
import { ErrorHandler } from '../helpers/errors';
import Joi from 'joi';

// validates input
const validateProductOrders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    idProduct: Joi.number().max(255).presence(required),
    idOrder: Joi.number().max(255).presence(required),
    quantity: Joi.number().max(200).presence(required),
    id: Joi.number().optional(), // pour react-admin
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    console.log(errors.message);
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const getAllProductOrders = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sortBy: string = req.query.sort as string;
    const productOrders = await ProductOrders.getAllProductOrders(
      formatSortString(sortBy)
    );

    res.setHeader(
      'Content-Range',
      `products : 0-${productOrders.length}/${productOrders.length + 1}`
    );
    return res.status(200).json(productOrders);
  } catch (err) {
    next(err);
  }
}) as RequestHandler; // Used to avoid eslint error

// route GET by id
const getOneProductOrder = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idProductOrders } = req.params;
    const productOrders = await ProductOrders.getProductOrdersById(
      Number(idProductOrders)
    );
    productOrders ? res.status(200).json(productOrders) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
}) as RequestHandler;

export default {
  getAllProductOrders,
  validateProductOrders,
  getOneProductOrder,
};
