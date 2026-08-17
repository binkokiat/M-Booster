const utils = require('../utils/utils')
const userService = require('../services/userService')
const reportService = require('../services/reportService')
const operateService = require('../services/operateService')
const fingerprintService = require('../services/fingerprintService')
const sideFingertService = require('../services/sideFingerService')
const fingerprintAngleService = require('../services/fingerprintAngleService')
const officerService = require('../services/officerService')
const { default: ShortUniqueId } = require('short-unique-id')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

const options = { 
    dictionary: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    length : 9
}
const uuid = new ShortUniqueId(options)

// * API User Controllers
const getUserInfoController = async (res, userId) => {
    try {
        const user = await userService.getUserInfo(userId)
        utils.resmsg(res, 'success', 200, '', user)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const createUserInfoController = async (res, officerId, userInfo) => {
    try {
        if (userInfo.citizen_id !== '') {
            const dupCitizen = await userService.checkCitizenDuplicated(userInfo.citizen_id) 
            if (dupCitizen.found > 0)
                throw 'Citizen ID is duplicated'
        }
        if (userInfo.email !== '') {
            const officer = await officerService.getOfficerByEmail(userInfo.email)
            if (officer)
                throw 'Email is duplicated'
        }
        const id = uuid()
        const report = await reportService.createReport(id)
        const fingerprint = await fingerprintService.createFingerprint(id)
        const sideFinger = await sideFingertService.createSideFinger(fingerprint.id)
        await fingerprintAngleService.createFingerprintAngle(sideFinger)
        let user = await userService.createUserInfo(id, userInfo, fingerprint.id, report.id)
        await operateService.createOperate(user.id, officerId)
        user = await userService.getUserInfo(user.id)
        utils.resmsg(res, 'success', 200, '', user)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const updateUserInfoController = async (res, userId, userInfo, officerId) => {
    try {
        const user = await userService.getUserInfo(userId)
        if (!utils.latestData(user.user_info.latest_modified, userInfo.latest_modified))
            throw 'Please fetch new data'
        if (userInfo.citizen_id !== undefined) {
            if (userInfo.citizen_id !== '') {
                const dupCitizen = await userService.checkCitizenDuplicated(userInfo.citizen_id) 
                if (dupCitizen.found > 0 && dupCitizen.user_info[0].id !== userId)
                    throw 'Citizen ID is duplicated'
            }
        }
        if (userInfo.email !== undefined) {
            if (userInfo.email !== '') {
                const officer = await officerService.getOfficerByEmail(userInfo.email)
                if (officer)
                    throw 'Email is duplicated'
            }
        }
        const upadate = await userService.updateUserInfo(userId, userInfo)
        if (upadate) {
            await operateService.operateUser(userId, officerId)
            const user = await userService.getUserInfo(userId)
            utils.resmsg(res, 'success', 200, '', user)
        } else {
            throw `Can't update user info`
        }
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getUserListController = async (res, query, officerId, officerRole) => {
    try {
        let userList = {}
        if (utils.isEmpty(query)) {
            userList = await userService.getAllUserList()
        } else {
            userList = await userService.geUserList(query, officerId, officerRole)
        }
        utils.resmsg(res, 'success', 200, '', userList)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getUserFingerprintController = async (res, userId) => {
    try {
        const user = await  fingerprintService.getUserFingerprint(userId)
        utils.resmsg(res, 'success', 200, '', user)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const updateUserFingerprintController = async (res, userId, fingerprintData, officerId) => {
    try {
        const userFingerprint = await fingerprintService.getFingerprintByUserId(userId)
        if (!utils.latestData(userFingerprint.latest_modified, fingerprintData.latest_modified))
            throw 'Please fetch new data'
        const upadate = await fingerprintService.updateUserFingerprint(userFingerprint.id, fingerprintData)
        if (!upadate.includes(0)) {
            await  operateService.operateUser(userId, officerId)
            const fingerprint = await fingerprintService.getUserFingerprint(userId)
            utils.resmsg(res, 'success', 200, '', fingerprint)
        } else {
            throw `Can't update user fingerprint`
        }
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const deleteUserController = async (res, userIdList, officerId) => {
    try {
        if (userIdList.user_id === undefined)
            throw utils.errmsg('user_id')
        userIdList.user_id =  userIdList.user_id.split(',')
        const deleted = await userService.deleteUser(userIdList.user_id, officerId)
        utils.resmsg(res, 'success', 200, '', deleted)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getUserStatusTotalController = async (res, officerId, officerRole) => {
    try {
        const userStatusTotal = await userService.getUserStatusTotal(officerId, officerRole)
        utils.resmsg(res, 'success', 200, '', userStatusTotal)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const sendToAiController = async (res, userIdList, officerId) => {
    try {
        const processQueue = await userService.getUserStatusAiProcessing()
        if (processQueue.found > 1)
            throw 'The processing queue is now full'
        const response = await userService.sendToAi(userIdList.user_id, officerId)
        utils.resmsg(res, 'success', 200, '', response)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const exportRawDataController = async (res, userIdList, officerId) => {
    try {
        const url = await userService.exportRawData(userIdList.user_id, officerId)
        utils.resmsg(res, 'success', 200, '', { export_raw_data : userIdList.user_id, download_url : url})
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const importDataController = async (res, importData, officerId) => {
    try {
        const user = await userService.importData(importData.import_url, officerId)
        utils.resmsg(res, 'success', 200, '', user)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const importReportController = async (res, importReport, officerId) => {
    try {
        const reports = await userService.importReport(importReport.import_url, officerId)
        utils.resmsg(res, 'success', 200, '', reports)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const updateUserFingerprintAngleController = async (res, userId, fingerprintAngleData) => {
    try {
        const userFingerprint = await fingerprintService.getFingerprintByUserId(userId)
        const upadate = await fingerprintAngleService.updateUserFingerprintAngle(userFingerprint.id, fingerprintAngleData)
        if (upadate) {
            const fingerprint = await fingerprintService.getUserFingerprint(userId)
            utils.resmsg(res, 'success', 200, '', fingerprint)
        } else {
            throw `Can't update user fingerprint angle`
        }
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const updateUserSideFingerprintController = async (res, userId, sideFingerprintData) => {
    try {
        const userFingerprint = await fingerprintService.getFingerprintByUserId(userId)
        const upadate = await sideFingertService.updateUserSideFingerprint(userFingerprint.id, sideFingerprintData)
        if (upadate) {
            const fingerprint = await fingerprintService.getUserFingerprint(userId)
            utils.resmsg(res, 'success', 200, '', fingerprint)
        } else {
            throw `Can't update user side fingerprint`
        }
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const updateUserStatusController = async (res, userId, userData) => {
    try {
        const upadate = await userService.updateUserInfo(userId, userData)
        if (upadate) {
            const user = await userService.getUserInfo(userId)
            utils.resmsg(res, 'success', 200, '', user)
        } else {
            throw `Can't update user status`
        }
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getUserReportController = async (res, userId) => {
    try {
        const report = await userService.getUserReport(userId)
        utils.resmsg(res, 'success', 200, '', report)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const sendUserReportController = async (res, userIdList, officerId) => {
    try {
        const response = await userService.sendUserReport(userIdList.user_id, officerId)
        utils.resmsg(res, 'success', 200, '', response)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

// * Export Controllers
module.exports.getUserInfoController = getUserInfoController
module.exports.createUserInfoController = createUserInfoController
module.exports.updateUserInfoController = updateUserInfoController
module.exports.getUserListController = getUserListController
module.exports.getUserFingerprintController = getUserFingerprintController
module.exports.updateUserFingerprintController = updateUserFingerprintController
module.exports.deleteUserController = deleteUserController
module.exports.getUserStatusTotalController = getUserStatusTotalController
module.exports.sendToAiController = sendToAiController
module.exports.exportRawDataController = exportRawDataController
module.exports.importDataController = importDataController
module.exports.importReportController = importReportController
module.exports.updateUserFingerprintAngleController = updateUserFingerprintAngleController
module.exports.updateUserSideFingerprintController = updateUserSideFingerprintController
module.exports.updateUserStatusController = updateUserStatusController
module.exports.getUserReportController = getUserReportController
module.exports.sendUserReportController = sendUserReportController
