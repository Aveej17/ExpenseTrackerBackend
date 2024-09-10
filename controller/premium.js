const Expense = require('../model/expenses');
const User = require('../model/users');
const sequelize = require('../util/database');


exports.getLeaderBoardController = async (req, res, next)=>{


    try{
        const leaderBoardOfUsers = await User.findAll({attributes:['id', 'name','totalAmountSpent'], order:[["totalAmountSpent", "DESC"]]});
        // console.log(leaderBoardOfUsers);
        
        res.status(200).json(leaderBoardOfUsers);
    }
    
    catch(err){
        throw new Error(err);
    }

    // try {
    //     const leaderBoardOfUsers = await User.findAll({attributes:['id', 'name', [sequelize.fn('sum', sequelize.col('amount')), 'totalCost']],
    //         include:[
    //             {
    //                 model:Expense,
    //                 attributes:[]
    //             }
    //         ],
    //         group: ['user.id'],
    //         order:[['totalCost', 'DESC']]
    //         }
    //     )
    //     // console.log(leaderBoardOfUsers);
    //     res.status(200).json(leaderBoardOfUsers);
    // }catch(err){
    //     throw new Error(err);
    // }

    // const userAggregatedExpenses = await Expense.findAll({attributes:['userId', [sequelize.fn('sum', sequelize.col('amount')), 'totalCost']], group:['userId'], order:[['totalCost', 'DESC']]});
    // console.log(userAggregatedExpenses);
    // console.log(leaderBoardOfUsers);
    
    
    // // console.log("leaderBoard Gets Called");
    // // console.log(req.body);
    // const expenses = await Expense.findAll();
    // const users = await User.findAll();
    // // console.log(expenses);
    // // console.log(user);

    // const ExpenseMap = new Map();
    // expenses.forEach(element => {
    //     if(ExpenseMap.has(element.userId)){
    //         ExpenseMap.set(element.userId, Number(ExpenseMap.get(element.userId))+Number(element.amount));
    //     }
    //     else{
            
    //         ExpenseMap.set(element.userId, Number(element.amount));
            
    //     }
    // });

    // const userMap = new Map();
    // users.forEach(user =>{
    //     if(ExpenseMap.get(user.id)==undefined){
    //         userMap.set(user.name, 0);
    //     }
    //     else{
    //         userMap.set(user.name, ExpenseMap.get(user.id));
    //     }
        
    // })

    
    // // Convert the Map to an array, sort by value in descending order, and convert it back to a Map
    // const sortedUserMap = new Map([...userMap.entries()].sort((a, b) => b[1] - a[1]));

    // // Print the sorted map
    // // for (const [key, value] of sortedUserMap) {
    // //     console.log(key + " " + value);
    // // }
    // // res.status(200).json(sortedUserMap);
    // // res.send(sortedUserMap);
    // // res.send("ok");

    // // Convert the sorted Map to an object
    // const sortedUserObject = Object.fromEntries(sortedUserMap);

    // // Send the sorted object as a JSON response
   
    // res.send('success');
}