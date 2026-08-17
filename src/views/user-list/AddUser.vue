<template>
  <div class="user-profile" v-if="userProfile">
    <div class="pa-3 content background-main">
      <!-- Form Information panel -->
      <form-user-information
      ></form-user-information>
      <!-- Form Figerprint panel -->
      <form-user-fingerprints 
        :save="isSaveFingerprint" 
        @create="updateFingerPrint"
      ></form-user-fingerprints>

      <!-- Action button -->
      <div class="floating-button" style="display: flex;">
        <div class="mr-3" v-if="getStatus === 'Reported'">
          <v-btn x-large fab dark color="#0F6939">
            <v-icon>icon-result_icon</v-icon>
          </v-btn>
        </div>
        <div class="mr-3" v-if="userProfile.role !== undefined && userProfile.role === 'Analyst'">
            <v-btn class="pointer-default" x-large fab dark color="#C5C5C5">
                <span style="font-size: 24pt">AI</span>
            </v-btn>
        </div>
        <div>
          <v-btn v-if="getStatus === 'AI-Processing'" x-large fab dark color="#C5C5C5">
            <v-icon>icon-Save_icon</v-icon>
          </v-btn>
          <v-btn v-else x-large fab dark color="#74B9FF" @click="setSaveUserInfo()">
            <v-icon>icon-Save_icon</v-icon>
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FormUserInformation from "../../components/user-list/FormUserInformation.vue";
import FormUserFingerprints from "../../components/user-list/FormUserFingerprints.vue";

export default {
  name: "user",
  components: {
    FormUserInformation,
    FormUserFingerprints,
  },
  data() {
    return {
      popupDisapprove: false,
      isSave: false,
      isSaveFingerprint: false,
      latestModified: '',
      userRole: JSON.parse(window.localStorage.getItem("current_user")).role 
    };
  },
  computed: {
    getStatus () {
      return this.$store.state.status
    },
    userInfo () {
      return this.$store.state.userInfo
    },
    userProfile () {
      return this.$store.state.currentUser
    },
    isOnline () {
      return this.$store.state.isOnline
    },
    async isOnline (val) {
      if (val) {
          await this.$store.dispatch('getUserProfile')  
      }
    }
  },
  async created() {
    await this.$store.dispatch('getUserProfile')
  },
  methods: {
    setSaveUserInfo() {
      this.$store.commit('SET_SAVE_FROM_ADD_USER_PAGE', true)
      this.$store.commit('SET_IS_SAVE_USER_INFO', true)
    },
    async updateFingerPrint (fingerprint) {
      let userID = this.userInfo.user_id
      if (fingerprint === null) {
        this.setLoading(false)
        this.$swal({
          title: "บันทึกข้อมูลสำเร็จ",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          customClass: 'font-prompt'
        })
        this.$router.push({name: 'EditUser', params: { clientId: userID}})
      } else {
        fingerprint.latest_modified = this.latestModified
        let fingerprintInfo = await this.$store.dispatch('updateFingerprint', { user_id: userID, fingerprint: fingerprint })
        if (fingerprintInfo === 'success') {
          this.$swal({
            title: "บันทึกข้อมูลสำเร็จ",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
            customClass: 'font-prompt'
          })
          this.$router.push({name: 'EditUser', params: { clientId: userID}})
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
      }
    },
    setLoading(val) {
      this.$store.commit('SET_LOADING', val)
    },
    backToPreviousPage() {
      this.$router.go(-1)
    },
  },
};
</script>
<style scoped>
@import "../../assets/style/main.css";
</style>
