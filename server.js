import express from "express";
import cors from "cors";
import "dotenv/config";
import itemRoutes from "./routes/stock-routes.js";
import warehouseRoutes from "./routes/warehouse-routes.js";

const PORT = process.env.PORT || 8081;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// main route
app.get("/", (req, res) => {
  res.send("Welcome to the InStock API");
});

// all inventory routes
app.use("/api/inventories", itemRoutes);

// all warehouse routes
app.use('/api/warehouses', warehouseRoutes);

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
