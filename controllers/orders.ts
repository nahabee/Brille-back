import { NextFunction, Request, RequestHandler, Response } from 'express';
import { formatSortString } from '../helpers/functions';
import IOrder from '../interfaces/IOrder';
import * as Order from '../models/order';
import { ErrorHandler } from '../helpers/errors';
import Joi from 'joi';

const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    orderDate: Joi.date().optional(),
    orderTrackingNum: Joi.number().optional(),
    idAddress: Joi.number().optional().allow(null),
    idStatus: Joi.number().optional().allow(null),
    idUser: Joi.number().optional().allow(null),
    id: Joi.number().optional(), // pour react-admin
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    console.log(errors.message);
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

const getAllOrders = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sortBy: string = req.query.sort as string;
    const orders = await Order.getAllOrders(formatSortString(sortBy));

    res.setHeader(
      'Content-Range',
      `orders : 0-${orders.length}/${orders.length + 1}`
    );
    return res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
}) as RequestHandler; // Used to avoid eslint error

const getOneOrder = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idOrder } = req.params;
    const order = await Order.getOrderById(Number(idOrder));
    order ? res.status(200).json(order) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
}) as RequestHandler;

const addOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idOrder = await Order.addOrder(req.body as IOrder);
    if (idOrder) {
      res.status(201).json({ id: idOrder, ...req.body });
    } else {
      throw new ErrorHandler(500, `Order cannot be created`);
    }
  } catch (err) {
    next(err);
  }
};

const orderExists = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { idOrder } = req.params;
  try {
    const orderExists = await Order.getOrderById(Number(idOrder));
    if (!orderExists) {
      next(new ErrorHandler(404, `This order does not exist`));
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
}) as RequestHandler;

const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrder } = req.params;
    const orderUpdated = await Order.updateOrder(
      Number(idOrder),
      req.body as IOrder
    );
    if (orderUpdated) {
      const order = await Order.getOrderById(Number(idOrder));
      res.status(200).send(order); // react-admin needs this response
    } else {
      throw new ErrorHandler(500, `Order cannot be updated`);
    }
  } catch (err) {
    next(err);
  }
};
const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrder } = req.params;
    const order = await Order.getOrderById(Number(idOrder));
    const orderDeleted = await Order.deleteOrder(Number(idOrder));
    if (orderDeleted) {
      res.status(200).send(order); // react-admin needs this response
    } else {
      throw new ErrorHandler(500, `This order cannot be deleted`);
    }
  } catch (err) {
    next(err);
  }
};

export default {
  getAllOrders,
  getOneOrder,
  addOrder,
  validateOrder,
  updateOrder,
  orderExists,
  deleteOrder,
};
