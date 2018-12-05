const nodemailer = require('nodemailer');
const credential = require("./config/local").db.mongo;
const transport = require("./config/local").transportMailer;
const webapp = "https://pickleconnect.senorcoders.com";

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport(transport);
const fs = require("fs");


exports.sendLinkforgotPassword = async function (email, code) {
    try {
        nodemailer.createTestAccount((err, account) => {

            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Locker Room" <messages@lockerroomapp.com>', // sender address
                to: email, // list of receivers
                subject: 'Recover password in Pickle Connect', // Subject line
                text: '', // plain text body
                html: `
                    <h4>To change password click <a href="${webapp}/recovery/${code}">here</a></h4>
                `, // html body
            };

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });
        });
    }
    catch (e) {
        console.error(e);
    }
}