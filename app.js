const express = require("express");
const app = express();
const cors = require("cors");
const wooffer = require("wooffer");
wooffer(process.env.woofferToken, process.env.woofferServiceToken);
app.use(cors());
app.use(express.json());
app.use(wooffer.requestMonitoring);
// import routes
const userRoute = require("./routes/userRoutes");
const taskRoute = require("./routes/taskRoutes");
const repeatTaskRoute = require("./routes/repetedTaskRoute");

// routes

app.use("/api/v1/users", userRoute);
app.use("/api/v1/tasks", taskRoute);
app.use("/api/v1/repeatTasks", repeatTaskRoute);

module.exports = app;
