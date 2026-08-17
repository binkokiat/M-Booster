<template>
  <div v-if="userProfile">
    <div class="pa-3 content background-main">
      <div v-if="userReport && informations">
        <div v-if="userReport['mydna_id']">
          <v-row no-gutters>
            <v-col cols="12" class="text-end">
              <p>
                <span>
                  รายงานของ {{ userReport.first_name === "" || userReport.last_name === "" ? userReport.nick_name : userReport.first_name + " " + userReport.last_name }}
                </span>
                <span v-if="userReport.class !== null"> : {{ userReport.class }}</span>
              </p>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-card width="100%" height="82vh">
              <v-tabs 
                vertical 
                hide-slider 
                background-color="#FFFFFF" 
                v-model="tab">
                    <v-tab 
                        class="menu-tab justify-start px-7" 
                        active-class="menu-tab-active"
                        v-for="tab in tabs" 
                        :key="tab" 
                    >
                      {{ tab }}
                    </v-tab>
                    <v-tabs-items v-model="tab">
                        <!-- ลักษณะนิสัยที่ 1 -->
                        <v-tab-item transition="fade-transition">
                            <character-1 :userReport="userReport" :informations="informations.character"></character-1>
                        </v-tab-item>
                        
                        <!-- ลักษณะนิสัยที่ 2 -->
                        <v-tab-item transition="fade-transition">
                            <character-2 :userReport="userReport" :informations="informations"></character-2>
                        </v-tab-item>

                        <!-- ลักษณะทางความคิด -->
                        <v-tab-item transition="fade-transition">
                            <conceptual-characteristics :userReport="userReport" :informations="informations.subconscious_character"></conceptual-characteristics>
                        </v-tab-item>

                        <!-- คำแนะนำตามลักษณะนิสัย -->
                        <v-tab-item transition="fade-transition">
                            <recommendation-of-habit :userReport="userReport" :informations="informations.main_character"></recommendation-of-habit>
                        </v-tab-item>

                        <!-- แรงจูงใจในภาพรวม -->
                        <v-tab-item transition="fade-transition">
                            <overall-motivation :userReport="userReport" :informations="informations.driver"></overall-motivation>
                        </v-tab-item>

                        <!-- ช่องทางการรับข้อมูล -->
                        <v-tab-item transition="fade-transition">
                            <awareness-channel :userReport="userReport" :informations="informations"></awareness-channel>
                        </v-tab-item>

                        <!-- กราฟค่าศักยภาพ -->
                        <v-tab-item transition="fade-transition">
                            <graph-potential :userReport="userReport" :informations="informations.potential"></graph-potential>
                        </v-tab-item>

                        <!-- ศักยภาพ 10 ด้าน -->
                        <v-tab-item transition="fade-transition">
                            <potential-10-sides :userReport="userReport" :informations="informations.potential"></potential-10-sides>
                        </v-tab-item>

                        <!-- กิจกรรมตามค่าศักยภาพ -->
                        <v-tab-item transition="fade-transition">
                          <activities-by-potential :userReport="userReport" :informations="informations.activity"></activities-by-potential>
                        </v-tab-item>
                    </v-tabs-items>
                </v-tabs>
            </v-card>
          </v-row>
          <!-- Action button -->
          <div v-if="userProfile.role !== 'User'" class="floating-button" style="display: flex">
            <div class="mr-3">
                <v-btn 
                  v-if="userReport.email === null || userReport.email === ''"
                  disabled 
                  color="#C5C5C5"
                  x-large 
                  fab
                >
                    <v-icon size="29">icon-icon-email</v-icon>
                </v-btn>
                <v-btn 
                  v-else
                  x-large 
                  fab 
                  dark
                  color="#466BB2" 
                  @click="sendUserReport(userReport)"
                >
                    <v-icon size="29">icon-icon-email</v-icon>
                </v-btn>
            </div>
          </div>
        </div>
        <div v-else >
          <v-row no-gutters>
            <v-col class="not-found-report">
              <p style="font-size: 4rem; color: #707070">
                <v-icon size="50">icon-Alert_icon</v-icon>
                ไม่พบรายงาน
              </p>
            </v-col>
          </v-row>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios'
import { apiUrl } from '../../utils/url'
import AwarenessChannel from '../../components/user-report/AwarenessChannel.vue';
import Character1 from "../../components/user-report/Character1.vue";
import Character2 from '../../components/user-report/Character2.vue';
import ConceptualCharacteristics from '../../components/user-report/ConceptualCharacteristics.vue';
import RecommendationOfHabit from '../../components/user-report/RecommendationOfHabit.vue';
import OverallMotivation from '../../components/user-report/OverallMotivation.vue';
import GraphPotential from '../../components/user-report/GraphPotential.vue';
import ActivitiesByPotential from '../../components/user-report/ActivitiesByPotential.vue';
import Potential10Sides from '../../components/user-report/Potential10Sides.vue';

export default {
  components: {
    Character1,
    Character2,
    AwarenessChannel,
    RecommendationOfHabit,
    ConceptualCharacteristics,
    OverallMotivation,
    GraphPotential,
    ActivitiesByPotential,
    Potential10Sides,
  },
  data() {
    return {
      tabs: [
        "ลักษณะนิสัย 1",
        "ลักษณะนิสัย 2",
        "ลักษณะทางความคิด",
        "คำแนะนำตามลักษณะนิสัย",
        "แรงจูงใจในภาพรวม",
        "ช่องทางการรับข้อมูล",
        "กราฟค่าศักยภาพ",
        "ศักยภาพ 10 ด้าน",
        "กิจกรรมตามค่าศักยภาพ",
      ],
      tab: null,
      dataCharacter1: null,
      informations: null,
      userReport: null,
      prevRoute: null,
      userID: ''
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from
    })
  },
  computed: {
    userProfile () {
      return this.$store.state.currentUser
    }
  },
  mounted() {
    this.getUserId()
  },
  async created() {
   await this.$store.dispatch('getUserProfile')

    if (this.userProfile !== null) {
      this.userID = await this.getUserId()
      this.getInitailData()
    }
  },
  methods: {
    getUserId () {
      let userID = ''
      if (this.userProfile !== null) {
        if (this.userProfile['role'] === 'Analyst' || this.userProfile['role'] === 'Collector' ) {
          userID = this.$route.params.userReportId
        } else if (this.userProfile['role'] === 'User') {
          userID = this.userProfile['user_id']
        }
      }
      return userID
    },
    async getInitailData() {
      this.setLoading(true)
      this.userReport = null
      this.informations = null
      this.userReport = await this.getUserReport()
      this.informations = await this.getUserReportInformation()
      this.setLoading(false)
    },
    async getUserReport () {
      return new Promise( (resolve, reject) => {
        let  header = {'access_token': this.userProfile.access_token}
        axios.get(apiUrl + "/users/"+ this.userID + "/report", {headers: header})
          .then((response) => {
            let data = response.data
            if (data.status === 'success') {
              resolve(data.result.user_report) 
            }
          })
          .catch(async (error) => {
            let errorMessage = error.response.data.message_error
            if(errorMessage === 'Access token expired') {
                await this.$store.dispatch('refreshToken')
                this.getInitailData()
            } else {
              this.setLoading(false)
              this.$store.dispatch('logout')
            }
          })
       })
    },
    getUserReportInformation() {
      return new Promise( (resolve, reject) => {
        let  header = {'access_token': this.userProfile.access_token}

        axios.get(apiUrl + "/informations", {headers: header})
          .then((response) => {
            let data = response.data
            if (data.status === 'success') {
              resolve(data.result) 
            }
          })
          .catch(async (error) => {
            let errorMessage = error.response.data.message_error
            if(errorMessage === 'Access token expired') {
                await this.$store.dispatch('refreshToken')
                this.getInitailData()
            } else {
              this.setLoading(false)
              this.$store.dispatch('logout')
            }
          })
       })
      
    },
    sendUserReport (userReport) {
      let text = `<h6>ต้องการส่งรายงานให้ </br> คุณ${ userReport.first_name } ${ userReport.last_name } </br> อีเมล  ${ userReport.email } หรือไม่ </h6>`
      this.$swal({
        title: text,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#74B9FF",
        cancelButtonColor: "#EC0927",
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
        customClass: "font-prompt",
      }).then((result) => {
        if (result.isConfirmed) {
          this.sendReportWithAPI(userReport.user_id)
        }
      })
    },
    sendReportWithAPI(user_id) {
      let data = []
      data.push(user_id)
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
          }
      })
      .catch(async (error) => {
          let errorMessage = error.response.data.message_error
          if(errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.sendReportWithAPI(user_id)
          } else {
              this.setLoading(false)
              this.$store.dispatch('logout')
          }
      })
    },
    setLoading(val) {
      this.$store.commit('SET_LOADING', val)
    },
  },
};
</script>
<style scoped>
@import "../../assets/style/main.css";
@import "../../assets/style/report-style.css";
</style>
