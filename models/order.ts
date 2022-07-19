import connection from '../db-config';
import IOrder from '../interfaces/IOrder';
import { ResultSetHeader } from 'mysql2';

const getAllOrders = async (sortBy = ''): Promise<IOrder[]> => {
  let sql = `SELECT * FROM orders`;
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  const results = await connection.promise().query<IOrder[]>(sql);
  return results[0];
};

const getOrderById = async (idOrder: number): Promise<IOrder> => {
  const [results] = await connection
    .promise()
    .query<IOrder[]>(`SELECT * FROM orders WHERE id = ?`, [idOrder]);
  return results[0];
};

//route post
const addOrder = async (order: IOrder): Promise<number> => {
  const results = await connection.promise().query<ResultSetHeader>(
    `INSERT INTO orders (idUser,idStatus,idAddress,orderDate,orderTrackingNum) 
      VALUES (?, ?, ?, NOW(), ?)`,
    [
      order.idUser,
      order.idStatus,
      order.idAddress,
      order.orderDate,
      order.orderTrackingNum,
    ]
  );
  return results[0].insertId;
};

// >> --- UPDATE AN ORDER  ---
const updateOrder = async (
  idOrder: number,
  order: IOrder
): Promise<boolean> => {
  let sql = `UPDATE orders SET`;
  const sqlValues: Array<Date | string | number | boolean> = [];
  let oneValue = false;

  if (order.idUser) {
    sql += oneValue ? ', idUser = ? ' : ' idUser = ? ';
    sqlValues.push(order.idUser);
    oneValue = true;
  }
  if (order.idStatus) {
    sql += oneValue ? ', idStatus = ? ' : ' idStatus = ? ';
    sqlValues.push(order.idStatus);
    oneValue = true;
  }
  if (order.idAdress) {
    sql += oneValue ? ', idAddress = ? ' : ' idAddress = ? ';
    sqlValues.push(order.idAddress);
    oneValue = true;
  }
  if (order.orderDate) {
    sql += oneValue ? ', orderDate = ? ' : ' orderDate = ? ';
    sqlValues.push(order.orderDate);
    oneValue = true;
  }
  if (order.orderTrackingNum) {
    sql += oneValue ? ', orderTrackingNum = ? ' : ' orderTrackingNum = ? ';
    sqlValues.push(order.orderTrackingNum);
    oneValue = true;
  }
  sql += ' WHERE id = ?';
  sqlValues.push(idOrder);

  const results = await connection
    .promise()
    .query<ResultSetHeader>(sql, sqlValues);
  return results[0].affectedRows === 1;
};

// >> --- DELETE AN ORDER  ---
const deleteOrder = async (idOrder: number): Promise<boolean> => {
  const results = await connection
    .promise()
    .query<ResultSetHeader>('DELETE FROM orders WHERE id = ?', [idOrder]);
  return results[0].affectedRows === 1;
};

export { getAllOrders, getOrderById, addOrder, updateOrder, deleteOrder };
