const dotenv = require('dotenv').config()
const fs = require('fs')

const configs = {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    define: {
        freezeTableName: true,
        timestamps: false,
    }
    ,
    dialectOptions: {
        // !! Disable ssl when deploy to cloud run
        // ssl: {
        //     rejectUnauthorized: false,
        //     key: fs.readFileSync(process.env.DB_KEY).toString(),
        //     cert: fs.readFileSync(process.env.DB_CERT).toString(),
        //     ca: fs.readFileSync(process.env.DB_CA).toString(),
        // },
        useUTC: true
    },
    // !! Disable ssl when deploy to cloud run
    // timezone: '+07:00'
}

module.exports.config = configs

