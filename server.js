const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Token = require("./app/models/tokenModel")
const errorMiddleware = require("./app/middlewares/errorMiddleware.js")
const authMiddleware = require("./app/middlewares/errorMiddleware.js")
const userRoutes = require("./app/routes/userRoutes");

const app = express();

app.use(cors({origin: "*"}))
app.use(bodyParser.json());
app.use(helmet.hidePoweredBy({ setTo: "PHP 4.2.0" }));
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use(errorMiddleware);


app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    throw error;
});


app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.code || 500);
    res.send({ error: err.message });
});

mongoose
  .connect(process.env.DB_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
    
     const PORT = process.env.PORT || 8001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  })
  .catch((err) => {
    console.log("Cannot connect to MongoDB\n Error stack:\n" + err);
    process.exit(1);
  });

