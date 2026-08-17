const express = require('express')
const router = express.Router()
const utils = require('../utils/utils')
const roleManagementCtr = require('../controllers/roleManagementController')

// * API Role Management Routes
router.get('/:officerId', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    const officerId = req.params.officerId
    roleManagementCtr.getOfficerInfoController(res, officerId)
})

router.post('/', utils.permission(['Collector', 'Analyst']), async (req, res) => {
    roleManagementCtr.createOfficerController(res)
})


module.exports = router