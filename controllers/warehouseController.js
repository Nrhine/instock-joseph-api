import initKnex from "knex";
import configuration from "../knexfile.js";
import { validateWarehouseData } from "../utils/validation.js";

const knex = initKnex(configuration);

export const addWarehouse = async (req, res) => {
  console.log("Request body:", req.body);
  try {
    const warehouseData = req.body;
    const validationError = validateWarehouseData(warehouseData);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const [newId] = await knex("warehouses").insert(warehouseData);
    const newWarehouse = await knex("warehouses").where({ id: newId }).first();

    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error("Error adding warehouse", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
