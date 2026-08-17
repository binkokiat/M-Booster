const models = require('../models/index')
const utils = require('../utils/utils')
const informationService = require('../services/informationService')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * API Information Controllers
const importInformationController = async (res, importUrl) => {
    try {
        const informations = await informationService.importInformation(importUrl)
        utils.resmsg(res, 'success', 200, '', informations)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getInformationController = async (res, query) => {
    try {
        let informations = {}
        if (utils.isEmpty(query)) {
            informations = await informationService.getInformation()
        } else {
            query.groups =  query.groups.split(',')
            query.filters =  query.filters.split(',')
            informations = await informationService.getInformationOfGroup(query)
        }
        utils.resmsg(res, 'success', 200, '', informations)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const deleteInformationController = async (res, mbCodeList) => {
    try {
        if (mbCodeList.mb_code === undefined)
            throw utils.errmsg('mb_code')
        mbCodeList.mb_code =  mbCodeList.mb_code.split(',')
        const deleted = await informationService.deleteInformation(mbCodeList.mb_code)
        utils.resmsg(res, 'success', 200, '', deleted)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const createInformationController = async (res, informationData) => {
    try { 
        const dupInformation = await informationService.getInformationByMbCodeAndStatus(informationData.mb_code, 'Enabled')
        if (dupInformation.length > 0) 
            throw 'mb_code is duplicated'
        const dupInformationDisabled = await informationService.getInformationByMbCodeAndStatus(informationData.mb_code, 'Disabled')

        let information = {
            mb_code : informationData.mb_code,
            age_range : informationData.age_range || null,
            group : informationData.group,
            status : 'Enabled'
        }
        delete informationData.mb_code
        delete informationData.age_range
        delete informationData.group

        if (dupInformationDisabled.length > 0) {
            for (let key in informationData) {
                if (informationData[key] !== '') {
                    information['type'] = key
                    information['detail'] = informationData[key]
                    delete information.id
                    const informationId = await informationService.getInformationByMbcodeAndType(information.mb_code, information.type)
                    if (informationId) {
                        const updateInformation = await informationService.updateInformation(informationId.id, information)
                        if (!updateInformation)
                            throw `Can't create information`
                    } else {
                        await informationService.createInformation(information)
                    }
                }  
            }
        } else {
            for (let key in informationData) {
                if (informationData[key] !== '') {
                    information['type'] = key
                    information['detail'] = informationData[key]
                    await informationService.createInformation(information)
                }  
            }
        }

        delete information.type
        delete information.detail

        const informationList = await informationService.getInformationByMbCodeAndStatus(information.mb_code, 'Enabled')
        for (let informations of informationList)
        {
            information['id'] = informations.id
            information['mb_code'] = informations.mb_code
            information['age_range'] = informations.age_range
            information[informations.type] = informations.detail
        }
        utils.resmsg(res, 'success', 200, '', information)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const updateInformationController = async (res, informationData) => {
    try {
        const information = await  informationService.getInformationByMbCode(informationData.mb_code)
        if (!utils.latestData(information.information.latest_modified, informationData.latest_modified))
            throw 'Please fetch new data'

        let informations = {
            mb_code : informationData.mb_code,
            age_range : informationData.age_range || null,
            group : informationData.group,
            status : 'Enabled'
        }

        const mbCode = informationData.mb_code

        delete informationData.mb_code
        delete informationData.age_range
        delete informationData.group
        delete informationData.latest_modified

        for (let key in informationData) {
            if (informationData[key] !== '') {
                informations['type'] = key
                informations['detail'] = informationData[key]
                delete informations.id
                const informationId = await informationService.getInformationByMbcodeAndType(mbCode, informations.type)
                if (informationId) {
                    const updateInformation = await informationService.updateInformation(informationId.id, informations)
                    if (!updateInformation)
                        throw `Can't update information`
                } else {
                    await informationService.createInformation(informations)
                }
            }  
        }

        delete informations.type
        delete informations.detail

        const informationList = await informationService.getInformationByMbCodeAndStatus(informations.mb_code, 'Enabled')
        for (let information of informationList)
        {
            informations['id'] = information.id
            informations['mb_code'] = information.mb_code
            informations['age_range'] = information.age_range
            informations[information.type] = information.detail
        }
        utils.resmsg(res, 'success', 200, '', informations)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getInformationByMbCodeController = async (res, mbCode) => {
    try {
        const informations = await informationService.getInformationByMbCode(mbCode)
        utils.resmsg(res, 'success', 200, '', informations)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const exportInformationController = async (res) => {
    try {
        const url = await informationService.exportInformation()
        utils.resmsg(res, 'success', 200, '', {download_url : url})
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

// * Export Controllers
module.exports.importInformationController = importInformationController
module.exports.getInformationController = getInformationController
module.exports.deleteInformationController = deleteInformationController
module.exports.createInformationController = createInformationController
module.exports.updateInformationController = updateInformationController
module.exports.getInformationByMbCodeController = getInformationByMbCodeController
module.exports.exportInformationController = exportInformationController