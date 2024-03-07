const dotenv = require("dotenv");
const db = require("./utils/database.js");
const { createDailyTask } = require("./controller/repeatTaskController.js");

dotenv.config({
    path: "./.env",
});

const app = require("./app.js");

db.authenticate()
    .then(() => console.log("sync succesfully"))
    .catch((e) => console.log("Error in syncing", e));

//  models
const taskModel = require("./model/taskModel.js");
const repeatedTasks = require("./model/repetedTaskModel.js");
taskModel;
repeatedTasks;
const userModel = require("./model/userModel.js");
userModel;

// const cron = require('node-cron')

// cron.schedule('* * * * * *', () => {
//     createDailyTask()
// });

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listing on ${port}`);
});
