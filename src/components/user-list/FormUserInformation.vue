<template>
    <v-card height="fit-content" tile>
        <!-- Capture image -->
        <v-dialog
            v-model="dialog"
            width="500">
            <v-card>
                <div style="background-color: #466BB2;">
                    <div style="float: right;" class="pt-5 pr-4">
                        <v-icon size="20" color="white" @click="toggleCamera">icon-icon-close</v-icon>
                    </div>
                    <v-card-title style="justify-content:center">
                        <div>
                            <span class="white--text">CAMERA</span> 
                        </div>
                    </v-card-title>
                </div>
                
                <v-card-actions style="justify-content: center;">
                    <div class="web-camera-container">                                                        
                        <div v-show="isCameraOpen && isLoading">
                            <v-progress-circular
                            indeterminate
                            color="primary"
                            ></v-progress-circular>
                        </div>
                        
                        <div v-if="isCameraOpen" v-show="!isLoading" class="img-overlay-wrap">
                            <div class="camera-shutter" :class="{'flash' : isShotPhoto}"></div>
                            <video v-show="!isPhotoTaken" ref="camera" :width="450" :height="337.5" autoplay></video>
                            <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="450" :height="337.5"></canvas>
                            <img src="../../assets/images/crop-image.png" alt="crop">
                        </div>
                        
                        <div v-if="isCameraOpen && !isLoading" class="mt-5">
                            <v-btn fab x-large @click="takePhoto">
                                <v-icon>icon-Camera_icon</v-icon>
                            </v-btn>
                        </div>
                        
                        <div class="mt-5" v-if="isPhotoTaken && isCameraOpen">
                            <v-btn color="#466BB2" dark @click="getImage">
                                <v-icon class="mr-3">icon-photo_icon</v-icon>
                                Select image
                            </v-btn>
                        </div>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-row no-gutters class="px-3 pt-3" style="height: inherit">
            <v-hover v-slot="{ hover }">
                <div style="width: 13%">
                    <v-card
                        color="#F3F3F3"
                        height="130"
                        max-width="130"
                        tile
                        class="px-3 mb-2 "
                        >
                        <v-row style="height: 100%" justify="center" align="center">
                            <v-img 
                                v-if="profileImage !== ''" 
                                :src="profileImage"
                                width="130"
                                height="130"
                                >
                            </v-img>
                            <v-icon v-else size="65" color="#AEAEAE">icon-photo_icon</v-icon>
                            <v-expand-transition>
                                <div
                                    v-if="hover"
                                    class="d-flex v-card--reveal"
                                    style="height: 100%;"
                                >
                                    <div>
                                        <v-btn
                                            fab
                                            color="#F5F5F5"
                                            class="mr-2"
                                            @click="handleImageButtonClick"
                                            >
                                            <v-icon size="30">icon-photo_icon</v-icon>
                                        </v-btn>
                                        <input
                                            type="file"
                                            ref="image"
                                            @change="onImageSelected"
                                            style="display:none"
                                            accept="image/png, image/jpeg"
                                        />
                                    </div>
                                    <div>
                                        <v-btn
                                            fab
                                            color="#F5F5F5"
                                            >
                                            <v-icon size="30" @click="toggleCamera">icon-Camera_icon</v-icon>
                                        </v-btn>
                                    </div>
                                </div>
                            </v-expand-transition>
                        </v-row>                    
                    </v-card>
                </div>
            </v-hover>
            <div style="width: 87%;">
                <v-form ref="form">
                    <v-row class="px-3">
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Client's ID :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.user_id"
                                        disabled
                                        outlined
                                        dense
                                        class="info-text-field"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Date :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.latest_modified"
                                        disabled
                                        outlined
                                        dense
                                        class="info-text-field"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Status :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-select
                                        v-model="form.status"
                                        :items="statusList"
                                        item-value="status"
                                        item-text="status"
                                        item-disabled="isDisplay"
                                        outlined
                                        dense
                                        class="info-select"
                                        :hide-selected="hideSeleted"
                                        :disabled="disableStatus"
                                        append-icon="icon-arrow-drop-down"
                                    >
                                    </v-select>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Nickname<span class="text-red">**</span> :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.nick_name"
                                        outlined
                                        dense
                                        :rules="rules.nickname"
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">First name :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.first_name"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Last name :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.last_name"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Remark :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.remark"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Email :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                        v-model="form.email"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="10"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Phone :</span>
                                </div>
                                <div class="d-flex text-field-box">
                                    <v-text-field
                                        v-model="form.phone"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :rules="rules.phone"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                    <!-- Expand -->
                                    <v-icon 
                                        v-if="!isExpand" 
                                        size="35" 
                                        class="ml-2 mb-6" 
                                        color="#466BB2" 
                                        @click="isExpand=true"
                                        >
                                        icon-Drow_icon
                                    </v-icon>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row class="px-3" v-show="isExpand">
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Date of birth :</span>
                                </div>
                                <div class="d-flex text-field-box">
                                    <v-text-field
                                        v-model="form.birth_date"
                                        @keyup="changeFormatBirthdate"
                                        :rules="rules.birthDate"
                                        placeholder="DD/MM/YYYY"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Gender :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-select
                                        v-model="form.gender"
                                        :items="genderList"
                                        item-value="gender"
                                        item-text="text"
                                        outlined
                                        dense
                                        class="info-select"
                                        append-icon="icon-arrow-drop-down"
                                        :readonly="!isEditInfo"
                                    ></v-select>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">ID card :</span>
                                </div>
                                <div class="text-field-box">
                                    <v-text-field
                                    v-model="form.citizen_id"
                                    outlined
                                    dense
                                    class="info-text-field"
                                    :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Parent Name :</span>
                                </div>
                                <div class="text-field-box">
                                   <v-text-field
                                        v-model="form.parent_name"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Parent phone :</span>
                                </div>
                                <div class="text-field-box">
                                   <v-text-field
                                        v-model="form.parent_phone"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="6"
                            md="4"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div class="label-box">
                                    <span class="text-lebel">Line ID :</span>
                                </div>
                                <div class="text-field-box">
                                   <v-text-field
                                        v-model="form.line_id"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                </div>
                            </div>
                        </v-col>
                        <v-col
                            cols="12"
                            sm="12"
                            md="12"
                            class="py-0 col-box"
                            >
                            <div class="d-flex">
                                <div style="width: 11.7%">
                                    <span class="text-lebel">Address :</span>
                                </div>
                                <div class="d-flex" style="width: 88.3%">
                                    <v-text-field
                                        v-model="form.address"
                                        outlined
                                        dense
                                        class="info-text-field"
                                        :readonly="!isEditInfo"
                                    ></v-text-field>
                                    <!-- Collape -->
                                    <v-icon 
                                        v-if="isExpand" 
                                        size="35" 
                                        class="ml-2 mb-6" 
                                        color="#466BB2" 
                                        @click="isExpand=false"
                                        >
                                        icon-Up_icon
                                    </v-icon>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-form>
            </div>
        </v-row>
    </v-card>
</template>
<script>
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.extend(buddhistEra)
import ShortUniqueId from 'short-unique-id'

export default {
    props: ['userInfo', 'save'],
    name: 'user',
    data() {
        return {
            profileImage: '',
            isUploadProfileImage: false,
            hideSeleted: false,
            disableStatus: false,
            statusList: [],
            statusSpecialList: [],
            genderList: [
                {gender: 'female', text: 'Female'},
                {gender: 'male', text: 'Male'}
            ],
            statusSelected: '',
            isExpand: false,
            form: {
                user_id: '',
                latest_modified: this.currentDate(),
                status: '',
                nick_name: '',
                first_name: '',
                last_name: '',
                remark: '',
                email: '',
                phone: '',
                birth_date: '',
                gender: '',
                citizen_id:'',
                parent_name: '',
                parent_phone: '',
                line_id: '',
                address: '',
                profile_image: '',
                disapproved_report: ''
            },
            rules: {
                nickname: [
                    v => !!v || ''
                ],
                phone: [
                    v => v.length <= 10 || '',
                ],
                birthDate: [
                    v => this.maxBirthdate() || ''
                ]
            },
            dialog: false,
            isCameraOpen: false,
            isPhotoTaken: false,
            isShotPhoto: false,
            isLoading: false,
            valid: true,
            isEditInfo: false,
            localDB: null
        }
    },
    computed: {
        status(val) {
            return this.form.status
        },
        state_status(val) {
            return this.$store.state.status
        },
        isSaveUserInfo() {
            return this.$store.state.isSaveUserInfo
        },
        getUserInfo() {
            return this.$store.state.userInfo
        },
        saveFromAddUserPage() {
            return this.$store.state.saveFromAddUserPage
        },
        userProfile() {
            return this.$store.state.currentUser
        },
        isOnline () {
            return this.$store.state.isOnline
        }
    },
    watch: {
        save: {
            immediate: true,
            handler(newValue, oldValue) {
                if (newValue) {
                    var valid = this.$refs.form.validate()
                    if (valid) {
                        if (this.$route.path !== '/add-user') {
                            this.form.latest_modified = this.userInfo.latest_modified
                            this.$emit('create', this.form, this.profileImage, this.isUploadProfileImage)
                        } else {
                            this.$emit('create', this.form, this.profileImage, this.isUploadProfileImage)
                        }
                    } else {
                        this.$emit('save', false)
                    }
                }
            }
        },
        state_status(val) {
            this.form.status = val
        },
        status(val) {
            this.setStatus(val)
            this.checkStatusSelected()
            this.checkEditInfomation()
        },
        isSaveUserInfo (val) {
            if (val) {
                var valid = this.$refs.form.validate()
                if (valid) {
                    if (this.$route.path !== '/add-user') {
                        this.form.latest_modified = this.userInfo.latest_modified
                        this.$emit('create', this.form, this.profileImage, this.isUploadProfileImage)
                    } else {
                        this.createUser(this.form, this.profileImage)
                    }
                } else {
                   this.$swal({
                        title: "<h5>กรุณาตรวจสอบข้อมูลที่ท่านกรอก</h5>",
                        icon: "error",
                        confirmButtonText: 'ตกลง',
                        customClass: 'font-prompt'
                    })
                    this.$store.commit('SET_IS_SAVE_USER_INFO', false)
                }
            }
        },
        async isOnline (val) {
            if (val) {
                await this.$store.dispatch('getUserProfile')  
            }
        }
    },
    async created() {
        await this.$store.dispatch('getUserProfile')
        
        if (this.$route.path !== '/add-user') {
            console.log(this.userInfo);
            this.form = JSON.parse(JSON.stringify(this.userInfo))
            this.form.latest_modified = this.displayDateFormat(this.userInfo.latest_modified)
            this.form.birth_date = this.userInfo.birth_date !== '' && this.userInfo.birth_date !== null ? this.displayBirthdateFormat(this.userInfo.birth_date) : ''
            this.profileImage = this.userInfo.profile_image !== '' ? this.userInfo.profile_image : ''
        } else {
            this.form.status = 'Created'
            this.disableStatus = false
        }
    },
    mounted() {
        this.setStatusSelectWithRole()
        this.checkStatusSelected()
        this.checkEditInfomation()
    },
    methods: {
        displayBirthdateFormat(birthDate) {
            let date
            if (birthDate !== '' && birthDate !== null) {
                let dateFormat = dayjs(birthDate, "YYYY-MM-DDTHH:mm:ss").format("DD-MM-YYYY")
                let subString = dateFormat.split('-')
                let d = subString[0]
                let m = subString[1]
                let y = parseInt(subString[2])+543
                date = `${d}/${m}/${y}` 
            } else {
                date = ''
            }
            return date 
        },
        setStatusSelectWithRole () {
            if (this.userProfile.role === 'Analyst') {
                this.statusList = Array.from([
                    { status: 'Created', isDisplay: false},
                    { status: 'Ready to Review', isDisplay: false},
                    { status: 'Approved', isDisplay: false},
                    { status: 'Disapproved', isDisplay: false},
                    { status: 'Analyst Reviewed', isDisplay: false},
                    { status: 'Export to Report', isDisplay: false}
                ])
                this.statusSpecialList = Array.from([
                    { status: 'AI-Processing', isDisplay: true},
                    { status: 'AI-Resulted', isDisplay: true},
                    { status: 'Reported', isDisplay: true}
                ])
            } else if (this.userProfile.role === 'Collector') {
                this.statusList = Array.from([
                    { status: 'Created', isDisplay: false},
                    { status: 'Ready to Review', isDisplay: false}
                ])
                this.statusSpecialList = Array.from([
                    { status: 'Approved', isDisplay: true},
                    { status: 'Disapproved', isDisplay: true},
                    { status: 'Analyst Reviewed', isDisplay: true},
                    { status: 'Export to Report', isDisplay: true},
                    { status: 'AI-Processing', isDisplay: true},
                    { status: 'AI-Resulted', isDisplay: true},
                    { status: 'Reported', isDisplay: true}
                ])
            }
        },
        checkStatusSelected () {
            if (this.userProfile.role === 'Analyst') {
                if (this.statusList.length > 6) {
                    this.statusList.pop()
                }
                let find = 
                    this.form.status === 'AI-Processing' || 
                    this.form.status === 'AI-Resulted' || 
                    this.form.status === 'Reported' ? this.form.status : null
                if (find !== null) {
                    let valObj = this.statusSpecialList.filter(function (elem) {
                        if(elem.status === find) return elem
                    })
                    this.statusList.push(valObj[0])
                    this.hideSeleted = true
                } else {
                    this.hideSeleted = false
                }
            } else if (this.userProfile.role === 'Collector') {
                if (this.statusList.length > 2) {
                    this.statusList.pop()
                }
                let find = 
                    this.form.status === 'Approved' || 
                    this.form.status === 'Disapproved' || 
                    this.form.status === 'Analyst Reviewed' ||
                    this.form.status === 'Export to Report' ||
                    this.form.status === 'AI-Processing' ||
                    this.form.status === 'AI-Resulted' ||
                    this.form.status === 'Reported' ? this.form.status : null
                if (find !== null) {
                    let valObj = this.statusSpecialList.filter(function (elem) {
                        if(elem.status === find) return elem
                    })
                    this.statusList.push(valObj[0])
                    this.hideSeleted = true
                } else {
                    this.hideSeleted = false
                }
            }
        },
        checkEditInfomation() {
            if (this.userProfile.role === 'Analyst') {
                if (this.status !== 'AI-Processing') {
                    this.isEditInfo = true
                } else {
                    this.isEditInfo = false
                }
            } else if (this.userProfile.role === 'Collector') {
                if (!(this.status === 'AI-Processing' || this.status === 'Reported')) {
                    this.isEditInfo = true
                } else {
                    this.isEditInfo = false
                }
            } else {
                this.isEditInfo = false
            }
        },
        currentDate () { 
            return dayjs().format('DD/MM/BBBB')
        },
        currentDateTime () { 
            return dayjs().format("YYYY-MM-DDTHH:mm:ss")
        },
        changeFormatBirthdate(date) {
            let counter = this.form.birth_date.length
            if ((counter == 2 || counter == 5 ) && date.key !== 'Backspace') {
                this.form.birth_date = this.form.birth_date+'/'
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
        maxBirthdate () {
            if (this.form.birth_date !== '' && this.form.birth_date !== null) {
                if (this.form.birth_date.indexOf('/') !== -1) {
                    let subString = this.form.birth_date.split('/')
                    let d = subString[0]
                    let m = subString[1]
                    let y = parseInt(subString[2])-543
                    let birthDate = dayjs(`${m}/${d}/${y}`, 'MM/DD/YYYY').format("YYYY-MM-DD")
                    let maxDate = dayjs().format('YYYY-MM-DD')
                    return birthDate <= maxDate
                } else {
                    return false
                }
            } else {
                return true 
            }
        },
        displayDateFormat (date) {
            return dayjs(date).format('DD/MM/BBBB')
        },
        handleImageButtonClick() {
            this.$refs.image.click()
        },
        onImageSelected(event) {
            var file = event.target.files[0]
            var reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = e => {
                this.profileImage = e.target.result
                this.isUploadProfileImage = true
            }
        },
        toggleCamera() {
            if(this.isCameraOpen) {
                this.isCameraOpen = false
                this.isPhotoTaken = false
                this.isShotPhoto = false
                this.stopCameraStream()
                this.dialog = false
            } else {
                this.isCameraOpen = true
                this.dialog = true
                this.createCameraElement()
            }
        }, 
        createCameraElement() {
            this.isLoading = true
            
            const constraints = (window.constraints = {
                    audio: false,
                    video: {
                        width: { min: 450 },
                        height: { min: 337.5 },
                        aspectRatio: { ideal: 1.33333333 }
                    },
                })

            navigator.mediaDevices
                .getUserMedia(constraints)
                .then(stream => {
                    this.isLoading = false
                    this.$refs.camera.srcObject = stream
                })
                .catch(error => {
                    alert("May the browser didn't support or there is some errors.")
                    this.isCameraOpen = false
                    this.isPhotoTaken = false
                    this.isShotPhoto = false
                    this.dialog = false
                })
        },
        stopCameraStream() {
            let tracks = this.$refs.camera.srcObject.getTracks()

            tracks.forEach(track => {
                track.stop()
            })
        },
        takePhoto() {
            if(!this.isPhotoTaken) {
                this.isShotPhoto = true

                const FLASH_TIMEOUT = 50

                setTimeout(() => {
                    this.isShotPhoto = false
                }, FLASH_TIMEOUT)
            }
            
            this.isPhotoTaken = !this.isPhotoTaken;
            
            const context = this.$refs.canvas.getContext('2d')
            context.drawImage(this.$refs.camera, 0, 0, 450, 337.5)
        },
        getImage() {
            const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg")
            
            this.profileImage = canvas
            this.isUploadProfileImage = true
            this.toggleCamera()
        },
        setStatus (status) {
            this.$store.commit('setStatus', status)
        },
        async createUser(formData, profileImage) {
            this.setLoading(true)
            if (this.isOnline) {
                if (profileImage === '' ) {
                    this.createUserWithApi(formData)
                } else {
                    if (profileImage !== '' && this.isUploadProfileImage) {
                        var imageUrl = await this.$store.dispatch('uploadProfileImageToStorage', profileImage)
                        formData.profile_image = imageUrl
                        this.createUserWithApi(formData)
                    } else {
                        this.createUserWithApi(formData)
                    }
                }
            } else {
                this.createUserToLocal(formData, profileImage)
            }
        },
        async createUserWithApi (data) {
            let res = Object.assign({}, data) 
            res.birth_date = this.birthDateFormat(res.birth_date)
            
            delete data.user_id
            delete data.latest_modified

            let userInfo = await this.$store.dispatch('createUserInfo', res)
            if (userInfo === 'Citizen ID is duplicated') {
                this.setLoading(false)
                this.$store.commit('SET_IS_SAVE_USER_INFO', false)
                this.$swal({
                    title: "เลขประจำตัวประชาชนไม่ถูกต้อง",
                    icon: "error",
                    confirmButtonText: 'ตกลง',
                    customClass: 'font-prompt'
                })
            } else if (userInfo === 'Access token expired') {
                await this.$store.dispatch('refreshToken')
                this.createUserWithApi(data)
            } else if (userInfo === 'Email is duplicated') {
                this.setLoading(false)
                this.$store.commit('SET_IS_SAVE_USER_INFO', false)
                this.$swal({
                    title: "ไม่สามารถใช้อีเมลนี้ได้",
                    icon: "error",
                    confirmButtonText: 'ตกลง',
                    customClass: 'font-prompt'
                })
            } else {
                this.$store.commit('SET_IS_SAVE_USER_INFO', false)
                this.$store.commit('SET_USER_INFO', userInfo)
                if(this.saveFromAddUserPage) {
                    this.$store.commit('SET_SAVE_FROM_ADD_USER_PAGE', false)
                    this.$router.push({name: 'EditUser', params: { clientId: userInfo.user_id}})
                }
            }
        },
        async createUserToLocal (formData, profileImage) {
            
            let res = Object.assign({}, formData) 
            let id = this.generateID()
            res['id'] = 'LCN'+id
            res['create_at'] = this.currentDateTime()
            res.latest_modified = this.currentDateTime()
            res.user_id = 'LCN'+id
            res.birth_date = this.birthDateFormat(res.birth_date)
            res.profile_image = profileImage
            res['finger_id'] = 'LFG'+id
            res['report_id'] = ''

            this.localDB = await this.$store.dispatch('getLocalDB')
            await this.addUserToLocalDB(res)
            await this.createFingerprintToLocalDB(res)
            
            this.OfficerStoreToLocal(res)

            this.$store.commit('SET_USER_INFO', res)
            
            if(this.saveFromAddUserPage) {
                this.$store.commit('SET_SAVE_FROM_ADD_USER_PAGE', false)
                this.$router.push({name: 'EditUser', params: { clientId: res['id']}})
            }
        },
        generateID () {
            const options = { 
                dictionary: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
                length : 8
            }
            const uuid = new ShortUniqueId(options)
            return uuid()
        },
        async addUserToLocalDB(user) {
            return new Promise((resolve, reject) => {

            let trans = this.localDB.transaction(['tb_users'],'readwrite')
            trans.oncomplete = e => {
                resolve()
            };

            let store = trans.objectStore('tb_users')
                store.add(user)
            })
        },
        async createFingerprintToLocalDB (res) {
            return new Promise((resolve, reject) => {
                const fingerprint = {
                    id: res.user_id,
                    finger_id : res.finger_id,
                    latest_modified : res.latest_modified,
                    fingerprint : {
                        right : {
                            thumb : {        
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            index : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            middle : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            ring : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            pinkie : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            }
                        },
                        left : {
                            thumb : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            index : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            middle : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            ring : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            },
                            pinkie : {
                                ai_type : '',
                                ai_RC1 : 0,
                                ai_RC2 : 0,
                                analyst_type : '',
                                analyst_RC1 : 0,
                                analyst_RC2 : 0,
                                angle : {
                                    angle_1 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_2 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_3 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_4 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_5 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_6 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                    angle_7 : {
                                        image : '',
                                        ai_RC : 0,
                                        ai_count_image : '',
                                        ai_enhanced_image : '',
                                        analyst_RC : 0,
                                        line : [],
                                        plot_coordinates : []
                                    },
                                }
                            }
                        }
                    }
                }
            let trans = this.localDB.transaction(['tb_fingerprints'],'readwrite')
            trans.oncomplete = e => {
                this.setLoading(false)
                this.$store.commit('SET_IS_SAVE_USER_INFO', false)
                resolve()
            };

            let store = trans.objectStore('tb_fingerprints')
                store.add(fingerprint)
            })
        },
        async OfficerStoreToLocal (res) {
            return new Promise(async (resolve, reject) => {
                let officer = await this.$store.dispatch('getOfficerFromLocalDB', this.userProfile.user_id)

                let trans = this.localDB.transaction(['tb_officer'],'readwrite')
                trans.oncomplete = e => {
                    resolve()
                }

                let data = {
                    id: this.userProfile.user_id,
                    clients: []
                }

                if (officer === undefined) {

                    data.clients.push(res.user_id)
                    let store = trans.objectStore('tb_officer')
                    store.add(data)

                } else {

                    if (officer.clients.length !== 0) {
                        data.clients = Array.from(officer.clients)
                    }

                    data.clients.push(res.user_id)
                    let store = trans.objectStore('tb_officer')
                    store.put(data)
                }
            })
        },
        setLoading(val) {
            this.$store.commit('SET_LOADING', val)
        },
    },    
}
</script>
<style scoped>
@import "../../assets/style/userinfo-style.css";
</style>