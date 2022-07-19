import { NextFunction, Request, RequestHandler, Response } from 'express';
import { formatSortString } from '../helpers/functions';
import * as Order from '../models/order';
import IOrder from '../interfaces/IOrder';
import { ErrorHandler } from '../helpers/errors';
import Joi from 'joi';

// validates input
const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  let required: Joi.PresenceMode = 'optional';
  if (req.method === 'POST') {
    required = 'required';
  }
  const errors = Joi.object({
    idUser: Joi.number().allow(null).presence(required),
    idStatus: Joi.number().allow(null).presence(required),
    idAdress: Joi.number().optional(),
    orderDate: Joi.date().optional(),
    orderTrackingNum: Joi.number().allow(null).presence(required),
    id: Joi.number().optional(), // pour react-admin
  }).validate(req.body, { abortEarly: false }).error;
  if (errors) {
    console.log(errors.message);
    next(new ErrorHandler(422, errors.message));
  } else {
    next();
  }
};

// route get all orders
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

// route get by Id
const getOrderById = (async (
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

// add an order
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
  // Récupèrer l'id order de req.params
  const { idOrder } = req.params;
  // Vérifier si un order existe
  try {
    const orderExists = await Order.getOrderById(Number(idOrder));
    // Si pas d'order => erreur
    if (!orderExists) {
      next(new ErrorHandler(404, `This order does not exist`));
    }
    // Si oui => next()
    else {
      // req.record = order.Exists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  } catch (err) {
    next(err);
  }
}) as RequestHandler;

// ! 2nd step : update the order darling
const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrder } = req.params;
    const OrderUpdated = await Order.updateOrder(
      Number(idOrder),
      req.body as IOrder
    );
    if (OrderUpdated) {
      const order = await Order.getOrderById(Number(idOrder));
      res.status(200).send(order); // react-admin needs this response
    } else {
      throw new ErrorHandler(500, `Order cannot be updated`);
    }
  } catch (err) {
    next(err);
  }
};

// >> --- DELETE AN ORDER (by ID) ---
const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupèrer l'id de l'Order avec req.params
    const { idOrder } = req.params;
    // Vérifie if this order exists
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
  getOrderById,
  addOrder,
  validateOrder,
  orderExists,
  updateOrder,
  deleteOrder,
};
