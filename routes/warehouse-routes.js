import express from 'express';
import initKnex from 'knex';
import configuration from '../knexfile.js';

const router = express.Router();
const knex = initKnex(configuration.development);

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
router.get('/:id');

export default router;
