const Expense = require('../model/expenses');
const User = require('../model/users');
const isStringValid = require('../util/stringValidation');
const sequelize = require('../util/database');

const AWS = require('aws-sdk');


exports.getExpenses = async (req, res, next) => {
    try {
        if (!req.body.authId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Extract pagination parameters from query
        const page = parseInt(req.query.page) || 1; // default to page 1 if not specified
        const limit = parseInt(req.query.limit) || 10; // default to 10 expenses per page if not specified
        const offset = (page - 1) * limit;

        // Fetch expenses for the user with pagination
        const expenses = await Expense.findAndCountAll({
            where: { userId: req.body.authId },
            limit: limit,
            offset: offset
        });

        const user = await User.findByPk(req.body.authId);

        const customResponse = {
            expenses: expenses.rows, // expenses for the current page
            totalExpenses: expenses.count, // total number of expenses for the user
            currentPage: page,
            totalPages: Math.ceil(expenses.count / limit),
            isPremium: user.isPremiumUser
        };

        res.json(customResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// exports.getExpenses = async (req, res, next) =>{
//     try {
//         // console.log(req.body.authId);
//         // console.log("getEX");
        
        
//         if (!req.body.authId) {
//             return res.status(400).json({ message: 'User ID is required.' });
//         }

//         const expenses = await Expense.findAll({
//             where: { userId: req.body.authId }
//         });
//         const user = await User.findByPk(req.body.authId);

//         const customResponse = {
//             expenses:expenses,
//             isPremium:user.isPremiumUser
//         }
//         // console.log(customResponse);
        

//         res.json(customResponse);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }

exports.createExpense = async (req, res, next) =>{
    const t = await sequelize.transaction();
    try{
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;
        const userId = req.body.authId;

        
        

        if(isStringValid(amount) || isNaN(amount) || isStringValid(description) || isStringValid(category) || isStringValid(userId)){
            return res.status(400).json("Missing parameters ");
        }

        const expense = await Expense.create({
            amount:amount,
            description:description,
            category:category,
            userId:userId},{transaction: t})
            
        const user = await User.findByPk(userId);
        user.totalAmountSpent = Number(user.totalAmountSpent) + Number(amount);
        await user.save({transaction: t});

       
        await t.commit();

        res.status(201).json(
            expense
        )
    }
    catch(err){
        await t.rollback();
        return res.status(500).json({error:err, message:"Something went Wrong", success:false});
    }  
}

// exports.deleteExpenses = async (req, res, next) =>{
//     const t = await sequelize.transaction();

//     try{
//         console.log("Delete Called"); 

//         const expenseId = req.params.id;
        

//         if(isStringValid(expenseId)|| isNaN(expenseId)){
//             return res.status(400).json({message:"Missing parameters ", success:false});
//         }
//         const expense = await Expense.findByPk(expenseId);
//         console.log(expense);
//         if(expense == null){
//             return res.status(404).json({message:"No data found", success: false});
//         }
        
//         await Expense.destroy({
//             where: {
//               id: req.params.id,
//             },
//         }, {transaction: t});

//         console.log(expense);
        
//         const user = await User.findByPk(expense.userId);
//         user.totalAmountSpent = Number(user.totalAmountSpent) - Number(expense.amount);
//         await user.save({transaction: t});

       
//         await t.commit();
//         // res.redirect('/');
//         return res.status(204).json({message:"Deleted Successfully", success:true});
        
//     }
//     catch(err){
//         return res.status(500).json({error:err, message:"Something went wrong", success:false});
//     } 
    
// }

exports.deleteExpenses = async (req, res, next) => {
    const t = await sequelize.transaction(); // Start the transaction

    try {
        // console.log("Delete Called");

        const expenseId = req.params.id;

        // Validate expenseId
        if (isStringValid(expenseId) || isNaN(expenseId)) {
            await t.rollback(); // Rollback transaction if validation fails
            return res.status(400).json({ message: "Missing parameters", success: false });
        }

        // Find the expense by primary key
        const expense = await Expense.findByPk(expenseId, { transaction: t });
        console.log(expense);

        if (expense == null) {
            await t.rollback(); // Rollback transaction if no expense found
            return res.status(404).json({ message: "No data found", success: false });
        }

        // Delete the expense
        await Expense.destroy({
            where: { id: expenseId },
            transaction: t // Pass the transaction object
        });

        // Find the user and update the total amount spent
        const user = await User.findByPk(expense.userId, { transaction: t });
        user.totalAmountSpent = Number(user.totalAmountSpent) - Number(expense.amount);
        await user.save({ transaction: t });

        await t.commit(); // Commit the transaction
        return res.status(204).json({ message: "Deleted Successfully", success: true });
    } catch (err) {
        if (t) await t.rollback(); // Rollback the transaction on error
        return res.status(500).json({ error: err.message, message: "Something went wrong", success: false });
    }
};


exports.editExpenses = async (req, res, next) =>{

}

 async function uploadToS3(data, fileName){

    try{
        let s3bucket = new AWS.S3({
            accessKeyId:process.env.IAM_USER_KEY,
            secretAccessKey:process.env.IAM_USER_SECRET
        });
        
        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body:data,
            ACL:'public-read'
        }
    
        return new Promise((resolve, reject) =>{
            s3bucket.upload(params, (err, s3response)=>{
                if(err){
                    console.log("Somethingwent wrong ", err);
                    reject(err);
                        
                }
                else{
                    // console.log("success ", s3response);      
                        resolve(s3response.Location);  
                    }
            })
        })
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"something went wrong", success:false})
        
    }
    
    
   

}

exports.downloadFile = async (req, res, next) =>{

    try{// console.log(req.body.authId);
        const userId = req.body.authId;
        const expenses = await Expense.findAll({where:{userId:userId} });
        // console.log(expenses);
        const stringyfied = JSON.stringify(expenses);
        const fileName = `Expense${userId}/${new Date()}.txt`;
    
        const fileUrl = await uploadToS3(stringyfied, fileName);
        
        res.status(200).json({fileUrl, success:true})
        // res.send("downloadFileCalled");
        }

    catch(err){
        console.log(err);
        res.status(500).json({message:"something went wrong", success:false})
        
    }
    
}