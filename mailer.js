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
                from: '"Pickle Connect" <messages@lockerroomapp.com>', // sender address
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

exports.shareApp = async function (fullName, email) {
    try {
        nodemailer.createTestAccount((err, account) => {

            // setup email data with unicode symbols
            let mailOptions = {
                from: '"Pickle Connect" <messages@lockerroomapp.com>', // sender address
                to: email, // list of receivers
                subject: 'Inivation to join Pickle Connect', // Subject line
                text: '', // plain text body
                html: `
                    <h2>${fullName} I invite you to join Pickle Connect</h2>
                    <a href="https://play.google.com/store/apps/details?id=com.senorcoders.lockeroom"><img class=“img-fluid” src="cid:unique@googleplay.ee" width="100px" height="auto" alt=“google-play”></a>
                    <a href="https://itunes.apple.com/us/app/locker-room-team-communication/id1407037986?mt=8"><img class=“img-fluid” src="cid:unique@appstore.ee" width="100px" height="auto" alt=“app-store”></a> 
            
                `,
                attachments: [{
                    filename: 'app-store.png',
                    path: './emails_templates/images/app-store.png',
                    cid: 'unique@appstore.ee' //same cid value as in the html img src
                }, {
                    filename: 'google-play.png',
                    path: './emails_templates/images/google-play.png',
                    cid: 'unique@googleplay.ee' //same cid value as in the html img src
                }]
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