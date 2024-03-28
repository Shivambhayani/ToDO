const dotenv = require("dotenv");
const db = require("./utils/database.js");
const user = require("./model/userModel.js");
const cron = require("./utils/corn.js");
dotenv.config({
    path: "./.env",
});

const app = require("./app.js");

const repeatedTasks = require("./model/repetedTaskModel.js");
const taskModel = require("./model/taskModel.js");
//  destroy repeted task user
// repeatedTasks.destroy({
//     where: {},
//     truncate: true,
// });

// taskModel.destroy({
//     where: {},
//     truncate: true,
// });

db.authenticate()
    .then(() => console.log("DB Connection succesfully 🎉😎"))
    .catch((e) => console.log("Error in DB Connection 😌", e));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server listing on ${port}`);
});
