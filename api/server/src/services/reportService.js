const models = require('../models/index')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * API Report Services
const createReport = async (id) => {
    try {
        const report = await models.reports.create({id : `RP${id}`, latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')})
        return report.get({plant : true})
    } catch (err) {
        throw err
    }
}

const updateReport = async (reportId, reportData) => {
    try {
        reportData['latest_modified'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        const report = await models.reports.update(reportData, {where : {id : reportId}})
        return report[0]
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.createReport = createReport
module.exports.updateReport = updateReport