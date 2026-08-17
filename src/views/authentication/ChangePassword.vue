<template>
  <section class="section-container">
    <v-row class="signin">
      <v-col cols="12" class="full-bg">
        <div class="text-center">
          <img
            src="../../assets/images/logo mind booster.png"
            height="150"
            style=""
          />
          <v-card min-width="800" class="pa-5" style="border-radius: 20px">
            <v-card-text>
              <div class="my-5">
                <p style="font-size: 42px; font-weight: 500; color: #707070">
                  เปลี่ยนรหัสผ่าน
                </p>
              </div>
            </v-card-text>
            <v-card-actions style="justify-content: center" class="pb-0">
              <div style="min-width: 500px">
                <v-form ref="form" lazy-validation>
                  <v-alert
                    v-if="!isChangePassword"
                    outlined
                    type="error"
                    class="text-start"
                  >
                    {{ changePassWordFail }}
                  </v-alert>
                  <v-text-field
                    v-model="recoverCode"
                    label="Recovery Code"
                    outlined
                    type="text"
                    :rules="recoverRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="password"
                    label="รหัสผ่านใหม่"
                    outlined
                    type="password"
                    :rules="passwordRules"
                    required
                  ></v-text-field>
                  <v-text-field
                    v-model="confirmPassword"
                    label="ยืนยันรหัสผ่านใหม่"
                    outlined
                    type="password"
                    :rules="confirmPasswordRule"
                    required
                  ></v-text-field>
                  <v-btn
                    depressed
                    dark
                    block
                    height="64"
                    color="#E66E32"
                    style="font-size: 24px;"
                    class="mb-3"
                    @click="submit"
                  >
                    เปลี่ยนรหัสผ่าน
                  </v-btn>
                  <a
                    @click="sentEmailToResetPassWord()"
                    style="color: black; text-decoration: underline;"
                  >
                    <u>ขอ Recovery Code อีกครั้ง</u>
                  </a> | 
                  <a
                    @click="$router.push({ name: 'SignIn' })"
                    style="color: black; text-decoration: underline;"
                  >
                    <u>กลับไปหน้าเข้าสู่ระบบ</u>
                  </a>
                </v-form>
              </div>
            </v-card-actions>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </section>
</template>
<script>
import { apiUrl } from "../../utils/url";
import axios from 'axios'
import jwt from 'jwt-simple'
import qs from 'qs'


export default {
  name: "forgetPassword",
  data() {
    return {
      recoverCode: '',
      password: '',
      confirmPassword: '',
      recoverRules: [(value) => !!value || "กรุณากรอก Recovery Code"],
      passwordRules: [(value) => !!value || "กรุณากรอกรหัสผ่าน"],
      confirmPasswordRule: [
        value => !!value || 'กรุณากรอกรหัสผ่านใหม่อีกครั้ง.',
        value => (value === this.password) || 'รหัสผ่านไม่ตรงกัน'
      ],
      changePassWordFail: '',
      isChangePassword: true
    };
  },
  computed: {
    email () {
      return this.$route.params.email
    },
    recoveryParams () {
      return this.$route.params.recoveryCode
    },
  },
  mounted() {
    this.setLoading(true)
    if (this.recoveryParams) this.recoverCode = this.recoveryParams
    setTimeout(() => {
      this.setLoading(false)
    }, 1000)
  },
  methods: {
    setLoading(val) {
      this.$store.commit("SET_LOADING", val)
    },
    submit() {
      if (this.$refs.form.validate()) {
        this.isChangePassword = true
        this.changePassWordFail = ''
        this.resetPasswordWithAPI()
      }
    },
    resetPasswordWithAPI() {
      this.setLoading(true)
        const payload = {
            recovery_code: this.recoverCode,
            password: this.password
        };
        const token = jwt.encode(payload, "ics-mind-booster");
        const data = qs.stringify({
            token: token
        });

      axios
      .put(apiUrl + "/auth/"+this.email+"/password", data)
      .then((response) => {
        let data = response.data
        if (data.status === "success") {
          this.setLoading(false)
          this.$swal({
            title: 'เปลี่ยนรหัสผ่านสำเร็จ',
            icon: 'success',
            confirmButtonText: 'ตกลง',
            customClass: 'font-prompt'
          })
          this.$router.push({ name: "SignIn" })
        }
      })
      .catch((error) => {
        this.setLoading(false)
        if (error.response.data.message_error === 'Recovery code is not invalid') {
          this.changePassWordFail = 'Recovery code ไม่ถูกต้อง หรือ Recovery code หมดอายุ'
          this.isChangePassword = false
        }
      })
    },
    // Sent email for get recover code to reset password
    sentEmailToResetPassWord() {
      if (this.email !== undefined) {
        this.setLoading(true)
        axios
        .post(apiUrl + "/auth/"+this.email+"/password")
        .then((response) => {
          let data = response.data
          if (data.status === "success") {
            this.setLoading(false)
            this.$swal({
              title: 'ขอ Recovery Code สำเร็จ',
              text: 'กรุณาตรวจสอบอีเมล',
              icon: 'success',
              confirmButtonText: 'ตกลง',
              customClass: 'font-prompt'
            })
          }
        })
        .catch((error) => {
          this.setLoading(false)
          if (error.response.data.message_error === 'Email not found') {
            this.changePasswordFail = 'ไม่พบอีเมลผู้ใช้งาน'
            this.isChangePassword = false
          }
        })
      }
    }
  },
};
</script>
<style scoped>
@import "../../assets/style/main.css";
</style>