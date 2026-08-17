const models = require('../models/index')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const tmp = require('tmp-promise')
const rimraf = require('rimraf')
const uuid = require('uuid4')
const readXlsxFile = require('read-excel-file/node')
const { Op, Sequelize, sequelize, where} = require('sequelize')
const utils = require('../utils/utils')
const ExcelJS = require('exceljs')
const { Storage } = require('@google-cloud/storage')

// * Google Cloud Storage
const gcs = new Storage()
const bucket = gcs.bucket(process.env.GCS_BUCKET)

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * Information model
const informationModel = (data = '') => {
    const information = {
        information_id : data.id || '',
        mb_code : data.mb_code || '',
        group : data.group || '',
        type : data.type || '',
        detail : data.detail || '',
        status : data.status || 'Enabled',
        last_modify_time : data.latest_modified.replace(' ', 'T') || ''
    }
    return information
}

// * API Information Services
const createInformation = async (informationData) => {
    try {
        informationData['id'] = uuid()
        informationData['latest_modified'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        const information = await models.informations.create(informationData)
        return information.get({plant : true})
    } catch (err) {
        throw err
    }
}

const updateInformation = async (informationId, informationData) => {
    try {
        informationData['latest_modified'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        const information = await models.informations.update(informationData, {where : {id : informationId}})
        return information[0]
    } catch (err) {
        throw err
    }
}

const importInformation = async (importUrl) => {
    try {
        let importList = []
        let notImportList = []
        const tmpobj = tmp.dirSync()
        const pathFile = `${tmpobj.name}/information.xlsx`
        await utils.downloadFile(importUrl, pathFile)
        const workbook = new ExcelJS.Workbook()
        const workbookData = await workbook.xlsx.readFile(`${pathFile}`)
        const worksheet = workbookData.getWorksheet('Import Report Information')
        let informationDataList = []
        let idxMbCode = null
        let idxAgeRange = null
        let idxGroup = null
        let idxType = null
        let idxDetail = null
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            let information = {}
            if(rowNumber === 1) {
                idxMbCode = row.values.indexOf('mb_code') !== -1 ? row.values.indexOf('mb_code') : null
                idxAgeRange = row.values.indexOf('age_range') !== -1 ? row.values.indexOf('age_range') : null
                idxGroup = row.values.indexOf('group') !== -1 ? row.values.indexOf('group') : null
                idxType = row.values.indexOf('type') !== -1 ? row.values.indexOf('type') : null
                idxDetail = row.values.indexOf('detail') !== -1 ? row.values.indexOf('detail') : null
            } else {
                if (idxMbCode) {
                    if (row.values[idxMbCode] !== '') {
                        if (typeof(row.values[idxMbCode]) !== 'object')
                        {
                            information['mb_code'] = row.values[idxMbCode]
                        } else {
                            information['mb_code'] = row.values[idxMbCode].text
                        }
                    }
                }
                if (idxAgeRange) {
                    if (row.values[idxAgeRange] !== '') {
                        if (typeof(row.values[idxAgeRange]) !== 'object')
                        {
                            information['age_range'] = row.values[idxAgeRange]
                        } else {
                            information['age_range'] = row.values[idxAgeRange].text
                        }
                    }
                }
                if (idxGroup) {
                    if (row.values[idxGroup] !== '') {
                        if (typeof(row.values[idxGroup]) !== 'object')
                        {
                            information['group'] = row.values[idxGroup]
                        } else {
                            information['group'] = row.values[idxGroup].text
                        }
                    }
                }   
                if (idxType) {
                    if (row.values[idxType] !== '') {
                        if (typeof(row.values[idxType]) !== 'object')
                        {
                            information['type'] = row.values[idxType]
                        } else {
                            information['type'] = row.values[idxType].text
                        }
                    }
                }   
                if (idxDetail) {
                    if (row.values[idxDetail] !== '') {
                        if (typeof(row.values[idxDetail]) !== 'object')
                        {
                            information['detail'] = row.values[idxDetail]
                        } else {
                            information['detail'] = row.values[idxDetail].text
                        }
                    }
                }   
            }
            if (!utils.isEmpty(information))
                informationDataList.push(information)
        })

        for (let informationData of informationDataList) {
            informationData['status'] = 'Enabled'
            const information = await getInformationByMbcodeAndType(informationData.mb_code, informationData.type)
            if (information) {
                const update = await updateInformation(information.id, informationData)
                if (update) {
                    importList.push({
                        mb_code : informationData.mb_code, 
                        group : informationData.group, 
                        type : informationData.type, 
                        status : 'อัพเดทข้อมูลสำเร็จ'
                    })
                } else {
                    notImportList.push({
                        mb_code : informationData.mb_code, 
                        group : informationData.group, 
                        type : informationData.type, 
                        status : 'ไม่สามารถอัพเดทข้อมูลได้'
                    })
                }
            } else {
                await createInformation(informationData)
                importList.push({
                    mb_code : informationData.mb_code, 
                    group : informationData.group, 
                    type : informationData.type, 
                    status : 'เพิ่มข้อมูลสำเร็จ'
                })
            }
        }
        rimraf.sync(pathFile)
        tmpobj.removeCallback()
        return {imported : importList, not_imported : notImportList}
    } catch (err) {
        throw err
    }
}

const getInformationByMbcodeAndType  = async (mbCode, type) => {
    try {
        const information = await models.informations.findOne({
            where : {
                mb_code : mbCode,
                type : type
            },
            raw : true
        })
        return information
    } catch (err) {
        throw err
    }
}

const getInformation = async () => {
    try {
        let groups = {}
        const groupList = await models.informations.findAll({
            attributes: ['group'],
            where : {
                status : {
                    [Op.ne] : 'Disabled'
                }
            },
            group : 'group',
            raw : true
        })
        if (groupList.length) {
            groupList.map(group => { groups[group.group] = [] })
            for (let group in groups) {
                const mbCodes = await getMbCodeByGroupAndStatus(group, 'Enabled')
                if (mbCodes.length) {
                    for (let mbCode of mbCodes) {
                        let information = {}
                        const informations = await getInformationByMbCodeAndStatus(mbCode.mb_code, 'Enabled')
                        if (informations.length) {
                            for (let informationData of informations)
                            {
                                information['mb_code'] = informationData.mb_code
                                information['age_range'] = informationData.age_range
                                information[informationData.type] = informationData.detail
                            }
                            groups[group].push(information)
                        }               
                    }
                }
            }
        }
        return groups
    } catch (err) {
        throw err
    }
}

const getMbCodeByGroupAndStatus  = async (group, status) => {
    try {
        const information = await models.informations.findAll({
            attributes: ['mb_code'],
            where : {
                group : group,
                status : status
            },
            group : 'mb_code',
            order : [['mb_code', 'ASC']],
            raw : true
        })
        return information
    } catch (err) {
        throw err
    }
}

const getInformationByMbCodeAndStatus  = async (mbCode, status) => {
    try {
        const information = await models.informations.findAll({
            where : {
                mb_code : mbCode,
                status : status
            },
            raw : true
        })
        return information
    } catch (err) {
        throw err
    }
}

const deleteInformation = async (mbCodeList) => {
    try {
        let deletedList = []
        let notDeletedList = []
        for (let mbCode of mbCodeList) {
            const informationList =  await getInformationByMbCodeAndStatus(mbCode, 'Enabled')
            if (informationList) {
                for (let information of informationList) {
                    const deleted = await updateInformation(information.id, {status : 'Disabled'})
                    if (deleted) {
                        deletedList.push(information.mb_code)
                    } else {
                        notDeletedList.push(information.mb_code)
                    }
                }
            }
        }
        deletedList = [...new Set(deletedList)]
        notDeletedList = [...new Set(notDeletedList)]
        return {deleted : deletedList, not_deleted : notDeletedList}
    } catch (err) {
        throw err
    }
}

const getInformationOfGroup  = async (query) => {
    try {
        let informationList = []
        if (query.groups[0] !== '') {
            let subQuery =  `(
                SELECT mb_code
                FROM tb_information AS information
                WHERE information."group" = '${query.groups[0]}'
                AND information.status = 'Enabled'
                GROUP BY information.mb_code)`

            if (query.groups.length > 1) {
                subQuery = `(
                    SELECT mb_code
                    FROM tb_information AS information
                    WHERE information."group" = '${query.groups[0]}'`
                for (let i = 1; i < query.groups.length; i++) {
                    subQuery = `${subQuery}
                    OR information."group" = '${query.groups[i]}'`
                }
                subQuery = `${subQuery}
                    AND information.status = 'Enabled'
                    GROUP BY information.mb_code)`
            }
            
            let queryModel =  {
                attributes: ['mb_code'],
                where : {
                    mb_code : {
                        [Sequelize.Op.in] : [
                            Sequelize.literal(subQuery)
                        ]
                    }
                },
                group : 'mb_code',
                order : [['mb_code', 'ASC']],
                raw : true
            }
            if (query.filters[0] !== '')
                queryModel['where'] = Object.assign(queryModel['where'], { [query.filters[0]]: query.filters[1] })
            
            const mbCodes = await models.informations.findAll(queryModel)

            if (mbCodes.length) {
                for (let mbCode of mbCodes) {
                    let information = {}
                    const informations = await getInformationByMbCodeAndStatus(mbCode.mb_code, 'Enabled')
                    if (informations.length) {
                        for (let informationData of informations)
                        {
                            information['mb_code'] = informationData.mb_code
                            information['group'] = informationData.group
                            information['age_range'] = informationData.age_range
                            information[informationData.type] = informationData.detail
                            information['latest_modified'] = informationData.latest_modified
                        }
                        informationList.push(information)
                    }               
                }
            }
        }
        
        return { informations : informationList }
    } catch (err) {
        throw err
    }
}

const getInformationByMbCode  = async (mbCode) => {
    try {
        let information = {}
        const informations = await getInformationByMbCodeAndStatus(mbCode, 'Enabled')
        if (informations.length) {
            for (let informationData of informations)
            {
                information['mb_code'] = informationData.mb_code
                information['group'] = informationData.group
                information['age_range'] = informationData.age_range
                information[informationData.type] = informationData.detail
                information['latest_modified'] = informationData.latest_modified
            }
        }               
        return { information : information } 
    } catch (err) {
        throw err
    }
}

const exportInformation = async () => {
    try {
        // *? Create Workbook
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Mind Booster'
        workbook.created = dayjs().tz('Asia/Bangkok')

        // *? Create Worksheet
        const worksheet = workbook.addWorksheet('Import Report Information',{views: [{state: 'frozen', ySplit: 1}]})

        // *? Header Row
        const headerRowData = [
            { header: 'mb_code', key: 'mb_code', width: 20 },
            { header: 'age_range', key: 'age_range', width: 20 },
            { header: 'group', key: 'group', width: 20 },
            { header: 'type', key: 'type', width: 20 },
            { header: 'detail', key: 'detail', width: 60 }
        ]

        // *? Add Header Row
        worksheet.columns = headerRowData

        // *? Get information Data
        const informationList = await models.informations.findAll({
            where : {
                status : {
                    [Op.ne] : 'Disabled'
                }
            },
            order: [['group', 'ASC'], ['mb_code', 'ASC']],
            raw : true
        })
        if (informationList) {
            for (let information of informationList) {
                const informationData = {
                    mb_code: information.mb_code,
                    age_range: information.age_range,
                    group: information.group,
                    type: information.type,
                    detail: information.detail
                }
                // *? Add Information Data Row
                worksheet.addRow(informationData)
            }
        }
        
        // *? Set styles
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (rowNumber === 1)
                    cell.alignment = { vertical: 'middle', horizontal: 'center' }
                cell.alignment = { wrapText: true }
            })
        })

        // *? Save file
        const fileName = `export_information_${dayjs().tz('Asia/Bangkok').format('YYYYMMDDTHHmmss')}.xlsx`
        const tmpobj = tmp.dirSync()
        const pathSource = `${tmpobj.name}/${fileName}`
        await workbook.xlsx.writeFile(pathSource)

        // *? upload file to storage
        const pathDestination = `export-information/${fileName}`
        const accessToken = uuid()
        const options = {
            public: true,
            destination: pathDestination,
            metadata: {
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                metadata: {
                    firebaseStorageDownloadTokens: accessToken
                }
            }
        }
        await Promise.all([bucket.upload(pathSource, options)])
        rimraf.sync(pathSource)
        tmpobj.removeCallback()

        const url = bucket.file(pathDestination)
        return url.publicUrl()
    } catch (err) {
        throw err
    }
}


// * Export Services
module.exports.createInformation = createInformation
module.exports.updateInformation = updateInformation
module.exports.importInformation = importInformation
module.exports.getInformationByMbcodeAndType = getInformationByMbcodeAndType
module.exports.getInformation = getInformation
module.exports.deleteInformation = deleteInformation
module.exports.getInformationByMbCodeAndStatus = getInformationByMbCodeAndStatus
module.exports.getInformationOfGroup = getInformationOfGroup
module.exports.getInformationByMbCode = getInformationByMbCode
module.exports.exportInformation = exportInformation