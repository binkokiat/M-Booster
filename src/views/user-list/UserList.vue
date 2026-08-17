<template>
<div class="user" v-if="userProfile !== null">
  <!-- Loading -->
  <v-dialog v-model="loadingSyncClient" width="35%" persistent>
    <v-row no-gutters class="text-center loading-sync-box">
      <div>
        <v-icon class="sync-spin" size="175" color="#466BB2">icon-icon-sync</v-icon>
      </div>
      <div>
        <p style="font-size: 1.5vmax">กำลังซิงค์ข้อมูล กรุณารอสักครู่ ({{ currentNumLocalData }}/{{ totalNumLocalData }})</p>
      </div>
    </v-row>
  </v-dialog>
  <div class="pa-3 content background-main" >
      <v-row justify="space-between" class="px-3">
        <div class="mb-4">
          <v-row>
            <div class="ml-3">
              <p class="font-20 font-bold pa-0 ma-0">Client List</p>
            </div>
            <div class="d-flex ml-6" style="align-items: center;">
              <v-sheet
                color="white"
                elevation="1"
                rounded
                outlined
                class="px-1"
                height="30"
              >
                <v-btn
                  color="#74B9FF"
                  elevation="0"
                  width="80"
                  style="height: 20px;"
                  :dark="isLocalData"
                  :text="!isLocalData"
                  @click="isLocalData = true"
                  small
                >{{ `${'Local '+ '('+totalNumLocalData+')'}` }}  </v-btn>
                <v-btn
                  color="#74B9FF"
                  elevation="0"
                  style="height: 20px;"
                  width="80"
                  :dark="!isLocalData"
                  :text="isLocalData"
                  @click="isLocalData = false"
                  small
                >Cloud</v-btn>
              </v-sheet>
            </div>
          </v-row>
        </div>
        <div>
          <v-btn class="mx-2" color="#A3CB38" dark :to="{name: 'AddUser'}">Add Client</v-btn>
          <v-btn v-if="isOnline" class="mx-2" color="#FFC312" dark :to="{name: 'ImportData'}">Import Data</v-btn>
          <v-btn v-if="!isOnline" class="mx-2" disabled>Import Data</v-btn>
          <v-btn v-if="isOnline && userProfile.role === 'Analyst'" class="mx-2" color="#74B9FF" dark :to="{name:'ImportReport'}">Import Report</v-btn>
          <v-btn v-if="!isOnline" class="mx-2" disabled>Import Report</v-btn>
        </div>
      </v-row>
      <v-row justify="space-between" class="px-3">
        <div style="display: flex;">
          <v-select
            v-model="bulkSelected"
            :items="bulkActions"
            dense
            solo
            outlined
            style="max-width: 200px;"
            append-icon="icon-arrow-drop-down"
          ></v-select>
          <v-btn class="mx-2" style="height: 40px" color="#466BB2" dark @click="bulkAction()">Apply</v-btn>
        </div>
        <div style="display: flex">
         <v-menu
            v-model="menuDate"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                ref="datepicker"
                v-model="dateRangeText"
                placeholder="Date"
                prepend-inner-icon="icon-Calendar_icon"
                outlined
                readonly
                v-bind="attrs"
                v-on="on"
                solo
                dense
                style="width: 290px"
                clearable
                @click:clear="clearDatePicker()"
                :disabled="!isOnline || isLocalData"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="dates"
              range
              locale="th"
              @change="onDateChange"
              no-title
              :disabled="!isOnline || isLocalData"
            ></v-date-picker>
          </v-menu>
          <v-text-field
            v-model="search"
            class="ml-3 pa-0 search"
            solo
            outlined
            label="Search.."
            dense
            style="width: 290px"
            append-icon="icon-Search_icon1"
            :disabled="!isOnline || isLocalData"
          >
          </v-text-field>
        </div>
      </v-row>
      <!-- Section filter -->
      <v-row justify="space-between" class="px-3">
        <div class="pointer" style="display: contents" v-for="(status, sIdx) in filterStatusList" :key="sIdx">
          <div>
            <p class="font-10" style="color: #466BB2" @click="filterStatusSelected=status.text">
              <span >{{ status.text }}</span>
              <span style="color: #707070">{{ ` `+ `(` + status.count + `)`}}</span>
              <span style="height: 20px; width: 2px; bachground-color: #707070"></span>
              <v-divider
                v-if="status.hasSelected"
                color="#466BB2"
                ></v-divider>
            </p>
          </div>
          <div class="mb-5">
            <v-divider
              v-if="filterStatusList.length !== sIdx+1"
              vertical
              color=" #707070"
              ></v-divider>
          </div>
        </div>
      </v-row>
      <v-row class="px-3">
          <v-data-table
            v-model="userSelected"
            :headers="headers"
            :items="displayUsers"
            :sort-by="orderBy"
            :sort-desc="order === 'DESC' ? true : false"
            @update:sort-by="getSortBy"
            @update:sort-desc="getSortDESC"
            :hide-default-footer="true"
            item-key="user_id"
            show-select
            class="table header-blue"
            :items-per-page="perPage"
            :page="page"
          >
            <template v-slot:[`header.data-table-select`]="{ on, props }">
              <v-simple-checkbox
                v-bind="props"
                v-on="on"
                :ripple="false"
                class="ml-0"
                indeterminate-icon="icon-checkbox-indeterminate"
                on-icon="icon-checkbox-marked"
                off-icon="icon-checkbox-outline"
              />
            </template>
            <template v-slot:item="{ item, isSelected, select }" >
              <tr :style="highlightRow(item.user_id) ? 'background-color: pink' : ''">
                <td>
                  <v-checkbox
                    color="#707070"
                    :input-value="isSelected"
                    @change="select($event)"
                    on-icon="icon-checkbox-marked"
                    off-icon="icon-checkbox-outline"
                  ></v-checkbox>
                </td>
                <td class="text-center">
                  <v-avatar size="45" v-if="item.profile_image !== ''">
                    <v-img
                      :src="item.profile_image"
                      aspect-ratio="1"
                    ></v-img>
                  </v-avatar>
                  <v-avatar
                    color="#AEAEAE"
                    v-else
                    size="45"
                  >
                    <span style="color: #F3F3F3">{{ item.nick_name.substr(0, 1) }}</span>
                  </v-avatar>
                </td>
                <td class="text-center">
                  <span v-if="item.user_id !== ''">{{ item.user_id }}</span>
                  <span v-else> - </span>
                </td>
                <td class="text-center">
                  <span v-if="item.finger_id !== ''">{{ item.finger_id }}</span>
                  <span v-else> - </span>
                </td>
                <td class="text-center">
                  <span v-if="item.first_name !== ''">{{ item.first_name }}</span>
                  <span v-else> - </span>
                </td>
                <td class="text-center">
                  <span v-if="item.last_name !== ''">{{ item.last_name }}</span>
                  <span v-else> - </span>
                </td>
                <td class="text-center">
                  <span v-if="item.nick_name !== ''">{{ item.nick_name }}</span>
                  <span v-else> - </span>
                </td>
                <td class="text-center">
                  <span v-if="item.created_at">
                    {{ displayDateFormat(item.created_at) }}
                  </span>
                  <span v-else> - </span>
                </td>
                <td class="text-center">
                  <span :class="item.status === 'Disapproved' ? 'text-red' : item.status === 'Reported' ? 'text-green' : ''">
                    {{ item.status }}
                  </span>
                </td>
                <td class="text-center">
                  <v-btn 
                    fab 
                    x-small
                    dark 
                    color="#FF9F43"  
                    class="mx-1 my-3"
                    elevation="1"
                    @click="editUser(item.user_id)"
                  >
                    <v-icon size="18">
                      icon-pen_icon
                    </v-icon>
                  </v-btn>
                  <v-btn 
                    fab 
                    x-small
                    :dark="item.status === 'Reported'"
                    color="#0F6939"  
                    class="ma-2"
                    elevation="1"
                    :disabled="item.status !== 'Reported'"
                    @click="getUserReport(item.user_id)"
                    :style="item.status !== 'Reported' ? 'background-color: #dfe6e9 !important' : ''"
                  >
                    <v-icon size="18">
                      icon-result_icon
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
            </template>

            <!-- Footer -->
            <template v-slot:footer >
              <div style="border-top: thin solid rgba(0,0,0,.12);font-size: 12px;">
                <v-row class="mt-2 mx-4 justify-end">
                  <v-col class="col-auto pt-4">
                    <span>Rows per page :</span>
                  </v-col>
                  <v-col class="col-auto">
                    <v-select
                      v-model="perPage"
                      :items="itemPerPage"
                      dense
                      :height="25"
                      class="per-page-select"
                      append-icon="icon-arrow-drop-down"
                    >
                     <template v-slot:selection="{ item }">
                        <span class="d-flex justify-center" style="width: 100%;">
                          {{ item }}
                        </span>
                      </template>
                      <template v-slot:item="{ item }" dense>
                        <v-list-item-content>
                          <v-list-item-title>
                            <span class="d-flex justify-center" style="width: 100%;">{{ item }}</span>                            
                          </v-list-item-title>
                        </v-list-item-content>
                      </template>
                    </v-select>
                  </v-col>
                  <v-col class="col-auto pt-4 pr-0">
                    <span class="mx-4">{{page}} of {{pagination}} page</span>
                  </v-col>
                  <v-col class="col-auto pt-2">
                    <v-btn 
                      icon
                      :disabled="buttonPageStatus ? true : page === 1 ? true : false"
                      class="mr-1"
                      @click="page--"
                    >
                      <v-icon size="15">icon-icon-chevron-left</v-icon>
                    </v-btn>
                    <v-btn 
                      icon
                      :disabled="buttonPageStatus ? true : page === pagination ? true : false"
                      class="ml-1"
                      @click="page++"
                    >
                      <v-icon size="15">icon-icon-chevron-right</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </template>
          </v-data-table>
      </v-row>
  </div>
</div>
</template>

<script>
import { apiUrl } from '../../utils/url'
import axios from 'axios'
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
dayjs.extend(buddhistEra)
import uuid from 'uuid'

axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'

import { storage } from "../../utils/firebase"
const STORAGE_REF = storage.ref()

export default {
  name: 'user',
  data() {
    return {
      bulkActions: [],
      bulkSelected: '',
      menuDate: false,
      dates: [],
      filterStatusList: [
        { status: 'all', text: 'All', count: 0, hasSelected: true},
        { status: 'created', text: 'Created', count: 0, hasSelected: false},
        { status: 'ready_to_review', text: 'Ready to Review', count: 0 , hasSelected: false},
        { status: 'approved', text: 'Approved', count: 0, hasSelected: false },
        { status: 'disapproved', text: 'Disapproved', count: 0, hasSelected: false },
        { status: 'ai-processing', text: 'AI-Processing', count: 0, hasSelected: false },
        { status: 'ai-resulted', text: 'AI-Resulted', count: 0, hasSelected: false },
        { status: 'analyst_reviewed', text: 'Analyst Reviewed', count: 0, hasSelected: false },
        { status: 'export_to_report', text: 'Export to Report', count: 0, hasSelected: false },
        { status: 'reported', text: 'Reported', count: 0, hasSelected: false }
      ],
      filterStatusSelected: 'All',
      userSelected: [],
      headers: [
          { text: 'Profile', align: 'center', sortable: false, value: 'profile_image', class: 'header-table'},
          { text: "Client's ID", value: 'user_id', align: 'center', class: 'header-table'},
          { text: 'Fingers ID', value: 'finger_id', align: 'center', class: 'header-table' },
          { text: 'First Name', value: 'first_name', align: 'center', class: 'header-table', width: 130 },
          { text: 'Last Name', value: 'last_name', align: 'center', class: 'header-table', width: 130 },
          { text: 'Nickname', value: 'nick_name', align: 'center', class: 'header-table'},
          { text: 'Date Added', value: 'created_at', align: 'center', class: 'header-table', width: 140 },
          { text: 'Status', value: 'status', align: 'center', class: 'header-table'},
          { text: 'Actions', value: 'actions', align: 'center', sortable: false, class: 'header-table', width: 140 },
        ],
      users: [],
      displayUsers: [],
      search: '',
      page: 1,
      perPage: 10,
      orderBy: 'created_at',
      order: 'DESC',
      itemPerPage: [10, 20, 50, 100],
      itemTotal: 0,
      pagination: 0,
      buttonPageStatus: false,
      dateRangeText: '',
      localDB: null,
      totalNumLocalData: 0,
      switchMode: true,
      isLocalData: null,
      loadingSyncClient: false,
      currentNumLocalData: 0
    }
  },
  computed: {
    userProfile () {
      return this.$store.state.currentUser
    },
    isOnline () {
      return this.$store.state.isOnline
    }
  },
  watch: {
    filterStatusSelected (status) {
      // Set Active
      this.setActiveToFilterStatus(status)
      // Filter
      this.filterStatus(status)
    },
    search (val) {
      this.page = 1
      if (this.isOnline && !this.isLocalData) this.observeUserList()
    },
    page (val) {
      if (this.isOnline && !this.isLocalData) this.observeUserList()
    },
    perPage (val) {
      if (this.isOnline && !this.isLocalData) {
        this.observeUserList()
      } else {
        this.page = 1
        this.pagination = Math.ceil(this.numLocalData/val)
      }
    },
    orderBy (val) {
      if (this.isOnline && !this.isLocalData) {
        this.observeUserList()
      } else {
        this.page = 1
      }
    },
    order (val) {
      if (this.isOnline && !this.isLocalData && val === 'DESC') {
        this.observeUserList()
      } else {
        this.page = 1
      }
    },
    dates (val) {
      if (this.dates.length !== 0) {
        let thDate = []
        this.dates.forEach(ele => {
          thDate.push(dayjs(ele).format('DD/MM/BBBB'))
        });
        this.dateRangeText = thDate.join(' ~ ')
      } else {
        this.dateRangeText = ''
      }
    },
    async isOnline (val) {
      if (!val) {
        this.isLocalData = true
      } else {
        this.isLocalData = false
      }
    },
    async isLocalData (val) {
      await this.$store.dispatch('getUserProfile')
      this.setBulkActionWithRole()
      if (val) {
        this.setLoading(true)
        let localUsers = await this.getUsersFromLocalDB()
        this.addUserlistFromLocalDBTolist(localUsers)
        this.totalNumLocalData = localUsers.length
        this.pagination = Math.ceil(this.totalNumLocalData/this.perPage)
        this.page = this.pagination > 0 ? 1 : 0
        this.search = ''
        this.dates = []
        this.setLoading(false)
      } else {
        if (this.isOnline) {
          this.users = []
          this.displayUsers = []

          let localData = await this.checkUserlistInLocalDB()
          
          if (this.userProfile !== null) {
            if (localData.length !== 0) {

            // Sync data to cloud
              this.getInitialUserList()
              this.syncUserDataTocloud()
              
            } else {
              this.setLoading(true)
              this.getInitialUserList()
            }
          }
        } else {
          this.users = []
          this.displayUsers = []
          this.setLoading(false)
        }
      }
    }
  },
  async created() {
    this.setLoading(true)

    await this.$store.dispatch('getUserProfile')
    let localData = await this.checkUserlistInLocalDB()
    this.totalNumLocalData = localData.length

    if (this.isOnline) {
      if (this.userProfile !== null) {
        if (localData.length !== 0 ) {
          // Sync data to cloud
          this.syncUserDataTocloud()
          this.setBulkActionWithRole()
          this.isLocalData = false
        } else {
          this.isLocalData = false
          this.setBulkActionWithRole()
        }
      }    
    } else {
        // get user list from indexedDB
        this.isLocalData = true
    }
  },
  methods: {
    setBulkActionWithRole () {
      // let cuurent_user = JSON.parse(window.localStorage.getItem("current_user"))
      if (this.userProfile.role === 'Analyst') {
        if (this.isOnline && !this.isLocalData) {
          this.bulkActions = Array.from(['Send to AI', 'Export Raw Data','Send Report to User', 'Delete'])
          this.bulkSelected = 'Send to AI'
        } else {
          this.bulkActions = Array.from(['Delete'])
          this.bulkSelected = 'Delete'
        }
      } else if (this.userProfile.role === 'Collector') {
          this.bulkActions = Array.from(['Delete'])
          this.bulkSelected = 'Delete'
      }
    },
    async getInitialUserList() {
      this.perPage = 10
      this.page = 1
      this.search = ''
      this.filterStatusSelected = 'All'
      this.dates = []
      this.orderBy = 'created_at'
      this.order = 'DESC'
      this.userSelected = []
      await this.observeUserList()
      this.getTotalStatus()
    },
    async observeUserList () {
      this.setLoading(true)
      this.buttonPageStatus = true
      let config = {
        headers: {'access_token': this.userProfile.access_token},
        params: { 
          per_page: this.perPage === undefined ? 10 : this.perPage,
          page: this.page,
          search: this.search,
          status: this.filterStatusSelected === 'All' ? '' : this.filterStatusSelected,
          after: this.dateFormatToAPI(this.dates[0]),
          before: this.dateFormatToAPI(this.dates[1]),
          orderby: this.orderBy === 'user_id' ? 'id' : this.orderBy === 'created_date' ? 'create_at' : this.orderBy,
          order: this.order
        }
      }
      await axios.get(apiUrl + "/users", config)
        .then((response) => {
          if (response.data.status === 'success') {
            this.clearUsers()
            this.setLoading(false)

            for (const res of response.data.result.user_list) {
              this.users.push(res)
            }

            this.displayUsers = Array.from(this.users)
            this.page = response.data.result.page 
            this.perPage = response.data.result.per_page
            this.itemTotal = this.displayUsers.length
            this.pagination = response.data.result.total_page
            this.buttonPageStatus = false
            
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error
          if(errorMessage === 'Access token expired') {
            await this.$store.dispatch('refreshToken')
            this.observeUserList()
          } else {
            this.setLoading(false)
            this.$store.dispatch('logout')
          }
        })
    },
    getTotalStatus () {
      let  header = {'access_token': this.userProfile.access_token}
      axios.get(apiUrl + "/users/status/total", {headers: header})
        .then((response) => {
          if (response.data.status === 'success') {
            Object.keys(response.data.result.user_status_total).forEach((status, idx) => {
              let result = response.data.result.user_status_total
              for (let index = 0; index < this.filterStatusList.length; index++) {
                if (status === this.filterStatusList[index].status) {
                  this.filterStatusList[index].count = result[status]
                  break
                }
              }
            })
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error
          if(errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.getTotalStatus()
          } else {
            this.setLoading(false)
            this.$store.dispatch('logout')
          }
        })
    },
    dateFormatToAPI (date) {
      if (date !== undefined) {
        return dayjs(date).format('YYYY-MM-DDTHH:mm:ss')
      } else {
        return ''
      }
    },
    displayDateFormat (date) {
      return dayjs(date).format('DD/MM/BBBB')
    },
    setActiveToFilterStatus(status) {
      for (let index = 0; index < this.filterStatusList.length; index++) {
        if (this.filterStatusList[index].text === status) {
          this.filterStatusList[index].hasSelected = true
        } else {
          this.filterStatusList[index].hasSelected = false
        }
      }
    },
    filterStatus(status) {
      this.page = 1
      if (this.isOnline && !this.isLocalData) {
        this.observeUserList()
      } else {
          if (status === 'All') {
            this.displayUsers = Array.from(this.users)
          } else {
            this.displayUsers = this.users.filter(user => {
              return user.status === status
            })
          }
      }
    },
    countTotalStatus() {
      // clear total status
      this.filterStatusList.forEach(item => {
        return item.count = 0
      })

      this.users.forEach(user => {
        for (let index = 0; index < this.filterStatusList.length; index++) {
          if (this.filterStatusList[index].text === 'All') {
            this.filterStatusList[index].count = this.users.length
          }
          if (user.status === this.filterStatusList[index].text) {
            this.filterStatusList[index].count++
          }
        }
      })
      
    },
    onDateChange (date) {
      if (date[0] > date[1]) {
        let tempDate = this.dates[0]
        this.dates[0] = this.dates[1]
        this.dates[1] = tempDate
      }
      this.observeUserList()
    },
    clearUsers () {
      this.users = []
      this.displayUsers = []
      this.itemTotal = 0
      this.pagination = 0
    },
    getIdUserSelected (users) {
      var usersId = []
      for (let index = 0; index < users.length; index++) {
        let userId = users[index].user_id
        usersId.push(userId)
      }
      return usersId
    },
    bulkAction() {
      if (this.bulkSelected === 'Delete') {
        if (this.userSelected.length !== 0) {
          return this.deleteUser()
        } else {
          this.$swal({
            title: 'กรุณาเลือกข้อมูลที่ต้องการลบ',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            customClass: 'font-prompt'
          })
        }
      } else if (this.bulkSelected === 'Send to AI') {
        if (this.userSelected.length !== 0) {
          return this.sendToAI()
        } else {
          this.$swal({
            title: 'กรุณาเลือกข้อมูลที่ต้องการ<br>ส่งให้ AI ประมวลผล',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            customClass: 'font-prompt'
          })
        }
      } else if (this.bulkSelected === 'Send Report to User') {
        if (this.userSelected.length !== 0) {
          return this.sendUserReport()
        } else {
          this.$swal({
            title: 'กรุณาเลือกข้อมูลที่ต้องการส่งรายงานให้',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            customClass: 'font-prompt'
          })
        }
      } else if (this.bulkSelected === 'Export Raw Data') {
        if (this.userSelected.length !== 0) {
          return this.exPortRawData()
        } else {
          this.$swal({
            title: 'กรุณาเลือกข้อมูลที่ต้องการนำออก',
            icon: 'warning',
            confirmButtonText: 'ตกลง',
            customClass: 'font-prompt'
          })
        }
      }
    },
    deleteUser () {
      this.$swal({
        title: 'คุณต้องการลบข้อมูลหรือไม่ ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#74B9FF',
        cancelButtonColor: '#EC0927',
        confirmButtonText: 'ยืนยัน',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true,
        customClass: 'font-prompt'
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.isOnline && !this.isLocalData) {
            this.deleteUserWithAPI()
          } else {
            this.deleteUserFromLocal()
          }
        }
      })
    },
    deleteUserWithAPI () {
      this.setLoading(true)
      let config = {
        headers: { 'access_token': this.userProfile.access_token },
        params: { user_id: this.getIdUserSelected(this.userSelected).toString() }
      }
      axios.delete(apiUrl + "/users", config)
        .then((response) => {
          if (response.data.status === 'success') { 
            this.setLoading(false)
            this.$swal({
              title: 'ลบข้อมูลเรียบร้อยแล้ว',
              text: 'ข้อมูลของคุณยังถูกเก็บไว้ในฐานข้อมูล',
              icon: 'success',
              confirmButtonText: 'ตกลง',
              customClass: 'font-prompt'
            }).then((result) => {
              if (result.isConfirmed) {
                this.getInitialUserList()
              }
            })
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error
          if(errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.deleteUserWithAPI()
          } else {
            this.setLoading(false)
            this.$store.dispatch('logout')
          }
        })
    },
    async deleteUserFromLocal () {
      this.setLoading(true)

      for (const user of this.userSelected) {
        await this.$store.dispatch('removeUserInLocalDB', user.user_id)
        await this.$store.dispatch('removeFingerprintInLocalDB', user.user_id)
      }

      let localUsers = await this.getUsersFromLocalDB()
      this.addUserlistFromLocalDBTolist(localUsers)
      this.setLoading(false)
    },
    checkUserListStatus (status, users) {
      if (status === 'Send to AI' || status === 'Export Raw Data') {
        let idx = users.findIndex(user => { return user.status === 'Created' || user.status === 'Disapproved' ||  user.status === 'Ready to Review'})

        if (idx !== -1) {
          return false
        } else {
          return true
        }
      } else if (status === 'Reported') {
        let idx = users.findIndex(user => { return user.status !== 'Reported'})

        if (idx !== -1) {
          return false
        } else {
          return true
        }
      }
    },
    async sendToAI () {
      this.setLoading(true)
      var isSendToAI = this.checkUserListStatus('Send to AI', this.userSelected)
      let users = this.getIdUserSelected(this.userSelected)

      // Check image existing in Vuex
      var hasImage = await this.$store.dispatch('checkImageExisting', users)

      if (!isSendToAI || !hasImage) {
        this.setLoading(false)
        this.$swal({
          title: '<u>เงื่อนไขผิดพลาด</u>',
          html: `
            <ul style="text-align: left; padding-left: 15px">
              <li>สถานะต้องไม่เป็น
                <ul style="padding-left: 15px;">
                  <li>Created</li>
                  <li>Ready to Review</li>
                  <li>Disapproved</li>
                </ul>
              </li>
              <li>ต้องมีรูปภาพลายนิ้วมือ</li>
            </ul>
          `,
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          customClass: 'font-prompt'
        })
      } else {
        this.sendToAIWithAPI()
      }
    },
    sendToAIWithAPI() {
        let data = this.getIdUserSelected(this.userSelected)
        let header = {'access_token': this.userProfile.access_token}
        axios
        .post(apiUrl + "/users/send_ai", { user_id: data }, { headers: header })
        .then((response) => {
          let data = response.data
          if(data.status == 'success') {
            this.setLoading(false)
            this.$swal({
              title: 'ส่งข้อมูลให้ AI ประมวลผลสำเร็จ',
              text: 'กรุณารอการประมวลผลสักครู่ แล้วรีเฟรชหน้าดูผลลัพธ์',
              icon: 'success',
              confirmButtonText: 'ตกลง',
              customClass: 'font-prompt'
            })
            this.getInitialUserList()
          }
        })
        .catch(async (error) => {
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
              this.sendToAIWithAPI()
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
    sendUserReport () {
      this.setLoading(true)
      let isSendUserReport = this.checkUserListStatus('Reported', this.userSelected)
      let hasEmail = this.checkEmailExisting(this.userSelected)
      if (!isSendUserReport || !hasEmail) {
        this.setLoading(false)
        this.$swal({
          title: '<h4>มีข้อมูลบางรายการ<br>ที่ยังไม่พร้อมส่งรายงาน</h5>',
          text: 'การส่งรายงานให้กับลูกค้า ต้องมีสถานะเป็น Reported และจะต้องมีอีเมล',
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          customClass: 'font-prompt'
        })
      } else {
        this.sendUserReportWithAPI()
      }
    },
    sendUserReportWithAPI() {
        let data = this.getIdUserSelected(this.userSelected)
        let header = {'access_token': this.userProfile.access_token}
        axios
        .post(apiUrl + "/users/send_report", { user_id: data }, { headers: header })
        .then((response) => {
          let data = response.data
          if(data.status == 'success') {
            this.setLoading(false)
            this.$swal({
              title: 'ส่งรายงานสำเร็จ',
              icon: 'success',
              showConfirmButton: false,
              timer: 2000,
              customClass: 'font-prompt'
            })
            this.getInitialUserList()
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error
          if(errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.sendUserReportWithAPI()
          } else {
            this.setLoading(false)
            this.$store.dispatch('logout')
          }
        }) 
    },
    exPortRawData () {
      this.setLoading(true)
      var isExportRawData = this.checkUserListStatus('Export Raw Data', this.userSelected)
      if (!isExportRawData) {
       this.setLoading(false)
       this.$swal({
          title: '<u>เงื่อนไขผิดพลาด</u>',
          html: `
            <ul style="text-align: left; padding-left: 15px">
              <li>สถานะต้องไม่เป็น
                <ul style="padding-left: 15px;">
                  <li>Created</li>
                  <li>Ready to Review</li>
                  <li>Disapproved</li>
                </ul>
              </li>
            </ul>
          `,
          icon: 'warning',
          confirmButtonText: 'ตกลง',
          customClass: 'font-prompt'
        })
      } else {
        this.exPortRawDataWithAPI()
      }
    },
    exPortRawDataWithAPI () {
        let data = this.getIdUserSelected(this.userSelected)
        let header = {'access_token': this.userProfile.access_token}
        axios
        .post(apiUrl + "/users/export_raw", { user_id: data }, { headers: header })
        .then((response) => {
          let data = response.data
          if(data.status == 'success') {
            this.setLoading(false)
            
            let popout = window.open(data.result.download_url);
            window.setTimeout(function(){
                popout.close();
            }, 1000)

            this.$swal({
              title: 'นำออกข้อมูลสำเร็จ',
              icon: 'success',
              showConfirmButton: false,
              timer: 2000,
              customClass: 'font-prompt'
            })
            this.getInitialUserList()
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error
          if(errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.exPortRawDataWithAPI()
          } else {
            this.setLoading(false)
            this.$store.dispatch('logout')
          }
        })  
    },
    checkEmailExisting (users) {
      var hasEmail
      for (const user of users) {
        if (user.email === '') {
          hasEmail = false
          break
        } else {
          hasEmail = true
        }
      }
      return hasEmail
    },
    getSortBy (val) {
      if (val !== undefined) {
        if (typeof val === 'string') {
          this.orderBy = val
        } else if (typeof val === 'object') {
          this.orderBy = val[0]
        } else {
          this.orderBy = 'created_at'
        }
      } else {
        this.orderBy = 'created_at'
      }
    },
    getSortDESC (val) {
      if (val !== undefined) {
        this.order = val ? 'DESC' : 'ASC'
      } else {
        this.order = 'DESC'
      }
    },
    setLoading(val) {
      this.$store.commit('SET_LOADING', val)
    },
    editUser (user_id) {
      this.$router.push({name: 'EditUser', params: { clientId: user_id}})
    },
    getUserReport(user_id) {
      this.$router.push({name: 'UserReport', params: { userReportId: user_id}})
    },
    clearDatePicker () {
      this.dates = []
      this.$nextTick(() => {
        this.$refs.datepicker.$refs.input.blur()
      })
      this.observeUserList()
    },
    async checkUserlistInLocalDB () {
      this.localDB = await this.$store.dispatch('getLocalDB')
      return await this.getUsersFromLocalDB()
    },
    async getUsersFromLocalDB() {
      return new Promise(async (resolve, reject) => {

        let users = [];

        let officer = await this.$store.dispatch('getOfficerFromLocalDB', this.userProfile.user_id)
        if (officer !== undefined) {
          for (const client of officer.clients) {
            let res = await this.$store.dispatch('getUserFromLocalDB', client)
            if (res !== undefined) {
              users.push(res)
            }
          }
          resolve(users)
        } else {
          users = []
          resolve(users)
        }
      })
    },
    highlightRow (user_id) {
      if (this.isLocalData) {
        let idx = this.users.findIndex(user => {
          return user.user_id === user_id
        })
        if (idx !== -1) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }    
    },
    addUserlistFromLocalDBTolist(users) {
      this.users = Array.from(users)
      this.displayUsers = Array.from(users)
      this.countTotalStatus()
      this.setLoading(false)
    },
    async syncUserDataTocloud () {
      this.loadingSyncClient = true
       let results = await this.getUsersFromLocalDB()
       let users = Array.from(results)
       this.totalNumLocalData = results.length

       for (const user of users) {
          if (user !== undefined) {
            let res = Object.assign({}, user) 

            if (res.profile_image !== '') {
              let imageUrl = await this.uploadProfileImageToStorage(res.profile_image)
              res.profile_image = imageUrl
            } else {
              res.profile_image = ''
            }

            delete res.id
            await this.createUserInfo(res)
         }
         this.currentNumLocalData++
       }

       this.loadingSyncClient = false
       this.getInitialUserList()
       let localUsers = await this.getUsersFromLocalDB()
       this.totalNumLocalData = localUsers.length
    },
    async createUserInfo (userInfo) {
      let header = { 'access_token': this.userProfile.access_token }
      await axios
      .post(apiUrl + "/users", userInfo, { headers: header })
      .then( async (response) => {
        let data = response.data
        if (data.status == "success") {
          let res = data.result.user_info
          let localFingerprint = await this.$store.dispatch('getFingerprintFromLocalDB', userInfo.user_id)
          await this.updateFingerprint(res, localFingerprint)
          
          await this.$store.dispatch('removeUserInOfficerStore', userInfo.user_id)
          await this.$store.dispatch('removeUserInLocalDB', userInfo.user_id)
          await this.$store.dispatch('removeFingerprintInLocalDB', userInfo.user_id)
          
        }
      })
      .catch( async (error) => {
        let errorMessage = error.response.data.message_error
        if (errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.createUserInfo(userInfo)
          } 
      })
    },
    async updateFingerprint (userInfo, localFingerprint) {
      let fingerprint = Object.assign({}, localFingerprint) 
      
      for (let [hand, fingerprints] of Object.entries(fingerprint['fingerprint'])) {
        let fingers = Object.keys(fingerprints)
        for (let fIdx = 0; fIdx < fingers.length; fIdx++) {
            const finger = fingers[fIdx]
            for (let aIdx = 1; aIdx <= 7; aIdx++) {
              const angle_ = 'angle_'+aIdx
              const image64 = fingerprints[finger]['angle'][angle_]['image']
              if (image64 !== '') {
                fingerprint['fingerprint'][hand][finger]['angle'][angle_]['image'] = await this.uploadFingerPrintsImageToStorage(userInfo, hand, finger, angle_, image64)
              }
            }
          }
      }
      fingerprint.latest_modified = userInfo.latest_modified
      delete fingerprint.id
      await this.$store.dispatch('updateFingerprint', { user_id: userInfo.user_id, fingerprint: fingerprint })
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
  }
}
</script>
<style scoped>
  .per-page-select {
    margin: 0;
    padding: 0;
    height: 30px;
    max-width: 55px; 
    font-size: 12px !important;
    text-align: center;
  }
  
  @import '../../assets/style/main.css';
</style>
