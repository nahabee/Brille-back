import { NextFunction, Request, RequestHandler, Response } from 'express';
import { formatSortString } from '../helpers/functions';
import { ErrorHandler } from '../helpers/errors';
import IStatus from '../interfaces/IStatus';
import * as Status from '../models/status';

const getAllStatus = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sortBy: string = req.query.sort as string;
    const users = await Status.getAllStatus(formatSortString(sortBy));

    res.setHeader(
      'Content-Range',
      `users : 0-${users.length}/${users.length + 1}`
    );
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}) as RequestHandler; // Used to avoid eslint error

// get one status
const getOneStatus = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idStatus } = req.params;
    const status = await Status.getStatusById(Number(idStatus));
    status ? res.status(200).json(status) : res.sendStatus(404);
  } catch (err) {
    next(err);
  }
}) as RequestHandler;

// adds a status
const addStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.body as IStatus;
    status.id = await Status.addStatus(status);
    res.status(201).json(status);
  } catch (err) {
    next(err);
  }
};
const statusExists = (async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Récupèrer l'id status de req.params
  const { idStatus } = req.params;
  // Vérifier si un paragraphe existe
  try {
    const statusExists = await Status.getStatusById(Number(idStatus));
    // Si pas de paragraphe => erreur
    if (!statusExists) {
      next(new ErrorHandler(404, `This status does not exist`));
    }
    // Si oui => next()
    else {
      // req.record = paragraph.Exists; // because we need deleted record to be sent after a delete in react-admin
      next();
    }
  } catch (err) {
    next(err);
  }
}) as RequestHandler;

// updates a status
const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idStatus } = req.params;
    const statusUpdated = await Status.updateStatus(
      Number(idStatus),
      req.body as IStatus
    );
    if (statusUpdated) {
      const status = await Status.getStatusById(Number(idStatus));
      res.status(200).send(status); // react-admin needs this response
    } else {
      throw new ErrorHandler(500, `Status cannot be updated`);
    }
  } catch (err) {
    next(err);
  }
};
// >> --- DELETE A STATUS (by ID) ---
const deleteStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { idStatus } = req.params;
    const status = await Status.getStatusById(Number(idStatus));
    const statusDeleted = await Status.deleteStatus(Number(idStatus));
    if (statusDeleted) {
      res.status(200).send(status); // react-admin needs this response
    } else {
      throw new ErrorHandler(500, `This status cannot be deleted`);
    }
  } catch (err) {
    next(err);
  }
};
export default {
  getAllStatus,
  getOneStatus,
  addStatus,
  updateStatus,
  deleteStatus,
  statusExists,
};
