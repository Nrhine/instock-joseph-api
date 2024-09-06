import express from "express";
import initKnex from "knex";
import { body, validationResult } from "express-validator";
import configuration from "../knexfile.js";

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
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send(`Error retrieving specific warehouse: ${error}`);
  }
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
      .isMobilePhone("en-US")
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

export default router;
