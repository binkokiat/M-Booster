const models = require('../models/index')
const uuid = require('uuid4')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * API Operate Services
const createOperate = async (userId, officerId) => {
    try {
        const operate = await models.operates.create({
            id : uuid(),
            user_id : userId, 
            officer_collector : officerId, 
            latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        })
        return operate.get({plant : true})
    } catch (err) {
        throw err
    }
}

const updateOperate = async (operateId) => {
    try {
        const operate = await models.operates.update({
            latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        }, {where : {id : operateId}})
        return operate[0]
    } catch (err) {
        throw err
    }
}

const getOperateByUserIdAndOfficerId = async (userId, officerId) => {
    try {
        const operate = await models.operates.findOne({
            where : {
                user_id : userId,
                officer_collector : officerId
            },
            raw : true
        })
        return operate
    } catch (err) {
        throw err
    }
}

const operateUser = async (userId, officerId) => {
    try {
        const operate = await getOperateByUserIdAndOfficerId(userId, officerId)
        if (operate !== null) {
            await updateOperate(operate.id)
        } else {
            await createOperate(userId, officerId)
        }
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.createOperate = createOperate
module.exports.updateOperate = updateOperate
module.exports.getOperateByUserIdAndOfficerId = getOperateByUserIdAndOfficerId
module.exports.operateUser = operateUser