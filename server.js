const dotenv = require('dotenv')

dotenv.config({
    path: './.env'
})

const app = require('./app.js')

//  
// const taskModel = require('./model/taskModel.js')
// const repeatedTasks = require('./model/repetedTaskModel.js')
// taskModel
// repeatedTasks
// const userModel = require('./model/userModel.js')
// userModel




const port = process.env.PORT || 3000




app.listen(port, () => {
    console.log(`Server listing on ${port}`);
})
