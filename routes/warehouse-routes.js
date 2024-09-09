import express from "express";
import initKnex from "knex";
import { body, validationResult } from "express-validator";
import configuration from "../knexfile.js";
import { addWarehouse } from "../controllers/warehouseController.js";

const router = express.Router();
const knex = initKnex(configuration);

// for list of warehouses
router.get("/", async (_req, res) => {
  try {
    const data = await knex("warehouses");
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(`Error retrieving Warehouses: ${error}`);
  }
});

// for specific warehouse information
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await knex.select("*").from("warehouses").where({ id: id });
    if (!data.length) {
      return res.status(404).json({ error: "Warehouse not found" });
    }
    res.status(200).json(data[0]);
  } catch (error) {
    res.status(500).send(`Error retrieving specific warehouse: ${error}`);
  }
});

// for adding a new warehouse
//router.post('/', addWarehouse);
router.post('/', (req, res) => {
  console.log("Received POST request to add warehouse", req.body);
  addWarehouse(req, res);
});

router.put(
  "/:id",
  [
    body("warehouse_name").notEmpty().withMessage("Warehouse name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("contact_name").notEmpty().withMessage("Contact name is required"),
    body("contact_position")
      .notEmpty()
      .withMessage("Contact position is required"),
    body("contact_phone")
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^\+1\s?\(\d{3}\)\s?\d{3}-\d{4}$/)   
      .withMessage("Invalid phone number format"),
    body("contact_email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      warehouse_name,
      address,
      city,
      country,
      contact_name,
      contact_position,
      contact_phone,
      contact_email,
    } = req.body;

    try {
      const warehouseExists = await knex("warehouses").where({ id }).first();
      if (!warehouseExists) {
        return res.status(404).json({ error: "Warehouse not found" });
      }

      await knex("warehouses").where({ id }).update({
        warehouse_name,
        address,
        city,
        country,
        contact_name,
        contact_position,
        contact_phone,
        contact_email,
        updated_at: knex.fn.now(),
      });

      const updatedWarehouse = await knex("warehouses").where({ id }).first();
      return res.status(200).json(updatedWarehouse);

    } catch (error) {
      return res
        .status(500)
        .json({ error: `Error updating warehouse: ${error.message}` });
    }
  }
);

// this request only deletes the warehouse, I'll add the delete inventory to the code after talking to team
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const warehouseExists = await knex("warehouses").where({ id }).first();
    if (!warehouseExists) {
      return res.status(404).json({ error: "Warehouse not found" });
    }

    await knex("warehouses").where({ id }).del();

    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ error: `Error deleting warehouse: ${error.message}` });
  }
});

// for adding a new warehouse
//router.post("/warehouses", addWarehouse);


// 
router.get("/:id/inventories", async (req, res) => {
  const { id } = req.params;
  try {
    // Check if warehouse exists
    const warehouseExists = await knex("warehouses").where({ id }).first();

    if (!warehouseExists) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    // Fetch inventories for the warehouse
    const inventories = await knex("inventories")
      .where({ warehouse_id: id })
      .select('id', 'item_name', 'category', 'status', 'quantity');

    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).send(`Error retrieving inventories for warehouse: ${error}`);
  }
});

export default router;
