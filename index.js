import express from "express";
import {dbConnection} from "./Database/dbConnection.js";
import { bootstrap } from "./src/bootstrap.js";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors"


dotenv.config();
const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    const error = new Error("Not allowed by CORS");
    error.statusCode = 403;
    return callback(error);
  },
}));

const PORT = process.env.PORT || 4000;
app.use("/api/v1/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.get("/", (req, res) => {
    res.send("API is running....");
});


bootstrap(app);
dbConnection()
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});