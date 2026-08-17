const dotenv = require('dotenv').config()
const models = require('../models/index')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const officerService = require('../services/officerService')
const mailService = require('../services/mailService')
const { Op, Sequelize } = require('sequelize')
const uuid4 = require('uuid4')
const speakeasy = require("speakeasy")
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

// * API Authentication Services
const login = async (userData) => {
    try {
        const userList = await models.users.findAll({ 
            where : { 
                email : {
                    [Op.iLike]: userData.email
                },
                status: {
                    [Op.ne]: 'Deleted'
                }
            }, 
            order : [['created_at', 'ASC']], 
            raw : true
        })
        const officer = await officerService.getOfficerByEmail(userData.email)
        if ((!Array.isArray(userList) || !userList.length) && (!officer))
            throw 'Account not found'
        if (officer) {
            if (!bcrypt.compareSync(userData.password, officer.password)) 
                throw 'Password is not invalid'
            const checkSum = uuid4()
            const tokenData = {
                id: officer.id,
                role : officer.role,
                check_sum : checkSum
            }
            const accessToken = jwt.sign(tokenData, process.env.SECRET, { expiresIn: parseInt(process.env.TOKENLIFE)})
            const refreshToken = jwt.sign(tokenData, process.env.SECRET)
            const authorizationData = {
                id : uuid4(),
                officer_id : officer.id,
                access_token : accessToken,
                refresh_token : refreshToken,
                device_id : checkSum,
                token_type : 'bearer',
                token_expired : false,
                timestamp : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss'),
                latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
            }
            await models.authorizations.create(authorizationData)
            const authorization = {
                user_id : officer.id,
                role : officer.role,
                name : officer.name || '',
                profile_image : officer.profile_image || '',
                check_sum : checkSum,
                access_token : accessToken,
                refresh_token : refreshToken,
            }
            return [authorization]
        } else {
            let UserPass = false
            for (let user of userList) {
                if (user.password){
                    if (bcrypt.compareSync(userData.password, user.password))
                        UserPass = true
                }
            }
            if (!UserPass) 
                throw 'Password is not invalid'
            const checkSum = uuid4()
            let authorizationList = []
            for (let user of userList) {
                const tokenData = {
                    id: user.id,
                    role : 'User',
                    check_sum : checkSum
                }
                const accessToken = jwt.sign(tokenData, process.env.SECRET, { expiresIn: parseInt(process.env.TOKENLIFE)})
                const refreshToken = jwt.sign(tokenData, process.env.SECRET)
                const authorizationData = {
                    id : uuid4(),
                    user_id : user.id,
                    access_token : accessToken,
                    refresh_token : refreshToken,
                    device_id : checkSum,
                    token_type : 'bearer',
                    token_expired : false,
                    timestamp : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss'),
                    latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
                }
                await models.authorizations.create(authorizationData)
                const authorization = {
                    user_id : user.id,
                    role : 'User',
                    name : `${user.first_name} ${user.last_name}` || '',
                    profile_image : user.profile_image || '',
                    check_sum : checkSum,
                    access_token : accessToken,
                    refresh_token : refreshToken,
                }
                authorizationList.push(authorization)      
            }
            return authorizationList
        }
    } catch (err) {
        throw err
    }
}

const refreshToken = async (tokenData) => {
    try {
        const session = jwt.verify(tokenData.refresh_token, process.env.SECRET)
        let query = {
            where : {
                device_id : session.check_sum,
                token_expired : false
            },
            nest: true,
            raw : true
        }   
        if (session.role === 'User') {
            query['where'] = Object.assign(query['where'], {user_id: session.id})
            query = Object.assign(query, {include: ['users']})
        } else {
            query['where'] = Object.assign(query['where'], {officer_id: session.id})
            query = Object.assign(query, {include: ['officers']})
        }
    
        const authorization = await models.authorizations.findOne(query)
        if (!authorization)
            throw 'Session not found'

        const token = {
            id: session.id,
            role : session.role,
            check_sum : session.check_sum
        }
        const accessToken = jwt.sign(token, process.env.SECRET, { expiresIn: parseInt(process.env.TOKENLIFE)})
        await models.authorizations.update({ access_token : accessToken, latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')}, { where: { id: authorization.id } })

        authorizationData = {
            user_id : session.id,
            role : session.role,
            name : session.role === 'User' ? `${authorization.users.first_name} ${authorization.users.last_name}` : `${authorization.officers.name}` || '',
            profile_image : session.role === 'User' ? `${authorization.users.profile_image}` : `${authorization.officers.profile_image}` || '',
            check_sum : authorization.device_id,
            access_token : accessToken,
            refresh_token : authorization.refresh_token
        }
        return authorizationData
    } catch (err) {
        throw err
    }
}

const logout = async (checkSum) => {
    try {
        const authorization = await models.authorizations.findOne({
            include : ['users', 'officers'],
            where : {
                device_id : checkSum,
                token_expired : false
            },
            nest: true,
            raw : true
        })

        if (!authorization)
            throw 'Session not found'

        await models.authorizations.update({ token_expired : true, latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')}, { where: { id: authorization.id } })
        const logoutData = {
            user_id : authorization.user_id !== null ? authorization.user_id : authorization.officer_id,
            role : authorization.user_id !== null ? 'User' : authorization.officers.role,
            name : authorization.user_id !== null ? `${authorization.users.first_name} ${authorization.users.last_name}` : authorization.officers.name|| ''
        }
        return logoutData
    } catch (err) {
        throw err
    }
}

const getAccessToken = async (userId, checkSum) => {
    try {  
        const authorization = await models.authorizations.findOne({
            include : ['users', 'officers'],
            where : {
                device_id : checkSum,
                token_expired : false,
                [Op.or] : [
                    {user_id: userId},
                    {officer_id: userId}
                ]
            },
            nest: true,
            raw : true
        })

        if (!authorization)
            throw 'Session not found'
        const authorizationData = {
            user_id : authorization.user_id !== null ? authorization.user_id : authorization.officer_id,
            role : authorization.user_id !== null ? 'User' : authorization.officers.role,
            name : authorization.user_id !== null ? `${authorization.users.first_name} ${authorization.users.last_name}` : authorization.officers.name|| '',
            profile_image : authorization.user_id !== null ? authorization.users.profile_image : authorization.officers.profile_image || '',
            check_sum : authorization.device_id,
            access_token : authorization.access_token,
            refresh_token : authorization.refresh_token,
        }
        return authorizationData
    } catch (err) {
        throw err
    }
}

const fogotPassword = async (userData, role) => {
    try {
        const now = dayjs().tz('Asia/Bangkok').unix()
        let secret = speakeasy.generateSecret({ length: 5 })
        const recoveryCode = speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
            time: now,
            step : 300
        }) 
        secret = jwt.sign({recovery_code: recoveryCode}, process.env.SECRET, { expiresIn: parseInt(process.env.OTPTOKENLIFE)})
        if (role !== 'User') {
            const upadate = await officerService.updateOfficerInfo(userData.id, {secret : secret})
            if (!upadate)
                throw `Can't update secret` 
        } else {
            const upadate = await models.users.update({
                secret : secret, 
                latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
            }, {where : {email : userData.email}})
            if (!upadate[0])
                throw `Can't update secret` 
        }
        const mailData = await mailService.forgotPasswordMailDataModel(userData.email, recoveryCode)
        await  mailService.sendEmails(mailData)
    } catch (err) {
        throw err
    }
}

const changePassword = async (userData ,tokenData, role) => {
    try {
        if (!userData.secret || !tokenData.recovery_code)
            throw `Recovery code is not invalid` 
        const verify = jwt.verify(userData.secret, process.env.SECRET)
        if (verify.recovery_code !== tokenData.recovery_code)
            throw `Recovery code is not invalid` 
        const encryptPassword = bcrypt.hashSync(tokenData.password, 14)
        if (role !== 'User') {
            const upadate = await officerService.updateOfficerInfo(userData.id, {password : encryptPassword, secret : null})
            if (!upadate)
                throw `Can't update password` 
        } else {
            const upadate = await models.users.update({
                password : encryptPassword,
                secret : null, 
                latest_modified : dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
            }, {where : {email : userData.email}})
            if (!upadate[0])
                throw `Can't update password`
        }
    } catch (err) {
        if (err.message === 'jwt expired') {
            throw `Recovery code is not invalid` 
        }else {
            throw err
        }
    }
}

// * Export Services
module.exports.login = login
module.exports.refreshToken = refreshToken
module.exports.logout = logout
module.exports.getAccessToken = getAccessToken
module.exports.fogotPassword = fogotPassword
module.exports.changePassword = changePassword