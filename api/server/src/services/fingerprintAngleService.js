const models = require('../models/index')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const uuid4 = require('uuid4')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * API Fingerprint Angle Services
const createFingerprintAngle = async (sideFingerList) => {
    try {
        const angleList = ['angle_1', 'angle_2', 'angle_3', 'angle_4', 'angle_5', 'angle_6', 'angle_7']
        const fingerprintAngleList = []
        for (sideFinger of sideFingerList) {
            for (angle of angleList) {
                const fingerprintAngle = await models.fingerprintAngle.create({
                    id : `${uuid4()}`, 
                    side_finger_id : sideFinger.id,
                    angle : angle,
                    latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
                })
                fingerprintAngleList.push(fingerprintAngle.get({plant : true}))
            }
        }
        return fingerprintAngleList
    } catch (err) {
        throw err
    }
}

const updateUserFingerprintAngle = async (fingerprintId, fingerprintAngleData) => {
    try {
        const sideFinger = await models.sideFingers.findOne({
            attributes : ['id'], 
            where  : {
                finger_id : fingerprintId,
                side : fingerprintAngleData.side,
                finger : fingerprintAngleData.finger
            },
            raw : true
        })
        const fingerprintAngle = await models.fingerprintAngle.findOne({
            attributes : ['id'], 
            where : { 
                side_finger_id : sideFinger.id,
                angle : fingerprintAngleData.angle
            },
            raw : true
        })
        const upadteFingerprintAngle = await models.fingerprintAngle.update({
            ai_RC : fingerprintAngleData.ai_RC,
            ai_count_image : fingerprintAngleData.ai_count_image,
            ai_enhanced_image : fingerprintAngleData.ai_enhanced_image,
            latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        }, 
        { where : {id : fingerprintAngle.id} })
        return upadteFingerprintAngle[0]
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.createFingerprintAngle = createFingerprintAngle
module.exports.updateUserFingerprintAngle = updateUserFingerprintAngle