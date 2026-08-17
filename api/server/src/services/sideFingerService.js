const models = require('../models/index')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const uuid4 = require('uuid4')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * API Side Finger Services
const createSideFinger = async (fingerprintId) => {
    try {
        const sideList = ['right', 'left']
        const fingerList = ['thumb', 'index', 'middle', 'ring', 'pinkie']
        const sideFingerList = []
        for (side of sideList) {
            for (finger of fingerList) {
                const sideFinger = await models.sideFingers.create({
                    id : `${uuid4()}`, 
                    finger_id : fingerprintId,
                    side : side,
                    finger : finger,
                    latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
                })
                sideFingerList.push(sideFinger.get({plant : true}))
            }
        }
        return sideFingerList
    } catch (err) {
        throw err
    }
}

const updateUserSideFingerprint = async (fingerprintId, sideFingerprintData) => {
    try {
        const sideFinger = await models.sideFingers.findOne({
            attributes : ['id'], 
            where  : {
                finger_id : fingerprintId,
                side : sideFingerprintData.side,
                finger : sideFingerprintData.finger
            },
            raw : true
        })
        const upadteSideFinger = await models.sideFingers.update({
            ai_type : sideFingerprintData.ai_type,
            ai_RC1 : sideFingerprintData.ai_RC1,
            ai_RC2 : sideFingerprintData.ai_RC2,
            latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        }, 
        { where : {id : sideFinger.id} })
        return upadteSideFinger[0]
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.createSideFinger = createSideFinger
module.exports.updateUserSideFingerprint = updateUserSideFingerprint