import express from 'express';

const router = express.Router();

// for list of inventory items
router.route('/');

// for specific item information
router.route('/:id');

export default router;
