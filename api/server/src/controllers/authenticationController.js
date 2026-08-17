const dotenv = require('dotenv').config()
const utils = require('../utils/utils')
const jwt = require('jsonwebtoken')
const authenticationService = require('../services/authenticationService')
const userService = require('../services/userService')
const officerService = require('../services/officerService')

// * API Authentication Controllers
const loginController = async (res, userData) => {
    try {
        if (userData.email === undefined)
            throw utils.errmsg('email')
        if (userData.password === undefined)
            throw utils.errmsg('password')
        const accessToken = await authenticationService.login(userData)
        utils.resmsg(res, 'success', 200, '', accessToken)
    } catch (err) {
        if (err === 'Password is not invalid' || err === 'Account not found') {
            utils.resmsg(res, 'failed', 401, err, '')
        } else {
            utils.resmsg(res, 'failed', 500, err, '')
        }
    }
}

const refreshTokenController = async (res, tokenData) => {
    try {
        if (tokenData.check_sum === undefined)
            throw utils.errmsg('check_sum')
        if (tokenData.refresh_token === undefined)
            throw utils.errmsg('refresh_token')
        const accessToken = await authenticationService.refreshToken(tokenData)
        utils.resmsg(res, 'success', 200, '', accessToken)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const logoutController = async (res, userData) => {
    try {
        if (userData.check_sum === undefined)
            throw utils.errmsg('check_sum')
        const logout = await authenticationService.logout(userData.check_sum)
        utils.resmsg(res, 'success', 200, '', {logged_out : logout})
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const getAccessTokenController = async (res, userId, checkSum) => {
    try {
        if (userId === undefined)
            throw utils.errmsg('user_id')
        if (checkSum === undefined)
            throw utils.errmsg('check_sum')
        const accessToken = await authenticationService.getAccessToken(userId, checkSum)
        utils.resmsg(res, 'success', 200, '', accessToken)
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const forgotPasswordController = async (res, email) => {
    try {
        const user = await userService.getUserByEmail(email)
        const officer = await officerService.getOfficerByEmail(email)
        if (user === null && officer === null)
            throw 'Email not found'
        if (officer) {
            await authenticationService.fogotPassword(officer, 'Officer')           
        } else {
            await authenticationService.fogotPassword(user, 'User')
        }
        utils.resmsg(res, 'success', 200, '', '')
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

const changePasswordController = async (res, email, token) => {
    try {
        const tokenData = jwt.verify(token, process.env.SECRET)
        const user = await userService.getUserByEmail(email)
        const officer = await officerService.getOfficerByEmail(email)
        if (user === null && officer === null)
            throw 'Email not found'
        if (officer) {
            await authenticationService.changePassword(officer, tokenData, 'Officer')
        } else {
            await authenticationService.changePassword(user, tokenData, 'User')
        }
        utils.resmsg(res, 'success', 200, '', '')
    } catch (err) {
        utils.resmsg(res, 'failed', 500, err, '')
    }
}

// * Export Controllersa
module.exports.loginController = loginController
module.exports.refreshTokenController = refreshTokenController
module.exports.logoutController = logoutController
module.exports.getAccessTokenController = getAccessTokenController
module.exports.forgotPasswordController = forgotPasswordController
module.exports.changePasswordController = changePasswordController