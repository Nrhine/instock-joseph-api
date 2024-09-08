import initKnex from "knex";
import configuration from "../knexfile.js";
const knex = initKnex(configuration);
import express from "express";
const router = express.Router();

//for list of inventories
router.get("/", async (_req, res) => {
  try {
    const inventories = await knex("inventories").select(
      "id",
      "item_name",
      "category",
      "status",
      "quantity"
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
      return res.status(404).json({ message: `Inventory with ID ${id} not found` });
    }
    res.status(200).json(inventory);
  } catch (error) {
    res.status(500).json(`Error retrieving inventory: ${error.message}`);
  }
});




router.post("/", async (req, res) => {

    if (!req.body.warehouse_id || !req.body.item_name || !req.body.description || !req.body.category || !req.body.status || (!req.body.quantity && req.body.quantity !== 0)) {
        return res.status(400).json({
          message: "Please provide all values in the request",
        });
    }
    if (typeof req.body.quantity !=="number") {
        return res.status(400).json({
            message: "Please put a number value for quantity",
        });
    }
    try {
        const warehouseCheck = await knex("warehouses").where({ id: req.body.warehouse_id })
        if (warehouseCheck.length === 0) {
            return res.status(400).json({
                message: "Warehouse ID not found"
            })
        }

        const result = await knex("inventories").insert(req.body)

        const newId = result[0]
        const newStock = await knex("inventories").where({ id: newId })

        res.status(201).json(newStock)
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
            message: `Unable to delete inventory: ${err}`
          });
    }
})

export default router;
