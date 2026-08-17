const dotenv = require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const utils = require('./server/src/utils/utils')
const jwt = require('jsonwebtoken')
const models = require('./server/src/models/index')
const { Op } = require('sequelize')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)

const app = express()

// * Require Routes
const users = require('./server/src/routes/userRoute')
const informations = require('./server/src/routes/informationRoute')
const authentications = require('./server/src/routes/authenticationRoute')
const roleManagements = require('./server/src/routes/roleManagementRoute')

// * Function Authorization
const authorization = async (req, res, next) => {
    const {access_token} = req.headers
    try {
        if (access_token !== undefined){
            const token = jwt.verify(access_token, process.env.SECRET)
            const officer = await models.officers.findOne({
                where : {
                    id : token.id,
                    status: {
                        [Op.ne]: 'Deleted'
                    }
                },
                raw : true
            })
            const user = await models.users.findByPk(token.id)
            if (officer !== null || user !== null) {
                req.headers['id'] = token.id
                req.headers['role'] = token.role
                next()
            } else {
                utils.resmsg(res, 'failed', 401, 'Unauthorized access to this API', '')
            }
        } else {
            utils.resmsg(res, 'failed', 401, 'Unauthorized access to this API', '')
        }
    } catch (err) {
        if (err.message === 'jwt expired') {
            utils.resmsg(res, 'failed', 401, 'Access token expired', '')
        } else {
            utils.resmsg(res, 'failed', 400, err, '')
        } 
    }
}

// * API Cors origin
app.use(cors({ origin: true }))

// * API body Parser
app.use(bodyParser.json({limit: '1mb'}))
app.use(bodyParser.urlencoded({ limit: '1mb', extended: false }))

// * Server Checking
app.get('/', (req, res) => {
    res.send(`Detection Server is work now is ${dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')}`)
})

// * API Middleware
app.use('/auth', authentications)
app.use(authorization)
app.use('/users', users)
app.use('/informations', informations)
app.use('/officers', roleManagements)

app.listen(process.env.PORT , process.env.HOSTNAME, () => {
    console.log(`API listening on port ${process.env.PORT}`)
})
