import express from 'express';
import initKnex from 'knex';
import configuration from '../knexfile.js';
import { addWarehouse } from '../controllers/warehouseController.js'

const router = express.Router();
const knex = initKnex(configuration);

// for list of warehouses
router.get('/', async (_req, res) => {
  try {
    const data = await knex('warehouses');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(`Error retrieving Warehouses: ${error}`);
  }
});

// for specific warehouse information
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const data = await knex.select('*').from('warehouses').where({ id: id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(`Error retrieving specific warehouse: ${error}`);
  }
});

// for create a warehouse
router.post('/warehouses', addWarehouse);

export default router;
