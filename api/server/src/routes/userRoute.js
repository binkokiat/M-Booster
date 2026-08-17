const express = require('express')
const router = express.Router();
const utils = require('../utils/utils')
const userCtr = require('../controllers/userController')

// * API User Routes
router.get('/:userId', utils.permission(['User', 'Collector', 'Analyst']), async (req, res) => {
    const userId = req.params.userId
    userCtr.getUserInfoController(res, userId)
})

router.post('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userInfo = req.body
    userCtr.createUserInfoController(res, officerId, userInfo)
})

router.put('/:userId', utils.permission(['User', 'Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userId = req.params.userId
    const userInfo = req.body
    userCtr.updateUserInfoController(res, userId, userInfo, officerId)
})

router.get('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const officerRole = req.headers.role
    const query = req.query
    userCtr.getUserListController(res, query, officerId, officerRole)
})

router.get('/:userId/fingerprint', utils.permission(['User', 'Collector', 'Analyst']), async (req, res) => {
    const userId = req.params.userId
    userCtr.getUserFingerprintController(res, userId)
})

router.put('/:userId/fingerprint', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userId = req.params.userId
    const fingerprintData = req.body
    userCtr.updateUserFingerprintController(res, userId, fingerprintData, officerId)
})

router.delete('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userId = req.query
    userCtr.deleteUserController(res, userId, officerId)
})

router.get('/status/total', utils.permission(['User', 'Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const officerRole = req.headers.role
    userCtr.getUserStatusTotalController(res, officerId, officerRole)
})

router.post('/send_ai', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userIdList = req.body
    userCtr.sendToAiController(res, userIdList, officerId)
})

router.post('/export_raw', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userIdList = req.body
    userCtr.exportRawDataController(res, userIdList, officerId)
})

router.post('/import_data', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const importData = req.body
    userCtr.importDataController(res, importData, officerId)
})

router.post('/import_report', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const importReport = req.body
    userCtr.importReportController(res, importReport, officerId)
})

router.put('/:userId/fingerprint_angle', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const userId = req.params.userId
    const fingerprintAngleData = req.body
    userCtr.updateUserFingerprintAngleController(res, userId, fingerprintAngleData)
})

router.put('/:userId/side_fingerprint', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const userId = req.params.userId
    const sideFingerprintData = req.body
    userCtr.updateUserSideFingerprintController(res, userId, sideFingerprintData)
})

router.put('/:userId/status', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const userId = req.params.userId
    const userData = req.body
    userCtr.updateUserStatusController(res, userId, userData)
})

router.get('/:userId/report', utils.permission(['User', 'Collector', 'Analyst']), async (req, res) => {
    const userId = req.params.userId
    userCtr.getUserReportController(res, userId)
})

router.post('/send_report', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.headers.id
    const userIdList = req.body
    userCtr.sendUserReportController(res, userIdList, officerId)
})

module.exports = router