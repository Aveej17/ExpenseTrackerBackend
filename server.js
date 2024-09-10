const fs = require('fs');


const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');

const morgan = require('morgan');

const cors = require('cors');
// const routes = require('./routes/routes');
require('dotenv').config();


const app = express();

// const privateKey = fs.readFileSync('server.key');
// const certificate =  fs.readFileSync('server.cert');
//Helmet Secure Connection
app.use(helmet());

app.use(compression());

app.use(morgan('combined'));


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
// DB
const sequelize = require('./util/database');


const User = require('./model/users');
const Expense = require('./model/expenses');
const Order = require('./model/orders');
const Forgotpassword = require('./model/forgotPassword');

const userRoutes = require('./route/user');
const expenseRoutes = require('./route/expense')
const purchaseRoutes = require('./route/purchase');
const premiumRoutes = require('./route/premium');
const resetPasswordRoutes = require('./route/resetPassword');

//cors
app.use(cors());


app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use('/password', resetPasswordRoutes);

// Associations
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

// Automatic table creation if already no table present

sequelize
.sync()
// .sync({force:true})
.then(
    result =>{
        // console.log(result);
        app.listen(process.env.PORT || 3000);
        // https.createServer( {key:privateKey, cert:certificate}, app).listen(process.env.PORT || 3000);
    } 
).catch(err=>{
    console.log(err)
});