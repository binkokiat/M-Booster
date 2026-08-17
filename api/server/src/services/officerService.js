const models = require('../models/index')
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const { default: ShortUniqueId } = require('short-unique-id')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

const options = { 
    dictionary: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    length : 6
}
const uuid = new ShortUniqueId(options)

// * Officer model
const officerModel = (data = '') => {
    const officer = {
        officer_id : data.id || '',
        role : data.role || '',
        name : data.name || '',
        email : data.email || '',
        last_modify_time : data.operates.latest_modified.replace(' ', 'T') || ''
    }
    return officer
}

// * Officer info model
const officerInfoModel = (data = '') => {
    const officerInfo = {
        officer_info : {
            officer_id : data.id || '',
            role : data.role || '',
            name : data.name || '',
            profile_image : data.profile_image || '',
            email : data.email || '',
            last_modify_time : data.latest_modified.replace(' ', 'T') || ''
        } 
    }
    return officerInfo
}

// * API Officer Services
const getOfficerByEmail = async (email) => {
    try {
        const officer = await models.officers.findOne({
            where : {
                email : {
                    [Op.iLike]: email
                },
                status: {
                    [Op.ne]: 'Deleted'
                }
            },
            raw : true
        })
        return officer
    } catch (err) {
        throw err
    }
}

const getOfficerInfo = async (officerId) => {
    try {
        const officers = await models.officers.findOne({ where : {id: officerId}})
        const officersData = officers !== null ? officerInfoModel(officers.get({plain : true})) : ''
        return officersData
    } catch (err) {
        throw err
    }
}

const updateOfficerInfo = async (officerId, officerInfo) => {
    try {
        officerInfo['latest_modified'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        const officer = await models.officers.update(officerInfo, {where : {id : officerId}})
        return officer[0]
    } catch (err) {
        throw err
    }
}

const createOfficers = async () => {
    try {
        let collectorList = []
        let id = 25
        for (let i= 11; i<= 40; i++) {
            const password = `collector_${uuid()}`
            const encryptPassword = bcrypt.hashSync(password, 14)
            const officerData = {
                id: `MB${id.toString().padStart(5, '0')}`,
                role: 'Collector',
                name: `ผู้เก็บลายนิ้วมือ ${i}`,
                profile_image: null,
                email: `collector_${i}@mbmail.com`,
                password: encryptPassword,
                secret: null,
                status: 'Created',
                latest_modified: dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss') 
            }
            await models.officers.create(officerData)
            collectorList.push({email: officerData.email, password: password})
            id++
        }
        return collectorList
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.officerModel = officerModel
module.exports.getOfficerByEmail = getOfficerByEmail
module.exports.getOfficerInfo = getOfficerInfo
module.exports.updateOfficerInfo = updateOfficerInfo
module.exports.createOfficers = createOfficers