const Razorpay = require('razorpay');
const Order = require('../model/orders');
const User = require('../model/users');
const sequelize = require('../util/database');



exports.purchaseCreateController = async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a new transaction

    try {
        const rzp = new Razorpay({
            key_id: process.env.RZP_KEY_ID,
            key_secret: process.env.RZP_KEY_SECRET,
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                await t.rollback(); // Rollback transaction if error occurs
                return res.status(500).json({ message: "Error creating order", error: err });
            }

            try {
                // Create a new order in your database within the transaction
                await Order.create(
                    { orderId: order.id, status: "Pending", userId: req.body.authId },
                    { transaction: t }
                );

                await t.commit(); // Commit the transaction
                return res.status(201).json({ order, key_id: rzp.key_id });
            } catch (err) {
                await t.rollback(); // Rollback the transaction if an error occurs
                return res.status(500).json({ message: "Error saving order to database", error: err.message });
            }
        });
    } catch (err) {
        if (t) await t.rollback(); // Ensure transaction is rolled back if an error occurs
        return res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};

// exports.purchaseCreateController = (req, res, next)=>{
//     try{
//         var rzp = new Razorpay({
//             key_id: 'rzp_test_QvbON6FIPij43r',
//             key_secret: 'OCK5SyCRNPQaYEHpBliiGxJA',
//         });

//         const amount = 2500;
//         // console.log(amount);
        

//         rzp.orders.create({amount, currency:"INR"}, async (err, order)=>{
//             if(err){
//                 throw new Error(JSON.stringify(err));
//             }
//             try{
//                 // console.log("rzp Order created");
//                 // const user = await User.findByPk(req.body.authId);
//                 // console.log(order);
                
//                 await Order.create({orderId:order.id, status:"Pending", userId:req.body.authId});
//                 return res.status(201).json({order, key_id:rzp.key_id});
//             }catch(err){
//                 throw new Error(err);
//             }
//         })
//     }catch(err){
//         throw new Error(err);
//     }
// }

exports.updatePurchaseController = async (req, res, next) => {
    const t = await sequelize.transaction(); // Start a new transaction

    try {
        // Update order status within the transaction
        await Order.update(
            { paymentId: req.body.payment_id, status: req.body.status },
            { where: { orderId: req.body.order_id }, transaction: t }
        );

        // Update user status within the transaction
        await User.update(
            { isPremiumUser: true },
            { where: { id: req.body.authId }, transaction: t }
        );

        await t.commit(); // Commit the transaction if all operations succeed
        return res.status(201).json({ success: true, message: "Payment status updated" });
    } catch (err) {
        if (t) await t.rollback(); // Rollback the transaction if an error occurs
        return res.status(500).json({ message: "Something went wrong", error: err.message });
    }
};

// exports.updatePurchaseController = async (req, res, next) =>{
//     try{
//         // console.log(req.body);
//         // console.log(req.body.payment_id);
//         await Order.update(
//             { paymentId: req.body.payment_id, status: req.body.status },
//             { where: { orderId: req.body.order_id } }
//         );
//         await User.update({isPremiumUser: true}, {where:{ id:req.body.authId}});
//           return res.status(201).json({success:true, message:"Payment Status updated"});   
//     }
//     catch(err){
//         throw new Error(err);
//     }
// }