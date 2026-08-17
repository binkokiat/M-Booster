const express = require('express')
const router = express.Router();
const authenticationCtr = require('../controllers/authenticationController')

// * API Authentication Routes
router.post('/login', async (req, res) => {
    const userData = req.body
    authenticationCtr.loginController(res, userData)
})

router.post('/token', async (req, res) => {
    const tokenData = req.body
    authenticationCtr.refreshTokenController(res, tokenData)
})

router.post('/logout', async (req, res) => {
    const userData = req.body
    authenticationCtr.logoutController(res, userData)
})

router.get('/:userId', async (req, res) => {
    const userId = req.params.userId
    const checkSum = req.query.check_sum
    authenticationCtr.getAccessTokenController(res, userId, checkSum)
})

router.post('/:email/password', async (req, res) => {
    const email = req.params.email
    authenticationCtr.forgotPasswordController(res, email)
})

router.put('/:email/password', async (req, res) => {
    const email = req.params.email
    const { token } = req.body
    authenticationCtr.changePasswordController(res, email, token)
})

module.exports = router