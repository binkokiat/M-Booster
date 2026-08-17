const dotenv = require('dotenv').config()
const models = require('../models/index')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const buddhistEra = require('dayjs/plugin/buddhistEra')
const { Op, Sequelize } = require('sequelize')
const axios = require('axios')
const ExcelJS = require('exceljs')
const tmp = require('tmp-promise')
const rimraf = require('rimraf')
const uuid4 = require('uuid4')
const { default: ShortUniqueId } = require('short-unique-id')
const { Storage } = require('@google-cloud/storage')
const readXlsxFile = require('read-excel-file/node')
const generator = require('generate-password')
const bcrypt = require('bcrypt')
const utils = require('../utils/utils')
const officerService = require('../services/officerService')
const operateService = require('../services/operateService')
const fingerprintService = require('../services/fingerprintService')
const sideFingertService = require('../services/sideFingerService')
const fingerprintAngleService = require('../services/fingerprintAngleService')
const reportService = require('../services/reportService')
const mailService = require('../services/mailService')

// * Google Cloud Storage
const gcs = new Storage()
const bucket = gcs.bucket(process.env.GCS_BUCKET)

//  * dayjs use timezone
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(buddhistEra)

const options = { 
    dictionary: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    length : 9
}
const uuid = new ShortUniqueId(options)

// * User info model
const userInfoModel = (data = '') => {
    const userInfo = {
        user_info: {
            user_id: data.id || '',
            reference_code: data.reference_code || '',
            mydna_id : data.mydna_id || '',
            status: data.status || '',
            created_at: data.created_at.replace(' ', 'T') || '',
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            nick_name: data.nick_name || '',
            phone: data.phone || '',
            email: data.email || '',
            citizen_id: data.citizen_id || '',
            parent_name: data.parent_name || '',
            parent_phone: data.parent_phone || '',
            remark: data.remark || '',
            birth_date: data.birth_date !== null ? data.birth_date.replace(' ', 'T') || '' : '',
            gender: data.gender || '',
            line_id: data.line_id || '',
            address: data.address || '',
            profile_image: data.profile_image || '',
            report_id: data.report_id || '',
            disapproved_report: data.disapproved_report || '',
            officer: [],
            finger_id: data.finger_id || '',
            reported : data.reported,
            latest_modified: data.latest_modified.replace(' ', 'T') || ''
        }
    }
    if (data.officers)
        userInfo['user_info']['officer'] = data.officers.map(officer => { return officerService.officerModel(officer) })
    return userInfo
}

// * User info list model
const userInfoListModel = (data = '') => {
    const userInfo = {
        user_id: data.id || '',
        reference_code: data.reference_code || '',
        mydna_id : data.mydna_id || '',
        status: data.status || '',
        created_at: data.created_at.replace(' ', 'T') || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        nick_name: data.nick_name || '',
        phone: data.phone || '',
        email: data.email || '',
        citizen_id: data.citizen_id || '',
        parent_name: data.parent_name || '',
        parent_phone: data.parent_phone || '',
        remark: data.remark || '',
        birth_date: data.birth_date !== null ? data.birth_date.replace(' ', 'T') || '' : '',
        gender: data.gender || '',
        line_id: data.line_id || '',
        address: data.address || '',
        profile_image: data.profile_image || '',
        report_id: data.report_id || '',
        disapproved_report: data.disapproved_report || '',
        finger_id: data.finger_id || '',
        reported : data.reported,
        latest_modified: data.latest_modified.replace(' ', 'T') || ''
    }
    return userInfo
}

// * User List model
const userListModel = (data = '') => {
    const userList = {
        total_page: data.totalPage || 10,
        per_page: data.perPage || 10,
        page: data.page || 1,
        user_list: data.userList || []
    }
    return userList
}

// * Query User List model
const queryUserListModel = (search, status, before, after, orderby, order, offset, limit, officerId) => {
    const query = {
        include: [{
            model: models.officers,
            as: 'officers',
            attributes: { exclude: ['id', 'role', 'name', 'profile_image', 'email', 'password', 'secret', 'status', 'latest_modified'] },
            through: { attributes: [] }
        }],
        where: {
            status: {
                [Op.ne]: 'Deleted'
            },
        },
        order: [[orderby, order], ['nick_name', 'ASC']],
        group: 'users.id',
        subQuery: false,
        nest: true,
        raw: true
    }
    if (status !== '' && status !== 'Reported')
        query['where']['status'] = Object.assign(query['where']['status'], { [Op.eq]: status })
    if (status !== '' && status === 'Reported')
        query['where'] = Object.assign(query['where'], { reported : { [Op.eq]: true } })
    if (officerId) {
        query['where'] = Object.assign(query['where'], {
            '$officers.id$': {
                [Op.eq]: officerId
            }
        })
    }
    if (search !== '') {
        query['where'] = Object.assign(query['where'], {
            [Op.or]: [
                {
                    id: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    reference_code: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    mydna_id: {
                        [Op.or] : [ { [Op.iLike]: search + '%'}, { [Op.substring] : search } ] 
                    }
                },
                {
                    finger_id: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    first_name: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    last_name: {
                        [Op.or]: [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ]
                    }
                },
                {
                    nick_name: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    phone: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    email: {
                        [Op.or] : [ { [Op.iLike]: search  +'%'}, { [Op.substring] : search } ] 
                    }
                },
                {
                    citizen_id: {
                        [Op.or] : [ { [Op.iLike]: search  +'%'}, { [Op.substring] : search } ] 
                    }
                },
                {
                    parent_name: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    parent_phone: {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                },
                {
                    remark: {
                        [Op.or] : [ { [Op.iLike]: search  +'%'}, { [Op.substring] : search } ] 
                    }
                },
                {
                    '$officers.name$': {
                        [Op.or] : [ { [Op.iLike]: search +'%' }, { [Op.substring] : search } ] 
                    }
                }
            ]
        })
    }
    if (before !== '' && after !== '') {
        query['where'] = Object.assign(query['where'], {
            created_at: {
                [Op.between]: [after, before]
            }
        })
    }
    if (offset !== null)
        query['offset'] = offset
    if (limit !== null)
        query['limit'] = limit
    return query
}

// * User status total model
const userStatusTotalModel = (data = '') => {
    const userStatusTotal = {
        user_status_total: {
            all: data.user_status_total.all || 0,
            created: data.user_status_total.created || 0,
            ready_to_review: data.user_status_total.ready_to_review || 0,
            approved: data.user_status_total.approved || 0,
            disapproved: data.user_status_total.disapproved || 0,
            'ai-processing': data.user_status_total['ai-processing'] || 0,
            'ai-resulted': data.user_status_total['ai-resulted'] || 0,
            analyst_reviewed: data.user_status_total.analyst_reviewed || 0,
            export_to_report: data.user_status_total.export_to_report || 0,
            reported: data.user_status_total.reported || 0
        }
    }
    return userStatusTotal
}

// * User report model
const userReportModel = (data = '') => {
    const userReport = {
        user_report: {
            user_id: data.id,
            reference_code: data.reference_code,
            report_id: data.reports.id,
            mydna_id: data.mydna_id,
            first_name: data.first_name,
            last_name: data.last_name,
            nick_name: data.nick_name,
            class: data.reports.class,
            remark: data.remark,
            birth_date: data.birth_date !== null ? data.birth_date.replace(' ', 'T') : null,
            email: data.email,
            reported: data.reported,
            avg_pre: data.reports.avg_pre,
            acha_01: data.reports.acha_01,
            acha_02: data.reports.acha_02,
            acha_03: data.reports.acha_03,
            acha_04: data.reports.acha_04,
            fcha_01: data.reports.fcha_01,
            fcha_02: data.reports.fcha_02,
            fcha_03: data.reports.fcha_03,
            fcha_04: data.reports.fcha_04,
            scha_01: data.reports.scha_01,
            scha_02: data.reports.scha_02,
            mcha_01: data.reports.mcha_01,
            mcha_02: data.reports.mcha_02,
            mcha_03: data.reports.mcha_03,
            mcha_04: data.reports.mcha_04,
            mcha_11: data.reports.mcha_11,
            mcha_12: data.reports.mcha_12,
            mcha_13: data.reports.mcha_13,
            mcha_14: data.reports.mcha_14,
            dver_ww: data.reports.dver_ww,
            dver_wp: data.reports.dver_wp,
            dver_pw: data.reports.dver_pw,
            dver_pp: data.reports.dver_pp,
            dver: data.reports.dver,
            lsty_cp: data.reports.lsty_cp,
            lsty_rp: data.reports.lsty_rp,
            lsty_kp: data.reports.lsty_kp,
            lsty_ap: data.reports.lsty_ap,
            lsty_vp: data.reports.lsty_vp,
            pre_l1: data.reports.pre_l1,
            pre_l2: data.reports.pre_l2,
            pre_l3: data.reports.pre_l3,
            pre_l4: data.reports.pre_l4,
            pre_l5: data.reports.pre_l5,
            pre_r1: data.reports.pre_r1,
            pre_r2: data.reports.pre_r2,
            pre_r3: data.reports.pre_r3,
            pre_r4: data.reports.pre_r4,
            pre_r5: data.reports.pre_r5,
            post_l1: data.reports.post_l1,
            post_l2: data.reports.post_l2,
            post_l3: data.reports.post_l3,
            post_l4: data.reports.post_l4,
            post_l5: data.reports.post_l5,
            post_r1: data.reports.post_r1,
            post_r2: data.reports.post_r2,
            post_r3: data.reports.post_r3,
            post_r4: data.reports.post_r4,
            post_r5: data.reports.post_r5,
            a_l1: data.reports.a_l1,
            a_l2: data.reports.a_l2,
            a_l3: data.reports.a_l3,
            a_l4: data.reports.a_l4,
            a_l5: data.reports.a_l5,
            a_r1: data.reports.a_r1,
            a_r2: data.reports.a_r2,
            a_r3: data.reports.a_r3,
            a_r4: data.reports.a_r4,
            a_r5: data.reports.a_r5,
            pre_act_01: data.reports.pre_act_01,
            pre_act_02: data.reports.pre_act_02,
            pre_act_03: data.reports.pre_act_03,
            pre_act_04: data.reports.pre_act_04,
            pre_act_05: data.reports.pre_act_05,
            pre_act_06: data.reports.pre_act_06,
            pre_act_07: data.reports.pre_act_07,
            pre_act_08: data.reports.pre_act_08,
            pre_act_09: data.reports.pre_act_09,
            pre_act_10: data.reports.pre_act_10,
            pre_act_11: data.reports.pre_act_11,
            pre_act_12: data.reports.pre_act_12,
            pre_act_13: data.reports.pre_act_13,
            pre_act_14: data.reports.pre_act_14,
            pre_act_15: data.reports.pre_act_15,
            post_act_01: data.reports.post_act_01,
            post_act_02: data.reports.post_act_02,
            post_act_03: data.reports.post_act_03,
            post_act_04: data.reports.post_act_04,
            post_act_05: data.reports.post_act_05,
            post_act_06: data.reports.post_act_06,
            post_act_07: data.reports.post_act_07,
            post_act_08: data.reports.post_act_08,
            post_act_09: data.reports.post_act_09,
            post_act_10: data.reports.post_act_10,
            post_act_11: data.reports.post_act_11,
            post_act_12: data.reports.post_act_12,
            post_act_13: data.reports.post_act_13,
            post_act_14: data.reports.post_act_14,
            post_act_15: data.reports.post_act_15,
            a_act_01: data.reports.a_act_01,
            a_act_02: data.reports.a_act_02,
            a_act_03: data.reports.a_act_03,
            a_act_04: data.reports.a_act_04,
            a_act_05: data.reports.a_act_05,
            a_act_06: data.reports.a_act_06,
            a_act_07: data.reports.a_act_07,
            a_act_08: data.reports.a_act_08,
            a_act_09: data.reports.a_act_09,
            a_act_10: data.reports.a_act_10,
            a_act_11: data.reports.a_act_11,
            a_act_12: data.reports.a_act_12,
            a_act_13: data.reports.a_act_13,
            a_act_14: data.reports.a_act_14,
            a_act_15: data.reports.a_act_15,
            latest_modified: data.reports.latest_modified.replace(' ', 'T') || ''
        }
    }
    return userReport
}

// * Fill Background model 
const fillBackgroundModel = (color) => {
    const fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `${color}` }
    }
    return fill
}

// * API User Services
const getUserInfo = async (userId) => {
    try {
        const user = await models.users.findOne({ where: { id: userId }, include: ['officers'] })
        const userData = user !== null ? userInfoModel(user.get({ plain: true })) : ''
        return userData
    } catch (err) {
        throw err
    }
}

const createUserInfo = async (userId, userInfo, fingerId, reportId) => {
    try {
        userInfo['id'] = `CN${userId}`
        userInfo['created_at'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        userInfo['status'] = userInfo['status'] || 'Created'
        userInfo['report_id'] = reportId
        userInfo['finger_id'] = fingerId
        userInfo['reported'] = false
        userInfo['latest_modified'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        if (userInfo['birth_date'] !== undefined && userInfo['birth_date'] !== null)
            userInfo['birth_date'] = await utils.convertBuddhistEraToAnnoDomini(userInfo['birth_date'])
        if (userInfo['birth_date'] !== undefined && userInfo['birth_date'] === null)
            delete userInfo['birth_date']
        const user = await models.users.create(userInfo)
        return user.get({ plant: true })
    } catch (err) {
        throw err
    }
}

const updateUserInfo = async (userId, userInfo) => {
    try {
        if (userInfo['birth_date'] !== undefined && userInfo['birth_date'] !== null)
            userInfo['birth_date'] = await utils.convertBuddhistEraToAnnoDomini(userInfo['birth_date'])
        if (userInfo['birth_date'] !== undefined && userInfo['birth_date'] === null)
            delete userInfo['birth_date']
        userInfo['latest_modified'] = dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
        const user = await models.users.update(userInfo, { where: { id: userId } })
        return user[0]
    } catch (err) {
        throw err
    }
}

const getAllUserList = async () => {
    try {
        const totalUser = await models.users.findAll({ where: { status: { [Op.ne]: 'Deleted' } }, raw: true })
        let userList = await models.users.findAll({
            where: {
                status: {
                    [Op.ne]: 'Deleted'
                }
            },
            order: [['created_at', 'DESC']],
            limit: 10,
            raw: true
        })

        userList = userList.map(user => { return userInfoListModel(user) })
        userList = userListModel({ totalPage: Math.ceil(totalUser.length / 10), perPage: 10, page: 1, userList: userList })
        return userList
    } catch (err) {
        throw err
    }
}

const deleteUser = async (userIdList, officerId) => {
    try {
        let deletedList = []
        let notDeletedList = []
        for (let userId of userIdList) {
            const deleted = await models.users.update({ status: 'Deleted', latest_modified: dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss') }, { where: { id: userId } })
            if (deleted) {
                await operateService.operateUser(userId, officerId)
                deletedList.push(userId)
            } else {
                notDeletedList.push(userId)
            } 
        }
        deletedList = [...new Set(deletedList)]
        notDeletedList = [...new Set(notDeletedList)]
        return {user_deleted : deletedList, user_not_deleted : notDeletedList}
    } catch (err) {
        throw err
    }
}

const geUserList = async (query, officerId, officerRole) => {
    try {
        const perPage = query.per_page || 10
        const page = query.page || 1
        const search = query.search || ''
        const status = query.status || ''
        const before = query.before !== '' ? dayjs(query.before).add(1, 'day').format('YYYY-MM-DDTHH:mm:ss') : ''
        const after = query.after !== '' ? dayjs(query.after).format('YYYY-MM-DDTHH:mm:ss') : ''
        const orderby = query.orderby || 'created_at'
        const order = query.order || 'DESC'

        let options = queryUserListModel(search, status, before, after, orderby, order, null, null, officerRole === 'Collector' ? officerId : null)
        const totalUser = await models.users.findAll(options)
        const totalPage = Math.ceil(totalUser.length / +perPage)
        const offset = perPage * (+page - 1)
        options = queryUserListModel(search, status, before, after, orderby, order, offset > 0 ? offset : null, +perPage, officerRole === 'Collector' ? officerId : null)
        let userList = await models.users.findAll(options)
        userList = userList.map(user => { return userInfoListModel(user) })
        userList = userListModel({ totalPage: totalPage, perPage: +perPage, page: +page, userList: userList })
        return userList
    } catch (err) {
        throw err
    }
}

const checkCitizenDuplicated = async (citizenId) => {
    try {
        const { count, rows } = await models.users.findAndCountAll({
            where: {
                citizen_id: citizenId
            },
            raw: true
        })
        return { found: count, user_info: rows }
    } catch (err) {
        throw err
    }
}

const getUserStatusTotal = async (officerId, officerRole) => {
    try {
        let userStatusTotal = {
            user_status_total: { all: 0 }
        }
        let queryStatus = {
            group: ['users.status'],
            attributes: ['status', [Sequelize.fn('COUNT', 'status'), 'statusCount']],
            where: {
                status: {
                    [Op.ne]: 'Deleted'
                },
            },
            subQuery: false,
            nest: true,
            raw: true
        }
        let queryReported = {
            where: {
                status: {
                    [Op.ne]: 'Deleted'
                },
                reported: {
                    [Op.eq] : true
                }
            },
            subQuery: false,
            nest: true,
            raw: true
        }
        if (officerRole === 'Collector') {
            queryStatus = Object.assign(queryStatus, {
                include: [{
                    model: models.officers,
                    as: 'officers',
                    attributes: { exclude: ['id', 'role', 'name', 'profile_image', 'email', 'password', 'secret', 'status', 'latest_modified'] },
                    through: { attributes: [] }
                }],
            })
            queryStatus['where'] = Object.assign(queryStatus['where'], {
                '$officers.id$': {
                    [Op.eq]: officerId
                }
            })
            queryReported = Object.assign(queryReported, {
                include: [{
                    model: models.officers,
                    as: 'officers',
                    attributes: { exclude: ['id', 'role', 'name', 'profile_image', 'email', 'password', 'secret', 'status', 'latest_modified'] },
                    through: { attributes: [] }
                }],
            })
            queryReported['where'] = Object.assign(queryReported['where'], {
                '$officers.id$': {
                    [Op.eq]: officerId
                }
            })
        }
        const {count, rows} = await models.users.findAndCountAll(queryReported)
        userStatusTotal['user_status_total']['reported'] = count
        const userStatusList = await models.users.findAll(queryStatus)
        for (let userStatus of userStatusList) {
            switch (userStatus.status) {
                case 'Created':
                    userStatusTotal['user_status_total']['created'] = +userStatus.statusCount
                    break
                case 'Approved':
                    userStatusTotal['user_status_total']['approved'] = +userStatus.statusCount
                    break
                case 'AI-Processing':
                    userStatusTotal['user_status_total']['ai-processing'] = +userStatus.statusCount
                    break
                case 'Export to Report':
                    userStatusTotal['user_status_total']['export_to_report'] = +userStatus.statusCount
                    break
                case 'Analyst Reviewed':
                    userStatusTotal['user_status_total']['analyst_reviewed'] = +userStatus.statusCount
                    break
                case 'Ready to Review':
                    userStatusTotal['user_status_total']['ready_to_review'] = +userStatus.statusCount
                    break
                case 'Disapproved':
                    userStatusTotal['user_status_total']['disapproved'] = +userStatus.statusCount
                    break
                case 'AI-Resulted':
                    userStatusTotal['user_status_total']['ai-resulted'] = +userStatus.statusCount
                    break
            }
            userStatusTotal['user_status_total']['all'] += +userStatus.statusCount
        }
        return userStatusTotalModel(userStatusTotal)
    } catch (err) {
        throw err
    }
}

const sendToAi = async (userIdList, officerId) => {
    try {
        const data = { user_id: userIdList }
        const api_url = process.env.NODE_ENV === 'production' ? 'http://icsco.3bbddns.com:43440/predicts/' : 'http://icsco.3bbddns.com:43441/predicts/'
        const response = await axios.post(api_url, data)
        if (response.data.status !== 'success')
            throw `Can't send to ai`
        for (let userId of userIdList) {
            await models.users.update({
                status: 'AI-Processing',
                latest_modified: dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
            },
                { where: { id: userId } })
            await operateService.operateUser(userId, officerId)
        }
        return { send_to_ai: userIdList }
    } catch (err) {
        throw err
    }
}

const exportRawData = async (userIdList, officerId) => {
    try {
        // *? Create Workbook
        const workbook = new ExcelJS.Workbook()
        workbook.creator = 'Mind Booster'
        workbook.created = dayjs().tz('Asia/Bangkok')

        // *? Create Worksheet
        const worksheet = workbook.addWorksheet('Users Data', { properties: { tabColor: { argb: '476AB0' } } })

        const analysisList = ['analyst', 'ai']
        const sideList = ['left', 'right']
        const fingerList = ['thumb', 'index', 'middle', 'ring', 'pinkie']
        const userInfoHeaderList = [
            'user_id', 'reference_code', 'mydna_id', 'finger_id', 'first_name', 'last_name', 'nick_name', 'phone', 'email', 'citizen_id', 'parent_name', 
            'perent_phone', 'remark', 'birth_date', 'gender', 'line_id', 'address', 'collector_id', 'collector_name', 'analyst_id', 'analyst_name'
        ]

        // *? First Row, Side Row Data
        let firstRowData = []
        let sideRowData = {}
        let fingeRowData = {}
        let userHeaderData = {}

        for (let userInfoHeader of userInfoHeaderList) {
            firstRowData.push({ header: '', key: `${userInfoHeader}`, width: 20 })
            userHeaderData[`${userInfoHeader}`] = `${userInfoHeader}`
        }

        for (let analysis of analysisList) {
            for (let side of sideList) {
                for (let finger of fingerList) {
                    // *? First Row
                    firstRowData.push({ header: `${analysis}`, key: `${analysis}_${side}_${finger}_type`, width: 12 })
                    firstRowData.push({ header: `${analysis}`, key: `${analysis}_${side}_${finger}_rc1`, width: 12 })
                    firstRowData.push({ header: `${analysis}`, key: `${analysis}_${side}_${finger}_rc2`, width: 12 })
                    // *? Side Row
                    sideRowData[`${analysis}_${side}_${finger}_type`] = `${side}`
                    sideRowData[`${analysis}_${side}_${finger}_rc1`] = `${side}`
                    sideRowData[`${analysis}_${side}_${finger}_rc2`] = `${side}`
                    // *? finger Row    
                    fingeRowData[`${analysis}_${side}_${finger}_type`] = `${finger}`
                    fingeRowData[`${analysis}_${side}_${finger}_rc1`] = `${finger}`
                    fingeRowData[`${analysis}_${side}_${finger}_rc2`] = `${finger}`

                    userHeaderData[`${analysis}_${side}_${finger}_type`] = `${analysis}_type`
                    userHeaderData[`${analysis}_${side}_${finger}_rc1`] = `${analysis}_rc1`
                    userHeaderData[`${analysis}_${side}_${finger}_rc2`] = `${analysis}_rc2`

                }
            }
        }

        // *? Add Row 1 (analysis)  
        worksheet.columns = firstRowData
        // *? Add Row 2 (side)
        worksheet.addRow(sideRowData)
        // *? Add Row 3 (finger)
        worksheet.addRow(fingeRowData)
        // *? Add Row 4 (user info header)
        worksheet.addRow(userHeaderData)

        // *? Get User Data
        for (let userId of userIdList) {
            const userInfo = await getUserInfo(userId)
            const operate = userInfo.user_info.officer
            const fingerprint = await fingerprintService.getUserFingerprint(userId)
            const collector = operate.filter((officer) => { return officer.role === 'Collector' })
            const analyst = operate.filter((officer) => { return officer.role === 'Analyst' })
            collector.sort((a, b) => dayjs(b.last_modify_time) - dayjs(a.last_modify_time))
            analyst.sort((a, b) => dayjs(b.last_modify_time) - dayjs(a.last_modify_time))

            if (userInfo.user_info.birth_date !== '') {
                const birthDate = dayjs(userInfo.user_info.birth_date, 'YYYY-MM-DD').format('DD/MM/YYYY')
                userInfo.user_info.birth_date = dayjs(birthDate, 'DD/MM/YYYY').toDate()
            }
            
            const userData = {
                user_id: userInfo.user_info.user_id,
                reference_code: userInfo.user_info.reference_code,
                mydna_id: userInfo.user_info.mydna_id,
                finger_id: userInfo.user_info.finger_id,
                first_name: userInfo.user_info.first_name,
                last_name: userInfo.user_info.last_name,
                nick_name: userInfo.user_info.nick_name,
                phone: `${userInfo.user_info.phone}`,
                email: userInfo.user_info.email,
                citizen_id: userInfo.user_info.citizen_id,
                parent_name: userInfo.user_info.parent_name,
                parent_phone: `${userInfo.user_info.parent_phone}`,
                remark: userInfo.user_info.remark,
                birth_date: userInfo.user_info.birth_date,
                gender: userInfo.user_info.gender,
                line_id: userInfo.user_info.line_id,
                address: userInfo.user_info.address,
                collector_id: collector.length > 0 ? collector[0].officer_id : '',
                collector_name: collector.length > 0 ? collector[0].name : '',
                analyst_id: analyst.length > 0 ? analyst[0].officer_id : '',
                analyst_name: analyst.length > 0 ? analyst[0].name : '',
                analyst_left_thumb_type: fingerprint.fingerprint.left.thumb.analyst_type,
                analyst_left_thumb_rc1: fingerprint.fingerprint.left.thumb.analyst_RC1,
                analyst_left_thumb_rc2: fingerprint.fingerprint.left.thumb.analyst_RC2,
                analyst_left_index_type: fingerprint.fingerprint.left.index.analyst_type,
                analyst_left_index_rc1: fingerprint.fingerprint.left.index.analyst_RC1,
                analyst_left_index_rc2: fingerprint.fingerprint.left.index.analyst_RC2,
                analyst_left_middle_type: fingerprint.fingerprint.left.middle.analyst_type,
                analyst_left_middle_rc1: fingerprint.fingerprint.left.middle.analyst_RC1,
                analyst_left_middle_rc2: fingerprint.fingerprint.left.middle.analyst_RC2,
                analyst_left_ring_type: fingerprint.fingerprint.left.ring.analyst_type,
                analyst_left_ring_rc1: fingerprint.fingerprint.left.ring.analyst_RC1,
                analyst_left_ring_rc2: fingerprint.fingerprint.left.ring.analyst_RC2,
                analyst_left_pinkie_type: fingerprint.fingerprint.left.pinkie.analyst_type,
                analyst_left_pinkie_rc1: fingerprint.fingerprint.left.pinkie.analyst_RC1,
                analyst_left_pinkie_rc2: fingerprint.fingerprint.left.pinkie.analyst_RC2,
                analyst_right_thumb_type: fingerprint.fingerprint.right.thumb.analyst_type,
                analyst_right_thumb_rc1: fingerprint.fingerprint.right.thumb.analyst_RC1,
                analyst_right_thumb_rc2: fingerprint.fingerprint.right.thumb.analyst_RC2,
                analyst_right_index_type: fingerprint.fingerprint.right.index.analyst_type,
                analyst_right_index_rc1: fingerprint.fingerprint.right.index.analyst_RC1,
                analyst_right_index_rc2: fingerprint.fingerprint.right.index.analyst_RC2,
                analyst_right_middle_type: fingerprint.fingerprint.right.middle.analyst_type,
                analyst_right_middle_rc1: fingerprint.fingerprint.right.middle.analyst_RC1,
                analyst_right_middle_rc2: fingerprint.fingerprint.right.middle.analyst_RC2,
                analyst_right_ring_type: fingerprint.fingerprint.right.ring.analyst_type,
                analyst_right_ring_rc1: fingerprint.fingerprint.right.ring.analyst_RC1,
                analyst_right_ring_rc2: fingerprint.fingerprint.right.ring.analyst_RC2,
                analyst_right_pinkie_type: fingerprint.fingerprint.right.pinkie.analyst_type,
                analyst_right_pinkie_rc1: fingerprint.fingerprint.right.pinkie.analyst_RC1,
                analyst_right_pinkie_rc2: fingerprint.fingerprint.right.pinkie.analyst_RC2,
                ai_left_thumb_type: fingerprint.fingerprint.left.thumb.ai_type,
                ai_left_thumb_rc1: fingerprint.fingerprint.left.thumb.ai_RC1,
                ai_left_thumb_rc2: fingerprint.fingerprint.left.thumb.ai_RC2,
                ai_left_index_type: fingerprint.fingerprint.left.index.ai_type,
                ai_left_index_rc1: fingerprint.fingerprint.left.index.ai_RC1,
                ai_left_index_rc2: fingerprint.fingerprint.left.index.ai_RC2,
                ai_left_middle_type: fingerprint.fingerprint.left.middle.ai_type,
                ai_left_middle_rc1: fingerprint.fingerprint.left.middle.ai_RC1,
                ai_left_middle_rc2: fingerprint.fingerprint.left.middle.ai_RC2,
                ai_left_ring_type: fingerprint.fingerprint.left.ring.ai_type,
                ai_left_ring_rc1: fingerprint.fingerprint.left.ring.ai_RC1,
                ai_left_ring_rc2: fingerprint.fingerprint.left.ring.ai_RC2,
                ai_left_pinkie_type: fingerprint.fingerprint.left.pinkie.ai_type,
                ai_left_pinkie_rc1: fingerprint.fingerprint.left.pinkie.ai_RC1,
                ai_left_pinkie_rc2: fingerprint.fingerprint.left.pinkie.ai_RC2,
                ai_right_thumb_type: fingerprint.fingerprint.right.thumb.ai_type,
                ai_right_thumb_rc1: fingerprint.fingerprint.right.thumb.ai_RC1,
                ai_right_thumb_rc2: fingerprint.fingerprint.right.thumb.ai_RC2,
                ai_right_index_type: fingerprint.fingerprint.right.index.ai_type,
                ai_right_index_rc1: fingerprint.fingerprint.right.index.ai_RC1,
                ai_right_index_rc2: fingerprint.fingerprint.right.index.ai_RC2,
                ai_right_middle_type: fingerprint.fingerprint.right.middle.ai_type,
                ai_right_middle_rc1: fingerprint.fingerprint.right.middle.ai_RC1,
                ai_right_middle_rc2: fingerprint.fingerprint.right.middle.ai_RC2,
                ai_right_ring_type: fingerprint.fingerprint.right.ring.ai_type,
                ai_right_ring_rc1: fingerprint.fingerprint.right.ring.ai_RC1,
                ai_right_ring_rc2: fingerprint.fingerprint.right.ring.ai_RC2,
                ai_right_pinkie_type: fingerprint.fingerprint.right.pinkie.ai_type,
                ai_right_pinkie_rc1: fingerprint.fingerprint.right.pinkie.ai_RC1,
                ai_right_pinkie_rc2: fingerprint.fingerprint.right.pinkie.ai_RC2,
            }

            // *? Add User Data Row
            worksheet.addRow(userData)
        }

        // *? Merge and set styles
        worksheet.eachRow((row, rowNumber) => {
            let addressCell = []
            let cellData = []
            let startMergeCell = ''
            const endCell = row.cellCount
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                if (rowNumber <= 4) {
                    const i = colNumber - 1
                    addressCell.push(cell.address)
                    cellData.push(cell.value)
                    if (colNumber !== 1) {
                        if (cellData[i - 1] !== cellData[i]) {
                            worksheet.mergeCells(`${startMergeCell}:${addressCell[i - 1]}`)
                            startMergeCell = addressCell[i]
                        }
                        if (colNumber === endCell)
                            worksheet.mergeCells(`${startMergeCell}:${addressCell[i]}`)
                    } else {
                        startMergeCell = addressCell[i]
                    }
                    if (cell.value !== '' && cell.value !== null) {
                        cell.alignment = { vertical: 'middle', horizontal: 'center' }
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        }
                    }
                    if (rowNumber < 4) {
                        if (cell.value === 'analyst')
                            cell.fill = fillBackgroundModel('C9D9F7')
                        if (cell.value === 'ai')
                            cell.fill = fillBackgroundModel('FFF2CE')
                        if (cell.value === 'left')
                            cell.fill = fillBackgroundModel('F8CC9F')
                        if (cell.value === 'right')
                            cell.fill = fillBackgroundModel('B6D7A9')
                        if (cell.value === 'thumb')
                            cell.fill = fillBackgroundModel('DCD9C6')
                        if (cell.value === 'index')
                            cell.fill = fillBackgroundModel('DFBAB8')
                        if (cell.value === 'middle')
                            cell.fill = fillBackgroundModel('CAC1D8')
                        if (cell.value === 'ring')
                            cell.fill = fillBackgroundModel('BEDDE6')
                        if (cell.value === 'pinkie')
                            cell.fill = fillBackgroundModel('F6EB9D')
                    } else {
                        cell.fill = fillBackgroundModel('CCCCCC')
                    }
                }
            })
        })

        // *? Save file
        const fileName = `export_users_${dayjs().tz('Asia/Bangkok').format('YYYYMMDDTHHmmss')}.xlsx`
        const tmpobj = tmp.dirSync()
        const pathSource = `${tmpobj.name}/${fileName}`
        await workbook.xlsx.writeFile(pathSource)

        // *? upload file to storage
        const pathDestination = `export-raw-data/${fileName}`
        const accessToken = uuid4()
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

        // *? Update User Status 'Export to Report'
        for (let userId of userIdList) {
            await models.users.update({
                status: 'Export to Report',
                latest_modified: dayjs().tz('Asia/Bangkok').format('YYYY-MM-DDTHH:mm:ss')
            }, { where: { id: userId } })
            await operateService.operateUser(userId, officerId)
        }

        const url = bucket.file(pathDestination)
        return url.publicUrl()
    } catch (err) {
        throw err
    }
}

const importData = async (importUrl, officerId) => {
    try {
        let importList = []
        let notImportList = []
        const tmpobj = tmp.dirSync()
        const pathFile = `${tmpobj.name}/user_data.xlsx`
        await utils.downloadFile(importUrl, pathFile)
        const schema = {
            'client_id': { prop: 'client_id', type: String },
            'reference_code': { prop: 'reference_code', type: String },
            'mydna_id': { prop: 'mydna_id', type: String },
            'first_name': { prop: 'first_name', type: String },
            'last_name': { prop: 'last_name', type: String },
            'nick_name': { prop: 'nick_name', type: String },
            'phone': { prop: 'phone', type: String },
            'email': { prop: 'email', type: String },
            'citizen_id': { prop: 'citizen_id', type: String },
            'parent_name': { prop: 'parent_name', type: String },
            'parent_phone': { prop: 'parent_phone', type: String },
            'remark': { prop: 'remark', type: String },
            'birth_date': { prop: 'birth_date', type: Date },
            'gender': { prop: 'gender', type: String },
            'line_id': { prop: 'line_id', type: String },
            'address': { prop: 'address', type: String }
        }
        const userDataList = await readXlsxFile(`${pathFile}`, {schema})
        for (let userData of userDataList.rows) {
            if (userData.phone) 
                userData.phone = userData.phone.toString().split('')[0] !== '0' ? `0${userData.phone}` : userData.phone
            if (userData.parent_phone) 
                userData.parent_phone = userData.parent_phone.toString().split('')[0] !== '0' ? `0${userData.parent_phone}` : userData.parent_phone
            if (userData.gender) 
                userData.gender = userData.gender.toLowerCase()

            let query = {
                where : {
                    [Op.or] : []
                },
                raw : true
            }   
            if (userData.client_id) {
                query['where'][Op.or].push({id: userData.client_id})
            }
            if (userData.reference_code) {
                query['where'][Op.or].push({reference_code: userData.reference_code})
            }
            let user = await models.users.findOne(query)    

            if (user) {
                let dupCitizen = false
                let dupEmail = false
                // *? Check citizen is duplicate
                if (userData.citizen_id) {
                    const citiZen = await checkCitizenDuplicated(userData.citizen_id.toString()) 
                    if (citiZen.found > 0 && citiZen.user_info[0].id !== user.id)
                        dupCitizen = true
                }
                // *? Check email is duplicate
                if (userData.email) {
                    const officer = await officerService.getOfficerByEmail(userData.email)
                    if (officer)
                        dupEmail = true
                }
                if (!dupCitizen && !dupEmail) {
                    const updateUser = await updateUserInfo(user.id, userData)
                    // *? Update user info
                    if (updateUser) {
                        await operateService.operateUser(user.id, officerId)
                        importList.push({user_id : userData.client_id || '', reference_code : userData.reference_code || '', status : 'อัพเดทข้อมูลผู้ใช้สำเร็จ'})
                    } else {
                        notImportList.push({user_id : userData.client_id || '', reference_code : userData.reference_code || '', status : 'ไม่สามารถอัพเดทข้อมูลผู้ใช้ได้'})
                    }
                } else {
                    notImportList.push({user_id : userData.client_id || '', reference_code : userData.reference_code || '', status : 'ไม่สามารถอัพเดทข้อมูลผู้ใช้ได้'})
                }
            } else {
                let dupCitizen = false
                let dupEmail = false
                // *? Check citizen is duplicate
                if (userData.citizen_id) {
                    const citiZen = await checkCitizenDuplicated(userData.citizen_id.toString()) 
                    if (citiZen.found > 0)
                        dupCitizen = true
                } 
                // *? Check email is duplicate
                if (userData.email) {
                    const officer = await officerService.getOfficerByEmail(userData.email)
                    if (officer)
                        dupEmail = true
                }
                if (!dupCitizen && !dupEmail) {
                    const id = uuid()
                    const report = await reportService.createReport(id)
                    const fingerprint = await fingerprintService.createFingerprint(id)
                    const sideFinger = await sideFingertService.createSideFinger(fingerprint.id)
                    await fingerprintAngleService.createFingerprintAngle(sideFinger)
                    const user = await createUserInfo(id, userData, fingerprint.id, report.id)
                    await operateService.createOperate(user.id, officerId)
                    importList.push({user_id : user.id || '', reference_code : user.reference_code || '', status : 'เพิ่มข้อมูลผู้ใช้สำเร็จ'})
                } else {
                    notImportList.push({user_id : userData.client_id || '', reference_code : userData.reference_code || '', status : 'ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้'})
                }
            }
        }
        rimraf.sync(pathFile)
        tmpobj.removeCallback()
        return { imported: importList, not_imported: notImportList }
    } catch (err) {
        throw err
    }
}

const importReport = async (importUrl, officerId) => {
    try {
        let importList = []
        let notImportList = []
        const tmpobj = tmp.dirSync()
        const pathFile = `${tmpobj.name}/report.xlsx`
        await utils.downloadFile(importUrl, pathFile)
        const schema = {
            'client_id': { prop: 'client_id', type: String },
            'reference_code': { prop: 'reference_code', type: String },
            'mydna_id': { prop: 'mydna_id', type: String },
            'first_name': { prop: 'first_name', type: String },
            'last_name': { prop: 'last_name', type: String },
            'nick_name': { prop: 'nick_name', type: String },
            'class': { prop: 'class', type: String },
            'avg_pre': { prop: 'avg_pre', type: Number },
            'acha_01': { prop: 'acha_01', type: String },
            'acha_02': { prop: 'acha_02', type: String },
            'acha_03': { prop: 'acha_03', type: String },
            'acha_04': { prop: 'acha_04', type: String },
            'fcha_01': { prop: 'fcha_01', type: String },
            'fcha_02': { prop: 'fcha_02', type: String },
            'fcha_03': { prop: 'fcha_03', type: String },
            'fcha_04': { prop: 'fcha_04', type: String },
            'scha_01': { prop: 'scha_01', type: String },
            'scha_02': { prop: 'scha_02', type: String },  
            'mcha_01': { prop: 'mcha_01', type: String },
            'mcha_02': { prop: 'mcha_02', type: String },
            'mcha_03': { prop: 'mcha_03', type: String },
            'mcha_04': { prop: 'mcha_04', type: String },
            'mcha_11': { prop: 'mcha_11', type: String },
            'mcha_12': { prop: 'mcha_12', type: String },
            'mcha_13': { prop: 'mcha_13', type: String },
            'mcha_14': { prop: 'mcha_14', type: String },
            'dver_ww': { prop: 'dver_ww', type: String },
            'dver_wp': { prop: 'dver_wp', type: String },
            'dver_pw': { prop: 'dver_pw', type: String },
            'dver_pp': { prop: 'dver_pp', type: String },
            'dver': { prop: 'dver', type: String },
            'lsty_cp': { prop: 'lsty_cp', type: String },
            'lsty_rp': { prop: 'lsty_rp', type: String },
            'lsty_kp': { prop: 'lsty_kp', type: String },
            'lsty_ap': { prop: 'lsty_ap', type: String },
            'lsty_vp': { prop: 'lsty_vp', type: String },
            'pre_l1': { prop: 'pre_l1', type: Number },
            'pre_l2': { prop: 'pre_l2', type: Number },
            'pre_l3': { prop: 'pre_l3', type: Number },
            'pre_l4': { prop: 'pre_l4', type: Number },
            'pre_l5': { prop: 'pre_l5', type: Number},
            'pre_r1': { prop: 'pre_r1', type: Number },
            'pre_r2': { prop: 'pre_r2', type: Number },
            'pre_r3': { prop: 'pre_r3', type: Number },
            'pre_r4': { prop: 'pre_r4', type: Number },
            'pre_r5': { prop: 'pre_r5', type: Number},
            'post_l1': { prop: 'post_l1', type: Number },
            'post_l2': { prop: 'post_l2', type: Number },
            'post_l3': { prop: 'post_l3', type: Number },
            'post_l4': { prop: 'post_l4', type: Number },
            'post_l5': { prop: 'post_l5', type: Number},
            'post_r1': { prop: 'post_r1', type: Number },
            'post_r2': { prop: 'post_r2', type: Number },
            'post_r3': { prop: 'post_r3', type: Number },
            'post_r4': { prop: 'post_r4', type: Number },
            'post_r5': { prop: 'post_r5', type: Number},
            'a_l1': { prop: 'a_l1', type: Number },
            'a_l2': { prop: 'a_l2', type: Number },
            'a_l3': { prop: 'a_l3', type: Number },
            'a_l4': { prop: 'a_l4', type: Number },
            'a_l5': { prop: 'a_l5', type: Number},
            'a_r1': { prop: 'a_r1', type: Number },
            'a_r2': { prop: 'a_r2', type: Number },
            'a_r3': { prop: 'a_r3', type: Number },
            'a_r4': { prop: 'a_r4', type: Number },
            'a_r5': { prop: 'a_r5', type: Number},
            'pre_act_01': { prop: 'pre_act_01', type: Number},
            'pre_act_02': { prop: 'pre_act_02', type: Number},
            'pre_act_03': { prop: 'pre_act_03', type: Number},
            'pre_act_04': { prop: 'pre_act_04', type: Number},
            'pre_act_05': { prop: 'pre_act_05', type: Number},
            'pre_act_06': { prop: 'pre_act_06', type: Number},
            'pre_act_07': { prop: 'pre_act_07', type: Number},
            'pre_act_08': { prop: 'pre_act_08', type: Number},
            'pre_act_09': { prop: 'pre_act_09', type: Number},
            'pre_act_10': { prop: 'pre_act_10', type: Number},
            'pre_act_11': { prop: 'pre_act_11', type: Number},
            'pre_act_12': { prop: 'pre_act_12', type: Number},
            'pre_act_13': { prop: 'pre_act_13', type: Number},
            'pre_act_14': { prop: 'pre_act_14', type: Number},
            'pre_act_15': { prop: 'pre_act_15', type: Number},
            'post_act_01': { prop: 'post_act_01', type: Number},
            'post_act_02': { prop: 'post_act_02', type: Number},
            'post_act_03': { prop: 'post_act_03', type: Number},
            'post_act_04': { prop: 'post_act_04', type: Number},
            'post_act_05': { prop: 'post_act_05', type: Number},
            'post_act_06': { prop: 'post_act_06', type: Number},
            'post_act_07': { prop: 'post_act_07', type: Number},
            'post_act_08': { prop: 'post_act_08', type: Number},
            'post_act_09': { prop: 'post_act_09', type: Number},
            'post_act_10': { prop: 'post_act_10', type: Number},
            'post_act_11': { prop: 'post_act_11', type: Number},
            'post_act_12': { prop: 'post_act_12', type: Number},
            'post_act_13': { prop: 'post_act_13', type: Number},
            'post_act_14': { prop: 'post_act_14', type: Number},
            'post_act_15': { prop: 'post_act_15', type: Number},
            'a_act_01': { prop: 'a_act_01', type: Number},
            'a_act_02': { prop: 'a_act_02', type: Number},
            'a_act_03': { prop: 'a_act_03', type: Number},
            'a_act_04': { prop: 'a_act_04', type: Number},
            'a_act_05': { prop: 'a_act_05', type: Number},
            'a_act_06': { prop: 'a_act_06', type: Number},
            'a_act_07': { prop: 'a_act_07', type: Number},
            'a_act_08': { prop: 'a_act_08', type: Number},
            'a_act_09': { prop: 'a_act_09', type: Number},
            'a_act_10': { prop: 'a_act_10', type: Number},
            'a_act_11': { prop: 'a_act_11', type: Number},
            'a_act_12': { prop: 'a_act_12', type: Number},
            'a_act_13': { prop: 'a_act_13', type: Number},
            'a_act_14': { prop: 'a_act_14', type: Number},
            'a_act_15': { prop: 'a_act_15', type: Number}
        }

        const reportDataList = await readXlsxFile(`${pathFile}`, {schema})
        for (let reportData of reportDataList.rows) {
            if (reportData.dver_ww)
                reportData.dver_ww = `${(reportData.dver_ww * 100).toFixed(2)}%`
            if (reportData.dver_wp)
                reportData.dver_wp = `${(reportData.dver_wp * 100).toFixed(2)}%`
            if (reportData.dver_pw)
                reportData.dver_pw = `${(reportData.dver_pw * 100).toFixed(2)}%`
            if (reportData.dver_pp)
                reportData.dver_pp = `${(reportData.dver_pp * 100).toFixed(2)}%`
            if (reportData.lsty_cp)
                reportData.lsty_cp = `${(reportData.lsty_cp * 100).toFixed(2)}%`
            if (reportData.lsty_rp)
                reportData.lsty_rp = `${(reportData.lsty_rp * 100).toFixed(2)}%`
            if (reportData.lsty_kp)
                reportData.lsty_kp = `${(reportData.lsty_kp * 100).toFixed(2)}%`
            if (reportData.lsty_ap)
                reportData.lsty_ap = `${(reportData.lsty_ap * 100).toFixed(2)}%`
            if (reportData.lsty_vp)
                reportData.lsty_vp = `${(reportData.lsty_vp * 100).toFixed(2)}%`

            let query = {
                where : {
                    [Op.or] : []
                },
                raw : true
            }   
            if (reportData.client_id) {
                query['where'][Op.or].push({id: reportData.client_id})
            }
            if (reportData.reference_code) {
                query['where'][Op.or].push({reference_code: reportData.reference_code})
            }

            let report = await models.users.findOne(query)    
            if (!reportData.client_id && !reportData.reference_code)
                report = null

            if (report) {
                const updateReport = await reportService.updateReport(report.report_id, reportData)
                 // *? Update Report of user
                if (updateReport) {
                    const userData = {
                        status : 'Reported',
                        reported : true
                    }
                    if (reportData.reference_code)
                        userData['reference_code'] = reportData.reference_code
                    if (reportData.mydna_id)
                        userData['mydna_id'] = reportData.mydna_id
                    const updateUser = await updateUserInfo(report.id, userData)
                    // *? Update Status Reported to user
                    if (updateUser) {
                        await operateService.operateUser(report.id, officerId)
                        importList.push({user_id : reportData.client_id || '', reference_code : reportData.reference_code || '', status : 'นำเข้าข้อมูลรายงานสำเร็จ'})
                    } else {
                        notImportList.push({user_id : reportData.client_id || '', reference_code : reportData.reference_code || '', status : 'ไม่สามารถอัพเดทรายงานได้'})
                    }
                } else {
                    notImportList.push({user_id : reportData.client_id || '', reference_code : reportData.reference_code || '', status : 'ไม่สามารถอัพเดทรายงานได้'})
                }
            } else {
                notImportList.push({user_id : reportData.client_id || '', reference_code : reportData.reference_code || '', status : 'ไม่สามารถนำเข้าข้อมูลรายงานได้'})
            }
        }
        rimraf.sync(pathFile)
        tmpobj.removeCallback()
        return { imported: importList, not_imported: notImportList }
    } catch (err) {
        throw err
    }
}

const getUserStatusAiProcessing = async () => {
    try {
        const { count, rows } = await models.users.findAndCountAll({
            where: {
                status: 'AI-Processing'
            },
            raw: true
        })
        return { found: count, user_info: rows }
    } catch (err) {
        throw err
    }
}

const getUserByEmail = async (email) => {
    try {
        const user = await models.users.findOne({
            where: {
                email : {
                    [Op.iLike]: email
                },
                status: {
                    [Op.ne]: 'Deleted'
                }
            },
            raw: true
        })
        return user
    } catch (err) {
        throw err
    }
}

const getUserReport = async (userId) => {
    try {
        const user = await models.users.findOne({
            where: { id: userId },
            include: ['reports'],
            nest: true,
            raw: true
        })
        return userReportModel(user)
    } catch (err) {
        throw err
    }
}

const sendUserReport = async (userIdList, officerId) => {
    try {
        let sendReportList = []
        let notSendReportList = []
        for (let userId of userIdList) {
            const user = await models.users.findByPk(userId, { raw: true })
            if (user && user.reported === true && user.email !== null && user.email !== '') {
                // const officer = await officerService.getOfficerByEmail(user.email)
                if (user.password === null || user.password === '') {
                    const password = generator.generate({
                        length: 10,
                        numbers: true
                    })
                    const encryptPassword = await bcrypt.hashSync(password, 14)
                    const updatePassword = await updateUserInfo(userId, { password: encryptPassword })
                    if (updatePassword) {
                        const mailData = await mailService.sendReportNewPassMailDataModel(user.email, password, userId, user.first_name, user.last_name, user.nick_name)
                        await mailService.sendEmails(mailData)
                        await operateService.operateUser(userId, officerId)
                        sendReportList.push(userId)
                    } else {
                        notSendReportList.push(userId)
                    }
                } else {
                    const mailData = await mailService.sendReportMailDataModel(user.email, userId, user.first_name, user.last_name, user.nick_name)
                    await mailService.sendEmails(mailData)
                    await operateService.operateUser(userId, officerId)
                    sendReportList.push(userId)
                }
            } else {
                notSendReportList.push(userId)
            }
        }
        return { send_reported: sendReportList, not_send_reported: notSendReportList }
    } catch (err) {
        throw err
    }
}

// * Export Services
module.exports.getUserInfo = getUserInfo
module.exports.createUserInfo = createUserInfo
module.exports.updateUserInfo = updateUserInfo
module.exports.getAllUserList = getAllUserList
module.exports.deleteUser = deleteUser
module.exports.geUserList = geUserList
module.exports.getUserStatusTotal = getUserStatusTotal
module.exports.checkCitizenDuplicated = checkCitizenDuplicated
module.exports.sendToAi = sendToAi
module.exports.exportRawData = exportRawData
module.exports.importData = importData
module.exports.importReport = importReport
module.exports.getUserStatusAiProcessing = getUserStatusAiProcessing
module.exports.getUserByEmail = getUserByEmail
module.exports.getUserReport = getUserReport
module.exports.sendUserReport = sendUserReport
