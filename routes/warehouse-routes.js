import express from 'express';

const router = express.Router();

// for list of warehouses
router.route('/');

// for specific warehouse information
router.route('/:id');

export default router;
