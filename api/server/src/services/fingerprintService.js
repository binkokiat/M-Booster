const models = require('../models/index')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * Fingerprint model
const fingerprintModel = () => {
    const fingerprint = {
        finger_id : '',
        latest_modified : '',
        fingerprint : {
            right : {
                thumb : {},
                index : {},
                middle : {},
                ring : {},
                pinkie : {}
            },
            left : {
                thumb : {},
                index : {},
                middle : {},
                ring : {},
                pinkie : {}
            }
        }
    }
    return fingerprint
}

// * Side Finger model
const sideFingerModel = (data = '') => {
    const sideFinger = {
        ai_type : data.ai_type || '',
        ai_RC1 : data.ai_RC1 || 0,
        ai_RC2 : data.ai_RC2 || 0,
        analyst_type : data.analyst_type || '',
        analyst_RC1 : data.analyst_RC1 || 0,
        analyst_RC2 : data.analyst_RC2 || 0,
        angle : {
            angle_1 : {},
            angle_2 : {},
            angle_3 : {},
            angle_4 : {},
            angle_5 : {},
            angle_6 : {},
            angle_7 : {},
        }
    }
    return sideFinger
}

// * Fingerprint Angle model
const fingerprintAngleModel = (data = '') => {
    const fingerprintAngle = {
        image : data.image || '',
        ai_RC : data.ai_RC || 0,
        ai_count_image : data.ai_count_image || '',
        ai_enhanced_image : data.ai_enhanced_image || '',
        analyst_RC : data.analyst_RC || 0,
        line : JSON.parse(data.line) || [],
        plot_coordinates : JSON.parse(data.plot_coordinates) || []
    }
    return fingerprintAngle
}

// * API Fingerprint Services
const createFingerprint = async (id) => {
    try {
        const fingerprint = await models.fingerprints.create({id : `FG${id}`, latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')})
        return fingerprint.get({plant : true})
    } catch (err) {
        throw err
    }
}

const getUserFingerprint = async (userId) => {
    try {
        const sideList = ['right', 'left']
        const fingerList = ['thumb', 'index', 'middle', 'ring', 'pinkie']
        const userFingerprint = await getFingerprintByUserId(userId)
        let fingerprint = fingerprintModel()
        fingerprint['finger_id'] = userFingerprint.id
        fingerprint['latest_modified'] = userFingerprint.latest_modified.replace(' ', 'T')||''
        for (let side of sideList) {
            for (let finger of fingerList) {
                const sideFinger = await models.sideFingers.findOne({
                    where  : {
                        finger_id : userFingerprint.id,
                        side : side,
                        finger : finger
                    },
                    raw : true
                })
                const fingerprintAngleList = await models.fingerprintAngle.findAll({
                    where : { side_finger_id : sideFinger.id},
                    raw : true
                })
                fingerprint['fingerprint'][side][finger] = sideFingerModel(sideFinger)
                for (let fingerprintAngle of fingerprintAngleList) {
                    fingerprint['fingerprint'][side][finger]['angle'][fingerprintAngle.angle] = fingerprintAngleModel(fingerprintAngle)
                }
            }
        }
        return fingerprint
    } catch (err) {
        throw err
    }
}

const getFingerprintByUserId = async (userId) => {
    try {
        const userFingerprint = await models.users.findOne({
            attributes : ['fingerprints.id', 'fingerprints.latest_modified'], 
            where : {id : userId}, 
            include : ['fingerprints'],
            raw : true,
            nest : true
        })
        return userFingerprint
    } catch (err) {
        throw err
    }
}

const updateUserFingerprint = async (fingerprintId, fingerprintData) => {
    try {
        let updateList = []
        const sideList = ['right', 'left']
        const fingerList = ['thumb', 'index', 'middle', 'ring', 'pinkie']
        for (let side of sideList) {
            for (let finger of fingerList) {
                const sideFinger = await models.sideFingers.findOne({
                    attributes : ['id'], 
                    where  : {
                        finger_id : fingerprintId,
                        side : side,
                        finger : finger
                    },
                    raw : true
                })
                const upadteSideFinger = await models.sideFingers.update({
                    ai_type : fingerprintData['fingerprint'][side][finger]['ai_type'],
                    ai_RC1 : fingerprintData['fingerprint'][side][finger]['ai_RC1'],
                    ai_RC2 : fingerprintData['fingerprint'][side][finger]['ai_RC2'],
                    analyst_type : fingerprintData['fingerprint'][side][finger]['analyst_type'],
                    analyst_RC1 : fingerprintData['fingerprint'][side][finger]['analyst_RC1'],
                    analyst_RC2 : fingerprintData['fingerprint'][side][finger]['analyst_RC2'],
                    latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
                }, {where : {id : sideFinger.id}})
                updateList.push(upadteSideFinger)
                const fingerprintAngleList = await models.fingerprintAngle.findAll({
                    attributes : ['id', 'angle'], 
                    where : { side_finger_id : sideFinger.id},
                    raw : true
                })
                for (let fingerprintAngle of fingerprintAngleList) {
                    const upadteFingerprintAngle = await models.fingerprintAngle.update({
                        image : fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['image'],
                        ai_RC : fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['ai_RC'],
                        ai_count_image : fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['ai_count_image'],
                        ai_enhanced_image : fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['ai_enhanced_image'],
                        analyst_RC : fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['analyst_RC'],
                        line : JSON.stringify(fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['line']),
                        plot_coordinates : JSON.stringify(fingerprintData['fingerprint'][side][finger]['angle'][fingerprintAngle.angle]['plot_coordinates']),
                        latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
                    }, {where : {id : fingerprintAngle.id}})
                    updateList.push(upadteFingerprintAngle)
                }
            }
        }
        const updateFingerprint = await models.fingerprints.update({latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')}, {where : {id : fingerprintId}}) 
        updateList.push(updateFingerprint)
        return updateList
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.createFingerprint = createFingerprint
module.exports.getUserFingerprint = getUserFingerprint
module.exports.getFingerprintByUserId = getFingerprintByUserId
module.exports.updateUserFingerprint = updateUserFingerprint