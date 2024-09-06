import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import express from "express";
const router = express.Router();
import { body, validationResult } from "express-validator";

router.get("/", async (_req, res) => {
  try {
    const data = await knex("inventories");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).send(`Error retrieving Inventories: ${err}`);
  }
});

router.post("/", async (req, res) => {
  if (
    !req.body.warehouse_id ||
    !req.body.item_name ||
    !req.body.description ||
    !req.body.category ||
    !req.body.status ||
    (!req.body.quantity && req.body.quantity !== 0)
  ) {
    return res.status(400).json({
      message: "Please provide all values in the request",
    });
  }
  if (typeof req.body.quantity !== "number") {
    return res.status(400).json({
      message: "Please put a number value for quantity",
    });
  }
  try {
    const warehouseCheck = await knex("warehouses").where({
      id: req.body.warehouse_id,
    });
    if (warehouseCheck.length === 0) {
      return res.status(400).json({
        message: "Warehouse ID not found",
      });
    }

    const result = await knex("inventories").insert(req.body);

    const newId = result[0];
    const newStock = await knex("inventories").where({ id: newId });

    res.status(201).json(newStock);
  } catch (err) {
    res.status(500).send(`Unable to create new inventory: ${err}`);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const itemDeleted = await knex("inventories")
      .where({ id: req.params.id })
      .delete();

    if (itemDeleted === 0) {
      return res
        .status(404)
        .json({ message: `Inventory with ID ${req.params.id} not found` });
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({
      message: `Unable to delete inventory: ${err}`,
    });
  }
});

router.put(
  "/:id",
  [
    body("warehouse_id").notEmpty().withMessage("Warehouse ID is required"),
    body("item_name").notEmpty().withMessage("Item name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("status").notEmpty().withMessage("Status is required"),
    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isNumeric()
      .withMessage("Quantity must be a number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { warehouse_id, item_name, description, category, status, quantity } =
      req.body;

    try {
      const inventoryItem = await knex("inventories")
        .where({ id: req.params.id })
        .first();
      if (!inventoryItem) {
        return res.status(404).json({
          message: `Inventory with ID ${req.params.id} not found`,
        });
      }

      const warehouseCheck = await knex("warehouses")
        .where({ id: warehouse_id })
        .first();
      if (!warehouseCheck) {
        return res.status(400).json({
          message: "Warehouse ID not found",
        });
      }

      await knex("inventories").where({ id: req.params.id }).update({
        warehouse_id,
        item_name,
        description,
        category,
        status,
        quantity,
      });

      const updatedItem = await knex("inventories")
        .where({ id: req.params.id })
        .first();
      res.status(200).json(updatedItem);
    } catch (err) {
      res.status(500).send(`Unable to update inventory: ${err}`);
    }
  }
);

export default router;
