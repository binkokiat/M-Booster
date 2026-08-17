const dotenv = require('dotenv').config()
const nodeMailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')


// * Forgot Password Data Model
const forgotPasswordMailDataModel = async (email, recoveryCode) => {
    let mailData = {
        to : email,
        subject : 'เปลี่ยนรหัสผ่าน รายงานการวิเคราะห์ลายนิ้วมือ (Reset Password)',
        template : 'forgotPassword',
        recovery_code : recoveryCode,
        change_password_url : process.env.NODE_ENV === 'development' ? `https://mind-booster-dev.web.app/change-password/${email}/${recoveryCode}` : `https://mindbooster.icsco.ai/change-password/${email}/${recoveryCode}`
    }
    return mailData
} 


// * Send Report Data Model
const sendReportMailDataModel = async (email, userId, first_name = '', last_name = '', nick_name = '') => {
    let mailData = {
        to : email,
        subject : `รายงานการวิเคราะห์ลายนิ้วมือออนไลน์  ${first_name} ${last_name} (${nick_name}) - ${userId}`,
        template : 'sendReport',
        email : email,
        first_name : first_name,
        last_name : last_name,
        nick_name : nick_name,
        client_id : userId,
        sign_in_url : process.env.NODE_ENV === 'development' ? `https://mind-booster-dev.web.app/sign-in/${email}` : `https://mindbooster.icsco.ai/sign-in/${email}`
    }
    return mailData
} 

// * Send Report Data Model
const sendReportNewPassMailDataModel = async (email, password, userId, first_name = '', last_name = '', nick_name = '') => {
    let mailData = {
        to : email,
        subject : `รายงานการวิเคราะห์ลายนิ้วมือออนไลน์  ${first_name} ${last_name} (${nick_name}) - ${userId}`,
        template : 'sendReportNewPass',
        email : email,
        password : password,
        first_name : first_name,
        last_name : last_name,
        nick_name : nick_name,
        client_id : userId,
        sign_in_url : process.env.NODE_ENV === 'development' ? `https://mind-booster-dev.web.app/sign-in/${email}` : `https://mindbooster.icsco.ai/sign-in/${email}`
    }
    return mailData
} 

// * NodeMailer Settings
const transporter = nodeMailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: 'mindboosterdev@gmail.com',
        pass: 'developer#99x'
    }
})

const options = {
    viewEngine: {
        extName: '.handlebars',
        partialsDir: path.resolve(__dirname, '../views'),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../views'),
    extName: '.handlebars',
}

transporter.use('compile', hbs(options))

// * Send Email
const sendEmails = async (mailData) => {
    try {
        let mailOptions = {
            from: '"Mind Booster" <mindboosterdev@gmail.com>', 
            to: mailData.to, 
            subject: mailData.subject,
            template: mailData.template,
            context: mailData
        }
        transporter.sendMail(mailOptions, (error, info) => {if (error) { throw error }})
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.forgotPasswordMailDataModel = forgotPasswordMailDataModel
module.exports.sendReportMailDataModel = sendReportMailDataModel
module.exports.sendReportNewPassMailDataModel = sendReportNewPassMailDataModel
module.exports.sendEmails = sendEmails