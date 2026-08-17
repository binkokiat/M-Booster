<template>
  <section class="section-container">
    <v-row class="signin">
      <v-col cols="6" class="left">
        <div class="logo">
          <img
            src="../../assets/images/logo mind booster.png"
            height="200"
            style="margin-top: 120px"
          />
        </div>
      </v-col>
      <v-col cols="6" class="right text-center">
        <v-col cols="12" style="padding-left: 100px; padding-right: 100px">
          <p style="font-size: 58px">เข้าสู่ระบบ</p>
          <p style="font-size: 22px; margin-bottom: 54px">
            ลงชื่อเข้าใช้ด้วยบัญชีของคุณ
          </p>
          <v-form ref="form" lazy-validation>
            <v-alert
              v-if="!isLogin"
              outlined
              type="error"
              class="text-start"
            >
              {{ loginFail }}
            </v-alert>
            <v-text-field
              v-model="emailForm"
              label="อีเมล/ชื่อผู้ใช้"
              append-icon="icon-icon-email"
              outlined
              :rules="emailRules"
              required
              class="icon-size-16"
              style="font-family: 'Prompt', sans-serif !important;"
              v-on:keyup="checkEnterPressedToSubmit"
              placeholder=" "
            ></v-text-field>
            <v-text-field
              v-model="passwordForm"
              label="รหัสผ่าน"
              append-icon="icon-Password_icon"
              outlined
              type="password"
              :rules="passwordRules"
              required
              class="icon-size-18"
              style="font-family: 'Prompt', sans-serif !important;"
              v-on:keyup="checkEnterPressedToSubmit"
              placeholder=" "
            ></v-text-field>
            <a
              @click="$router.push({ name: 'ForgetPassword' })"
              style="color: black; margin-right: 2px; float: right"
            >
              <u>ลืมรหัสผ่าน ?</u>
            </a>
            <v-btn
              depressed
              dark
              block
              height="64"
              color="#466BB2"
              style="font-size: 24px; margin-top: 78px"
              @click="submit"
            >
              เข้าสู่ระบบ
            </v-btn>
          </v-form>
        </v-col>
      </v-col>
    </v-row>
  </section>
</template>
<script>
import { apiUrl } from "../../utils/url";
import axios from 'axios'

export default {
  name: "signIn",
  data() {
    return {
      emailForm: "",
      passwordForm: "",
      emailRules: [
        (value) => !!value || "กรุณากรอก อีเมลหรือชื่อผู้ใช้*",
      ],
      passwordRules: [(value) => !!value || "กรุณากรอกรหัสผ่าน*"],
      loginFail: '',
      isLogin: true
    };
  },
  computed: {
    email () {
      return this.$route.params.email
    },
  },
  mounted() {
    this.setLoading(true);
    setTimeout(() => {
      this.setLoading(false);
    }, 1000);
  },
  created() {
    if (this.email !== undefined) {
      this.emailForm = this.email
    }
  },
  methods: {
    setLoading(val) {
      this.$store.commit("SET_LOADING", val);
    },
    async checkEnterPressedToSubmit (e) {
      if (e.keyCode === 13) this.submit()
    },
    async submit() {
      if (this.$refs.form.validate()) {
        this.loginWithAPI(this.emailForm, this.passwordForm)
      }
    },
    async loginWithAPI (email, password) {
      this.setLoading(true)
      let payload = {
        email: email.trim(), 
        password: password.trim()
      }
      axios
      .post(apiUrl + "/auth/login", payload)
      .then(async (response) => {
        let data = response.data
        if (data.status === "success") {
          await this.$store.commit('SET_USERS_DATA', data.result)
          await this.$store.dispatch('storeUsersToLocalStorage', data.result)
          if (data.result[0].role === 'User') {
            this.$router.push({name: 'UserReport', params: { userReportId: data.result[0].user_id}})
          } else {
            this.$router.push({ name: "UserList" })
          }  
        }
        this.setLoading(false)
      })
      .catch((error) => {
        this.setLoading(false)
        if (error.response.data.message_error === 'Account not found') {
          this.loginFail = 'ไม่พบบัญชีผู้ใช้งาน'
          this.isLogin = false
        } else if (error.response.data.message_error === 'Password is not invalid') {
          this.loginFail = 'รหัสผ่านไม่ถูกต้อง'
          this.isLogin = false
        } else {
          this.loginFail = 'มีบางอย่างผิดพลาด กรุณาติดต่อ Mind Booster Support'
          this.isLogin = false
        }
      })
    }
  },
};
</script>
<style scoped>
@import "../../assets/style/main.css";
</style>