import mongoose from "mongoose";

export function dbConnection() {
    mongoose.connect(process.env.MONGO_URI)
    .then(() =>{
        console.log("DB connected successfully");
    })
    .catch((error) =>{
        console.log("DB failed to connect", error);
    })
}