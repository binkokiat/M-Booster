const utils = require('../utils/utils')
const officerService = require('../services/officerService')

// * API Role Management Controllers
const getOfficerInfoController = async (res, officerId) => {
    try {
        const officer = await officerService.getOfficerInfo(officerId)
        utils.resmsg(res, 'success', 200, '', officer)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const createOfficerController = async (res) => {
    try {
        const officer = await officerService.createOfficers()
        utils.resmsg(res, 'success', 200, '', officer)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

// * Export Controllers
module.exports.getOfficerInfoController = getOfficerInfoController
module.exports.createOfficerController = createOfficerController