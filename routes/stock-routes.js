import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import express from "express";
const router = express.Router();
import { body, validationResult } from "express-validator";

//for list of inventories
router.get("/", async (_req, res) => {
    try {
    const inventories = await knex("inventories")
      .join("warehouses", "warehouses.id", "inventories.warehouse_id")
      .select(
        "inventories.id",
        "inventories.item_name",
        "inventories.category",
        "inventories.status",
        "inventories.quantity",
        "inventories.description",
        "warehouses.warehouse_name"
      );
    if (inventories.length === 0) {
      return res.status(404).json({ message: "No inventories found" });
    }
    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).send(`Error retrieving inventories: ${error.message}`);
  }
});

//single inventory item
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [inventory] = await knex("inventories").where({ id: id });
    if (!inventory) {
      return res
        .status(404)
        .json({ message: `Inventory with ID ${id} not found` });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json(`Error retrieving inventory: ${error.message}`);
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

// Delete Inventory
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

// Edit Inventory
const getInventoryById = async (id) => {
    return await knex('inventories').where({ id }).first();
};

const validateInventoryData = (data) => {
    const { item_name, description, category, status, quantity } = data;
    if (!item_name || !description || !category || !status || quantity === undefined) {
        return 'Missing required fields';
    }
    return null;
};

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const inventoryData = req.body;
        const validationError = validateInventoryData(inventoryData);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        const existingInventory = await getInventoryById(id);
        if (!existingInventory) {
            return res.status(404).json({ error: 'Inventory item not found' });
        }
        await knex('inventories')
            .where({ id })
            .update({
                ...inventoryData,
                updated_at: knex.fn.now()
            });
        const updatedInventory = await getInventoryById(id);
        res.json(updatedInventory);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
