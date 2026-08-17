<template>
<div class="user-profile">
  <div class="pa-3 content background-main">
       <!-- Loading -->
        <v-dialog 
            content-class="loading-ai-processing" 
            v-model="isAIProcessing" 
            width="40%" 
            persistent
            >
            <v-card class="pt-10 py-8 text-center">
                <div>
                    <img src="../../assets/logo mind booster.png" width="35%">
                </div>
                <div class="mx-15">
                    <v-progress-linear
                        height="10"
                        indeterminate
                        color="orange"
                        rounded
                    ></v-progress-linear>
                </div> 
                <div class="mt-7">
                    <div class="font-bold font-loading">
                        AI กำลังประมวลผล กรุณารอสักครู่...
                    </div>
                    <div class="font-bold font-loading">
                        ระหว่างรอสามารถกดปุ่มย้อนกลับเพื่อทำขั้นตอนอื่นๆ ได้
                    </div>
                </div>
                 <div class="mt-7">
                    <v-btn class="mx-3" width="100" dark color="#466BB2" :to="{ name: 'UserList' }">
                     ย้อนกลับ
                    </v-btn>
                    <v-btn class="mx-3" width="100" dark color="#74B9FF" @click="refreshPage()">
                     รีเฟรช
                    </v-btn>
                 </div>
            </v-card>
        </v-dialog>

        <v-alert v-if="isLocalData && isOnline" color="#F7D09D" tile>
           <span style="color: #E66E32;" ><v-icon color="#E66E32">icon-Information_icon</v-icon> กรุณาซิงค์ข้อมูลผู้ใช้อีกครั้ง <a class="sync-link" @click="isSave = true">ซิงค์ข้อมูล</a></span> 
        </v-alert>
      <!-- Form Information panel -->
        <form-user-information 
            v-if="user !== null" 
            :userInfo="user"
            :save="isSave"
            @save="setValueSave"
            @create="updateUserInfo"
            ></form-user-information>
        <!-- Form Figerprint panel -->
        <form-user-fingerprints 
            v-if="fingerPrint !== null" 
            :fingerPrintInfo="fingerPrint"
            :save="isSaveFingerprint"
            @save="isSaveFingerprint=false"
            @create="updateFingerPrint"
            @imageExisting="getStatusImageExisting"
        >
        </form-user-fingerprints>
        
        <!-- Action button -->
        <div class="floating-button" style="display: flex">
            <div class="mr-3" v-if="isOnline && getStatus === 'Reported'">
                <v-btn x-large fab dark color="#0F6939" @click="getUserReport(user.user_id)">
                    <v-icon>icon-result_icon</v-icon>
                </v-btn>
            </div>
            <div class="mr-3" v-if="checkOpenFeedbackDialog()">
                <v-menu v-model="popupDisapprove" top offset-y :close-on-content-click="false">
                    <template v-slot:activator="{ on }">
                        <div v-on="on">
                            <v-btn v-if="feedbackDisapprove !== ''" x-large fab dark color="#EC0927">
                                <v-icon>icon-Alert_icon</v-icon>
                            </v-btn>
                            <v-btn v-else x-large fab dark color="#C5C5C5">
                                <v-icon>icon-Alert_icon</v-icon>
                            </v-btn>
                        </div>
                    </template>
                    <v-card :width="350" class="text-center profile-box">
                        <v-card-title>รายงานข้อผิดพลาด:</v-card-title>
                        <v-card-actions class="pb-0">
                            <v-textarea
                                outlined
                                name="input-7-4"
                                v-model="feedbackDisapprove"
                                :readonly="isReadFeedbackOnly"
                            ></v-textarea>                            
                        </v-card-actions>
                        <div class="pb-3" v-if="isEditFeedback">
                            <v-btn 
                                dark 
                                color="#466BB2"
                                @click="updateDisapprove()"
                            >
                                บันทึก
                            </v-btn>
                        </div>
                    </v-card>
                </v-menu>
            </div>
            <div class="mr-3" v-if="userProfile !== null && userProfile.role === 'Analyst'">
                <v-btn 
                    v-if="isOnline && hasImage && (getStatus !== 'Created' && getStatus !== 'Ready to Review' && getStatus !== 'Disapproved')"  
                    x-large 
                    fab 
                    dark 
                    color="#2ECC71"
                    @click="sendToAIWithApi()"
                >
                    <span style="font-size: 24pt">AI</span>
                </v-btn>
                <v-btn v-else x-large fab dark color="#C5C5C5">
                    <span style="font-size: 24pt">AI</span>
                </v-btn>
            </div>
            <div v-if="isLocalData && isOnline">
                <v-btn v-if="getStatus === 'AI-Processing'" x-large fab dark color="#FFAF40">
                    <v-icon size="40">icon-icon-sync</v-icon>
                </v-btn>
                <v-btn v-else x-large fab dark color="#FFAF40" @click="isSave = true">
                    <v-icon size="40">icon-icon-sync</v-icon>
                </v-btn>
            </div>
            <div v-else>
                <v-btn v-if="getStatus === 'AI-Processing'" x-large fab dark color="#C5C5C5">
                    <v-icon>icon-Save_icon</v-icon>
                </v-btn>
                <v-btn v-else x-large fab dark color="#74B9FF" @click="isSave = true">
                    <v-icon>icon-Save_icon</v-icon>
                </v-btn>
            </div>
        </div>
  </div>
</div>

</template>
<script>
import FormUserInformation from '../../components/user-list/FormUserInformation.vue'
import { apiUrl } from '../../utils/url'
import { storage  } from '../../utils/firebase'
import axios from 'axios'
import dayjs, { locale } from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.extend(buddhistEra)
import uuid from 'uuid'

import FormUserFingerprints from '../../components/user-list/FormUserFingerprints.vue';

const STORAGE_REF = storage.ref()

export default {
    name: 'user',
    components: {
        FormUserFingerprints,
        FormUserInformation
    },
    data() {
        return {
            isEditFeedback: false,
            isReadFeedbackOnly: false,
            feedbackDisapprove: '',
            popupDisapprove: false,
            userID: '',
            user: null,
            fingerPrint: null,
            isSave: false,
            isSaveFingerprint: false,
            hasImage: false,
            isAIProcessing: false,
            localDB: null,
            localUserData: null
        }
    },
    computed: {
        getStatus () {
            return this.$store.state.status
        },
        getUserID () {
            return this.$route.params.clientId
        },
        userProfile () {
            return this.$store.state.currentUser
        },
        isOnline () {
            return this.$store.state.isOnline
        },
        isLocalData () {
            return this.$store.state.isLocalData
        }
    },
    watch: {
        getStatus (val) {
            this.checkFeedBack()
        },
        async isOnline (val) {
            if (val) {
                if (this.userProfile !== null) {
                    this.localDB = await this.$store.dispatch('getLocalDB')
                    let userInfo = await this.getUserFromLocalDB()
                    if (userInfo === undefined) {
                        this.$store.commit('SET_IS_LOCAL_DATA', false)
                        this.getInitailData()
                    } else {
                        this.$store.commit('SET_IS_LOCAL_DATA', true)
                        this.getInitailLocalData()
                    }
                }
            } else {
                this.localDB = await this.$store.dispatch('getLocalDB')
                let userInfo = await this.getUserFromLocalDB()
                if (userInfo === undefined) {
                    this.$router.push({ name: "UserList" })
                } else {
                    this.$store.commit('SET_IS_LOCAL_DATA', true)
                    this.getInitailLocalData()
                }
            }
        }
    },
    async created() {
        await this.$store.dispatch('getUserProfile')  
        
        if (this.isOnline) {
            if (this.userProfile !== null) {
                this.localDB = await this.$store.dispatch('getLocalDB')
                let userInfo = await this.getUserFromLocalDB()
                if (userInfo === undefined) {
                    this.$store.commit('SET_IS_LOCAL_DATA', false)
                    this.getInitailData()
                } else {
                    this.$store.commit('SET_IS_LOCAL_DATA', true)
                    this.getInitailLocalData()
                }
            }
        } else {
            this.getInitailLocalData()
        }
    },
    mounted() {
        this.checkFeedBack()
    },
    methods: {
         async checkUserlistInLocalDB () {
            this.localDB = await this.$store.dispatch('getLocalDB')
            return await this.getUsersFromLocalDB()
        },
        async getUsersFromLocalDB() {
            return new Promise((resolve, reject) => {

                let trans = this.localDB.transaction(['tb_users'],'readonly')
                trans.oncomplete = e => {
                resolve(users);
                };
                
                let store = trans.objectStore('tb_users');
                let users = [];
                
                store.openCursor().onsuccess = e => {
                let cursor = e.target.result;
                if (cursor) {
                    users.unshift(cursor.value)
                    cursor.continue()
                }
                }
            })
        },
        checkFeedBack() {
            if (this.userProfile !== null) {
                if (this.userProfile.role === 'Analyst') {
                    if (this.getStatus === 'Disapproved') {
                            this.isEditFeedback = true 
                            this.isReadFeedbackOnly = false
                    } else {
                        this.isEditFeedback = true
                        this.isReadFeedbackOnly = true
                    }
                } else if (this.userProfile.role === 'Collector') {
                    if (this.getStatus === 'Disapproved') {
                        this.isEditFeedback = true 
                        this.isReadFeedbackOnly = true
                    } else {
                        this.isEditFeedback = false
                        this.isReadFeedbackOnly = true
                    }
                }
            }
        },
        checkOpenFeedbackDialog () {
            if (this.userProfile !== null) {
                if (this.userProfile.role === 'Collector') {
                    if ((this.getStatus === 'Disapproved' || this.getStatus === 'Ready to Review') && this.feedbackDisapprove !== '') {
                        return true
                    } else {
                        return false
                    }
                } else if (this.userProfile.role === 'Analyst') {
                    if (this.getStatus === 'Disapproved') {
                        return true
                    } else if (this.getStatus === 'Ready to Review' && this.feedbackDisapprove !== '') {
                        return true
                    } else {
                        return false
                    }
                } else {
                    return false
                }
            }
        },
        async getInitailData() {
            this.setLoading(true)

            this.user = null
            this.fingerPrint = null

            this.user = await this.getUserInfo()
            this.fingerPrint = await this.getFingerPrint()

            if (this.getStatus === 'AI-Processing') {
                this.isAIProcessing = true
            }
            
            this.feedbackDisapprove = this.user.disapproved_report
            this.checkImageExisting()
            this.setLoading(false)
        },
        async getInitailLocalData () {
            this.setLoading(true)
            this.localDB = await this.$store.dispatch('getLocalDB')
            this.user = await this.getUserFromLocalDB()
            this.localUserData = Object.assign({}, this.user) 
            this.fingerPrint = await this.getFingerprintFromLocalDB()

            if (this.getStatus === 'AI-Processing') {
                this.isAIProcessing = true
            }
            this.feedbackDisapprove = this.user.disapproved_report
            this.setLoading(false)
        },
        async getUserInfo () {
                let header = { 'access_token': this.userProfile.access_token }
                return axios.get(apiUrl + "/users/"+this.getUserID,  { headers: header })
                .then((response) => {
                    if (response.data.status === 'success') {
                        return response.data.result.user_info
                    }
                })
                .catch(async (error) => {
                    let errorMessage = error.response.data.message_error
                    if (errorMessage === 'Access token expired') {
                      await this.$store.dispatch('refreshToken')
                      this.getInitailData()
                    }
                })
        },
       async getFingerPrint () {
            let header = { 'access_token': this.userProfile.access_token }
            return axios.get(apiUrl + "/users/"+this.getUserID+"/fingerprint", { headers: header })
                .then((response) => {
                    if (response.data.status === 'success') {
                        return response.data.result
                    }
                })
                .catch(async (error) => {
                    let errorMessage = error.response.data.message_error
                    if (errorMessage === 'Access token expired') {
                       await this.$store.dispatch('refreshToken')
                        this.getInitailData()
                    }
                })
        },
        async checkImageExisting() {
            var user_id = [this.getUserID]
            this.hasImage = await this.$store.dispatch('checkImageExisting', user_id)            
        },
        dateFormatToAPI(date) {
            if (date !== undefined) {
                return dayjs(date).format("YYYY-MM-DDTHH:mm:ss");
            } else {
                return ""
            }
        },
        birthDateFormat(birthDate) {
            let date = birthDate
            if (date !== '') {
                let subString = date.split('/')
                let d = subString[0]
                let m = subString[1]
                let y = parseInt(subString[2])-543
                let birthDate = dayjs(`${m}/${d}/${y}`, 'MM/DD/YYYY').format("YYYY-MM-DDTHH:mm:ss")
               return birthDate
            } else {
               return null
            }
        },
        async updateUserInfo(formData, profileImage, isUploadProfileImage) {
            this.setLoading(true)
            this.isSave = false
            let res = Object.assign({}, formData) 
            res.birth_date = this.birthDateFormat(res.birth_date)
            
            if (this.isOnline) {
                if (profileImage === '') {
                    if (this.isLocalData) {
                        this.syncUserDataTocloud(res)
                    } else {
                        this.updateUserWithApi(res)
                    }
                } else {
                    if (profileImage !== '') {
                        if (this.isLocalData) {
                            var imageUrl = await this.uploadProfileImageToStorage(profileImage)
                            res.profile_image = imageUrl

                            this.syncUserDataTocloud(res)
                            
                        } else {
                            if (isUploadProfileImage) {
                                var imageUrl = await this.uploadProfileImageToStorage(profileImage)
                                res.profile_image = imageUrl
                                this.updateUserWithApi(res)
                            } else {
                                this.updateUserWithApi(res)
                            }
                        }
                    } else {
                       if (this.isLocalData) {
                            this.syncUserDataTocloud(res)
                        } else {
                            this.updateUserWithApi(res)
                        }
                    }
                }
            } else {
                res.profile_image = profileImage
                this.updateUserToLocalDB(res)
            }
        },
        async uploadProfileImageToStorage(profileImage) {
            let self = this
            return new Promise(function(resolve, reject) {
                var storagePath = 'users/profile-image'
                var imageName = self.$uuid.v4()+'.jpg'

                let imageRef = STORAGE_REF.child(storagePath).child(imageName)
                let uploadTask = imageRef.putString(profileImage, 'data_url', { contentType: 'image/jpeg' })

                uploadTask.on('state_changed',
                    (snapshot) => {
                        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    },
                    function error(err) {
                        reject()
                    },
                    function complete() {
                        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                            resolve(downloadURL)
                        })
                    }
                )
            })
        },
        updateUserWithApi (data) {
            let header = { 'access_token': this.userProfile.access_token }
            axios
                .put(apiUrl + "/users/"+this.getUserID, data, { headers: header })
                .then((response) => {
                    if (response.data.status == "success") {
                        this.isSaveFingerprint = true
                    }
                })
                .catch( async (error) => {
                    let errorMessage = error.response.data.message_error
                    if (errorMessage === 'Please fetch new data') {
                        this.setLoading(false)
                        this.$swal({
                            title: "เนื่องจากมีข้อมูลที่อัพเดทล่าสุด",
                            text: 'ระบบจะทำการรีเฟรชข้อมูลให้อัตโนมัติ',
                            icon: "error",
                            confirmButtonText: 'ตกลง',
                            customClass: 'font-prompt'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                this.refreshPage()
                            }
                        })
                    } else if (errorMessage === 'Citizen ID is duplicated') {
                        this.setLoading(false)
                        this.isSave = false
                        this.$swal({
                            title: "เลขประจำตัวประชาชนไม่ถูกต้อง",
                            icon: "error",
                            confirmButtonText: 'ตกลง',
                            customClass: 'font-prompt'
                        })
                    } else if (errorMessage === 'Access token expired') {
                       await this.$store.dispatch('refreshToken')
                       this.updateUserWithApi(data)
                    } else if (errorMessage === 'Email is duplicated') {
                        this.setLoading(false)
                        this.isSave = false
                        this.$swal({
                            title: "ไม่สามารถใช้อีเมลนี้ได้",
                            icon: "error",
                            confirmButtonText: 'ตกลง',
                            customClass: 'font-prompt'
                        })
                    }
                })
        },
        updateFingerPrint (fingerprint) {
            if (this.isOnline) {
                if (this.isLocalData) {
                    this.updateLocalFingerprintWithAPI(fingerprint)
                } else {
                    this.updateFingerPrintWithApi(fingerprint)
                }
            } else {
                this.updateFingerprintToLocalDB(fingerprint)
            }
        },
        async updateFingerPrintWithApi (fingerprint) {
            let fingerprintInfo = await this.$store.dispatch('updateFingerprint', { user_id: this.getUserID, fingerprint: fingerprint })
            if (fingerprintInfo === 'success') {
                this.isSaveFingerprint = false
                this.user = null
                this.fingerPrint = null
                this.user = await this.getUserInfo()
                this.fingerPrint = await this.getFingerPrint()
                this.setLoading(false)
                this.$swal({
                    title: "บันทึกข้อมูลสำเร็จ",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 2000,
                    customClass: 'font-prompt'
                })
            } else if (fingerprintInfo === 'Please fetch new data') {
                this.$swal({
                    title: "เนื่องจากมีข้อมูลที่อัพเดทล่าสุด",
                    text: 'ระบบจะทำการรีเฟรชข้อมูลให้อัตโนมัติ',
                    icon: "error",
                    confirmButtonText: 'ตกลง',
                    customClass: 'font-prompt'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload()
                    }
                })
            } else if (fingerprintInfo === 'Access token expired') {
               await this.$store.dispatch('refreshToken')
               this.updateFingerPrint(fingerprint)
            } else {
                this.setLoading(false)
                this.$swal({
                    title: "มีบางอย่างผิดพลาด",
                    icon: "error",
                    confirmButtonText: 'ตกลง',
                    customClass: 'font-prompt'
                })
            }
        },
        setValueSave (status) {
            this.isSave = status
        },
        sendToAIWithApi() {
            this.setLoading(true)
            let data = []
            data.push(this.getUserID)
            let header = {'access_token': this.userProfile.access_token}
            axios
            .post(apiUrl + "/users/send_ai", { user_id: data }, { headers: header })
            .then((response) => {
                let data = response.data
                if(data.status == 'success') {
                    this.setLoading(false)
                    this.getInitailData()
                }
            })
            .catch(async (error) => {
                this.setLoading(false)
                let errorMessage = error.response.data.message_error
                if (errorMessage === 'The processing queue is now full') {
                    this.$swal({
                        title: 'โปรดรอสักครู่<br>แล้วกรุณาลองใหม่อีกครั้ง',
                        text: 'ขณะนี้คิวการประมวลผลเต็มแล้ว',
                        icon: 'error',
                        confirmButtonText: 'ตกลง',
                        customClass: 'font-prompt'
                    })
                } else if (errorMessage === 'Access token expired') {
                    await this.$store.dispatch('refreshToken')
                    this.sendToAIWithApi()
                } else {
                    this.setLoading(false)
                    if (errorMessage.includes('connect EHOSTUNREACH')) {
                        this.$swal({
                            title: 'มีบางอย่างผิดพลาด',
                            text: 'เครื่องประมวลผล AI ยังไม่พร้อมใช้งานในขณะนี้',
                            icon: 'error',
                            confirmButtonText: 'ตกลง',
                            customClass: 'font-prompt'
                        })
                    } else {
                        this.$store.dispatch('logout')
                    }
                }
            })
        },
        getStatusImageExisting (val) {
            if (val) {
                this.checkImageExisting()
            }
        },
        updateDisapprove () {
            if (this.feedbackDisapprove !== '') {
                this.setLoading(true)
                this.popupDisapprove = false
                let status = this.getStatus
                if (this.userProfile.role === 'Analyst') {
                    if (this.getStatus === 'Ready to Review') {
                        status = 'Approved'
                        this.feedbackDisapprove = ''
                    } else if (this.getStatus === 'Disapproved') {
                        status = 'Disapproved'
                    }
                } else if (this.userProfile.role === 'Collector') {
                    status = 'Ready to Review'
                }
       
                if (this.isOnline) {
                     let data = {
                        status: status,
                        disapproved_report: this.feedbackDisapprove,
                        latest_modified: this.user.latest_modified
                    }
                    this.updateDisapproveReportWithApi(data)
                } else {
                    let data = Object.assign({}, this.user)

                    data.status = status
                    data.disapproved_report = this.feedbackDisapprove

                    this.updateDisapproveReportToLocalDB(data)
                }
            } else {
                this.popupDisapprove = true
                this.$swal({
                    title: "<h5>กรุณาแจ้งข้อผิดพลาด ก่อนกดบันทึก</h5>",
                    icon: "warning",
                    customClass: "font-prompt",
                    showConfirmButton: true,
                    confirmButtonText: "ตกลง",
                })
            }
            
        },
        updateDisapproveReportWithApi (data) {
            let header = { 'access_token': this.userProfile.access_token }
            axios
                .put(apiUrl + "/users/"+this.getUserID, data, { headers: header })
                .then((response) => {
                    if (response.data.status == "success") {
                        this.user.latest_modified = JSON.parse(JSON.stringify(response.data.result.user_info.latest_modified))
                        this.user.status = JSON.parse(JSON.stringify(response.data.result.user_info.status))
                        this.setStatus(JSON.parse(JSON.stringify(response.data.result.user_info.status)))
                        this.setLoading(false)
                        this.$swal({
                            title: "บันทึกข้อมูลสำเร็จ",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 2000,
                            customClass: 'font-prompt'
                        })
                    }
                })
                .catch(async (error) => {
                    this.setLoading(false)
                    let errorMessage = error.response.data.message_error
                    if (errorMessage === 'Please fetch new data') {
                        this.$swal({
                            title: "เนื่องจากมีข้อมูลที่อัพเดทล่าสุด",
                            text: 'ระบบจะทำการรีเฟรชข้อมูลให้อัตโนมัติ',
                            icon: "error",
                            confirmButtonText: 'ตกลง',
                            customClass: 'font-prompt'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                location.reload()
                            }
                        })
                    } else if (errorMessage === 'Citizen ID is duplicated') {
                        this.isSave = false
                        this.$swal({
                            title: "เลขประจำตัวประชาชนไม่ถูกต้อง",
                            icon: "error",
                            confirmButtonText: 'ตกลง',
                            customClass: 'font-prompt'
                        })
                    } else if (errorMessage === 'Access token expired') {
                        await this.$store.dispatch('refreshToken')
                        this.updateDisapproveReportWithApi(data)
                    }
                })
        },
        async updateDisapproveReportToLocalDB (data) {
            await this.$store.dispatch('updateUserInfoTolocalDB', data)
            let res = await this.getUserFromLocalDB()
            this.user.latest_modified = JSON.parse(JSON.stringify(res.latest_modified))
            this.user.status = JSON.parse(JSON.stringify(res.status))
            this.setStatus(JSON.parse(JSON.stringify(res.status)))
            this.setLoading(false)
            this.$swal({
                title: "บันทึกข้อมูลสำเร็จ",
                icon: "success",
                showConfirmButton: false,
                timer: 2000,
                customClass: 'font-prompt'
            })
        },
        setStatus (status) {
            this.$store.commit('setStatus', status)
        },
        setLoading(val) {
            this.$store.commit('SET_LOADING', val)
        },
        getUserReport(user_id) {
            this.$router.push({name: 'UserReport', params: { userReportId: user_id}})
        },
        refreshPage () {
            location.reload()
        },
        async getUserFromLocalDB() {
            return new Promise((resolve, reject) => {

                let trans = this.localDB.transaction(['tb_users'],'readonly')
                trans.oncomplete = e => {
                    resolve(user);
                };
                
                let store = trans.objectStore('tb_users');
                let request = store.get(this.getUserID)
                let user = null
                
                request.onerror = function(e) {
                    console.log("Error", e.target.error.name);
                }
                request.onsuccess = function(e) {
                    user = e.target.result;
                }
            })
        },
        async getFingerprintFromLocalDB() {
            return new Promise((resolve, reject) => {

                let trans = this.localDB.transaction(['tb_fingerprints'],'readonly')
                trans.oncomplete = e => {
                    resolve(fingerprint);
                };
                
                let store = trans.objectStore('tb_fingerprints');
                let request = store.get(this.getUserID)
                let fingerprint = null
                
                request.onerror = function(e) {
                    console.log("Error", e.target.error.name);
                }
                request.onsuccess = function(e) {
                    fingerprint = e.target.result;
                }
            })
        },
        async updateUserToLocalDB (res) {
            await this.$store.dispatch('updateUserInfoTolocalDB', res)
            this.isSaveFingerprint = true
        },
        async updateFingerprintToLocalDB (fingerprint) {
            await this.$store.dispatch('updateFingerprintTolocalDB', fingerprint)
            this.isSaveFingerprint = false
            this.user = null
            this.fingerPrint = null
            this.user = await this.getUserFromLocalDB()
            this.fingerPrint = await this.getFingerprintFromLocalDB()
            this.setLoading(false)
            this.$swal({
                title: "บันทึกข้อมูลสำเร็จ",
                icon: "success",
                showConfirmButton: false,
                timer: 2000,
                customClass: 'font-prompt'
            })
        },
        
        // Section Offline 
        async syncUserDataTocloud (res) {
            this.setLoading(true)
            this.createUserInfo(res)
        },
        async createUserInfo (userInfo) {
            let header = { 'access_token': this.userProfile.access_token }
            await axios
            .post(apiUrl + "/users", userInfo, { headers: header })
            .then( async (response) => {
                let data = response.data
                if (data.status == "success") {
                    this.user = data.result.user_info
                    this.isSaveFingerprint = true
                }
            })
            .catch( async (error) => {
                let errorMessage = error.response.data.message_error
                if (errorMessage === 'Citizen ID is duplicated') {
                    this.setLoading(false)
                    this.$swal({
                        title: "เลขประจำตัวประชาชนไม่ถูกต้อง",
                        icon: "error",
                        confirmButtonText: 'ตกลง',
                        customClass: 'font-prompt'
                    })
                } else if (errorMessage === 'Access token expired') {
                    await this.$store.dispatch('refreshToken')
                    this.createUserInfo(userInfo)
                } else if (errorMessage === 'Email is duplicated') {
                    this.setLoading(false)
                    this.$swal({
                        title: "ไม่สามารถใช้อีเมลนี้ได้",
                        icon: "error",
                        confirmButtonText: 'ตกลง',
                        customClass: 'font-prompt'
                    })
                }
            })
        },
        async updateLocalFingerprintWithAPI (localFingerprint) {
            let fingerprint = Object.assign({}, localFingerprint) 
            
            for (let [hand, fingerprints] of Object.entries(fingerprint['fingerprint'])) {
                let fingers = Object.keys(fingerprints)
                for (let fIdx = 0; fIdx < fingers.length; fIdx++) {
                    const finger = fingers[fIdx]
                    for (let aIdx = 1; aIdx <= 7; aIdx++) {
                        const angle_ = 'angle_'+aIdx
                        const image64 = fingerprints[finger]['angle'][angle_]['image']
                        if (image64 !== '') {
                            fingerprint['fingerprint'][hand][finger]['angle'][angle_]['image'] = await this.uploadFingerPrintsImageToStorage(this.user, hand, finger, angle_, image64)
                        }
                    }
                }
            }

            fingerprint.latest_modified = this.user.latest_modified
            delete fingerprint.id

            await this.$store.dispatch('updateFingerprint', { user_id: this.user.user_id, fingerprint: fingerprint })
            await this.$store.dispatch('removeUserInOfficerStore', this.localUserData.user_id)
            await this.$store.dispatch('removeUserInLocalDB', this.localUserData.user_id)
            await this.$store.dispatch('removeFingerprintInLocalDB', this.localUserData.user_id)

            this.$router.push({name: 'EditUser', params: { clientId: this.user.user_id}})
            location.reload()
        }, 
        async uploadProfileImageToStorage(profileImage) {
                // let self = this
            return new Promise(function(resolve, reject) {
                var storagePath = 'users/profile-image'
                var imageName = uuid.v4()+'.jpg'
                let imageRef = STORAGE_REF.child(storagePath).child(imageName)
                let uploadTask = imageRef.putString(profileImage, 'data_url', { contentType: 'image/jpeg' })

                uploadTask.on('state_changed',
                    (snapshot) => {
                    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    // console.log('Upload is ' + progress + '% done')
                    },
                    function error(err) {
                    reject()
                    },
                    function complete() {
                    uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                        resolve(downloadURL)
                    })
                    }
                )
            })
        },
        uploadFingerPrintsImageToStorage (userInfo, hand, finger, angle_, fingerImage) {
            return new Promise(function(resolve, reject) {
                let storagePath = `users/${userInfo.user_id}/fingerprints/${hand}/${finger}`
                let imageName = angle_ + ".jpg"
                let imageRef = STORAGE_REF.child(storagePath).child(imageName)
                let uploadTask = imageRef.putString(fingerImage, "data_url", {
                contentType: "image/jpeg",
                });
                uploadTask.on(
                "state_changed",
                (snapshot) => {
                    let progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                    // console.log('Upload is ' + progress + '% done')
                },
                function error(err) {
                    reject()
                },
                function complete() {
                    uploadTask.snapshot.ref
                    .getDownloadURL()
                    .then(function(downloadURL) {
                        resolve(downloadURL)
                    })
                }
                )
            })    
        }
    },    
}
</script> 
<style scoped>
    @import "../../assets/style/main.css";
    .sync-link {
        font-style: italic !important;
        text-decoration: underline !important;
    }
</style>