const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')
const axios = require('axios')
const fs = require('fs')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * Function Check Permissions
module.exports.permission = (role) => {
    return (req, res, next) => {
        const accessRole = req.headers.role
        if (role.includes(accessRole)) {
            next()
        } else {
            resmsg(res, 'failed', 403, 'Unauthorized access to this API', '')
        }
    }
}

// * Function Response Message
const resmsg = (res, status, statusCode, err, result) => {
    res.status(`${statusCode}`).json({
        status : status,
        status_code : statusCode,
        message_error : err.message || err || '',
        result : result || ''
    })
}

// * Function Error Message
const errMessage = (variable = '') => {
    msg = `Cannot read property ${variable} of undefined`
    return msg
}

// * Function Check Empty Object
const isEmpty = (obj) => {
    for (let key in obj) {
        if(obj.hasOwnProperty(key))
            return false
    }
    return true
}

// * Function Check Latest Data
const latestData = (putData, dbData) => {
    const putDataTimestamp = dayjs(putData)
    const dbDataTimestamp = dayjs(dbData)
    const diffTimestamp = dbDataTimestamp.diff(putDataTimestamp)
    if (diffTimestamp >= 0) {
        return true
    } else {
        return false
    }
}

// * Download file
const downloadFile = async (url, pathFile) => {
    try {
        const response = await axios({ url, method: 'GET', responseType: 'stream'})
        response.data.pipe(fs.createWriteStream(`${pathFile}`))
        return new Promise((resolve, reject) => {
            response.data.on('end', () => { resolve() })
            response.data.on('error', () => { reject() })
        })
    } catch (err) {
        throw err
    }
}

// * Is Buddhist Era
const isBuddhistEra = async (dateTime) => {
    try {
        if (dayjs().year() - dayjs(dateTime).year() >= 0) {
            return false
        } else {
            return true
        }
    } catch (err) {
        throw err
    }
}

// * Convert B.E. to A.D.
const convertBuddhistEraToAnnoDomini = async (dateTime) => {
    try {
        if (await isBuddhistEra(dateTime)) {
            return dayjs(dateTime).subtract(543, 'year').format('YYYY-MM-DDT00:00:00')
        } else {
            return dayjs(dateTime).format('YYYY-MM-DDT00:00:00')
        }
    } catch (err) {
        throw err
    }
}

// * Export Utils
module.exports.resmsg = resmsg
module.exports.errmsg = errMessage
module.exports.isEmpty = isEmpty
module.exports.latestData = latestData
module.exports.downloadFile = downloadFile
module.exports.isBuddhistEra = isBuddhistEra
module.exports.convertBuddhistEraToAnnoDomini = convertBuddhistEraToAnnoDomini