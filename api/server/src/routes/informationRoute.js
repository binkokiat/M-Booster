const express = require('express')
const router = express.Router();
const utils = require('../utils/utils')
const informationCtr = require('../controllers/informationController')

// * API Information Routes
router.post('/import_data', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const importData = req.body
    informationCtr.importInformationController(res, importData.import_url)
})

router.get('/', utils.permission(['User', 'Collector', 'Analyst']), async (req, res) => {
    const query = req.query
    informationCtr.getInformationController(res, query)
})

router.delete('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const mbCode = req.query
    informationCtr.deleteInformationController(res, mbCode)
})

router.post('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const informationData = req.body
    informationCtr.createInformationController(res, informationData)
})

router.put('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const informationData = req.body
    informationCtr.updateInformationController(res, informationData)
})

router.get('/:mb_code', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const mbCode = req.params.mb_code
    informationCtr.getInformationByMbCodeController(res, mbCode)
})

router.post('/export_data', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    informationCtr.exportInformationController(res)
})


module.exports = router