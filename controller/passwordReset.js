const uuid = require('uuid');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // Import Nodemailer
const User = require('../model/users');
const Forgotpassword = require('../model/forgotPassword');
const sequelize = require('../util/database');


// Configure Mailtrap SMTP transporter
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST, // Mailtrap SMTP host
    port: process.env.MAILTRAP_PORT, // Mailtrap SMTP port
    auth: {
        user: process.env.MAILTRAP_USER, // Mailtrap SMTP user
        pass: process.env.MAILTRAP_PASS  // Mailtrap SMTP password
    }
});

const forgotpassword = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        console.log(user);

        if (user) {
            const id = uuid.v4();
            await user.createForgotpassword({ id, active: true ,transaction: t});

            const mailOptions = {
                from: 'ExpenseTracker@gmail.com', // Your sender email address
                to: email, // Recipient email
                subject: 'Password Reset Request',
                html: `<a href="http://44.211.253.232:3000/password/resetpassword/${id}">Reset password</a>`, // HTML body
            };

            // Send the email using Nodemailer with Mailtrap
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    await t.rollback();
                    console.error('Error sending email:', error);
                    return res.status(500).json({ message: 'Failed to send email', success: false });
                }
                await t.commit();
                console.log('Email sent:', info.response);
                return res.status(202).json({ message: 'Link to reset password sent to your mail', success: true });
            });

        } else {
            throw new Error('User does not exist');
        }
    } catch (err) {
        console.error(err);
        return res.json({ message: err.message, success: false });
    }
};

const resetpassword = async (req, res) => {
    const id = req.params.id;
    const forgotpasswordrequest = await Forgotpassword.findOne({ where: { id } });
    if (forgotpasswordrequest) {
        forgotpasswordrequest.update({ active: false });
        res.status(200).send(`<html>
                                <script>
                                    function formsubmitted(e){
                                        e.preventDefault();
                                        console.log('called')
                                    }
                                </script>
                                <form action="/password/updatepassword/${id}" method="get">
                                    <label for="newpassword">Enter New password</label>
                                    <input name="newpassword" type="password" required></input>
                                    <button>reset password</button>
                                </form>
                            </html>`);
    }
};


const updatepassword = (req, res) => {
    // console.log("updatepasswordCalled");
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;
        Forgotpassword.findOne({ where: { id: resetpasswordid } }).then((resetpasswordrequest) => {
            User.findOne({ where: { id: resetpasswordrequest.userId } }).then((user) => {
                if (user) {

                    // Encrypt the password

                    const saltRounds = 10;
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        if (err) {
                            throw new Error(err);
                        }
                        bcrypt.hash(newpassword, salt, async function (err, hash) {
                            if (err) {
                                throw new Error(err);
                            }
                            await user.update({ password: hash })
                            res.status(201).json({message: 'Successfully updated the new password'});
                            
                        });
                    });
                } else {
                    return res.status(404).json({ error: 'No user Exists', success: false });
                }
            });
        });
    } catch (error) {
        return res.status(403).json({ error, success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword,
};
