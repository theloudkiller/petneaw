const express = require("express");
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const { postReq } = require('./client/nonseamless/ccavRequestHandler');
const { postRes } = require('./client/nonseamless/ccavResponseHandler');

//dotenv coni
dotenv.config();

//mongodb connection
connectDB();

//rest obejct
const app = express();

const newRoutes = require('./routes/newRoutes');

const cors = require('cors');
app.use(cors());


app.post('/ccavResponseHandler', (req, res) => {
  // Process the response from CCAvenue
  // This could involve parsing the response, checking the payment status, and updating your database

  // Redirect the user to a success/failure page or send a response that your frontend can use to navigate accordingly
});
app.post('/ccavResponseHandler', postRes);

//middlewares
app.use(express.json());
app.use(moragan("dev"));

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));

app.use('/api/v1/new', newRoutes);

//static files
app.use(express.static(path.join(__dirname, "./client/build")));

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

//port
const port = process.env.PORT || 8080;
//listen port
app.listen(port, () => {
  console.log(
    `Server Running in ${process.env.NODE_MODE} Mode on port ${process.env.PORT}`
      .bgCyan.white
  );
});