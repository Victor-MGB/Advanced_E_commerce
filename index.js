import express from "express";
import {dbConnection} from "./Database/dbConnection.js";
import { bootstrap } from "./src/bootstrap.js";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors"


dotenv.config();
const app = express();
app.use(cors())

const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(morgan("dev"));
app.get("/", (req, res) => {
    res.send("API is running....");
});

bootstrap(app);
dbConnection()
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});