import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `your connection with mongodb has been stablished and working on PORT: ${process.env.PORT}`,
            );
        }),
    )
    .catch((error) => {
        console.log("mongoDB connection error", error);
    });

// import express from "express";
// const app = express()(async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${db_name}`);
//     app.on("error", (error) => {
//       console.log("error", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`you are currently using port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.error("ERROR", error);
//     throw error;
//   }
// })();
