import connection from '../db-config';
import IProductOrder from '../interfaces/IProductOrder';

const getAllProductOrders = async (sortBy = ''): Promise<IProductOrder[]> => {
  let sql = `SELECT * FROM productorders`;
  if (sortBy) {
    sql += ` ORDER BY ${sortBy}`;
  }
  const results = await connection.promise().query<IProductOrder[]>(sql);
  return results[0];
};

const getProductOrdersById = async (
  idProductOrders: number
): Promise<IProductOrder> => {
  const [results] = await connection
    .promise()
    .query<IProductOrder[]>('SELECT * FROM productorders WHERE id = ?', [
      idProductOrders,
    ]);
  return results[0];
};

export { getAllProductOrders, getProductOrdersById };
