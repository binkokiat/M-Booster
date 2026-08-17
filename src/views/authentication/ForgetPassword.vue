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
          <p style="font-size: 58px">ลืมรหัสผ่าน ?</p>
          <p style="font-size: 26px; margin-bottom: 54px">
            กรุณากรอกอีเมลของท่านด้านล่าง<br>ระบบจะส่งรหัสใหม่ให้ท่านทางอีเมล
          </p>
          <v-form ref="form" lazy-validation>
            <v-alert
              v-if="!isChangePassword"
              outlined
              type="error"
              class="text-start"
            >
              {{ changePasswordFail }}
            </v-alert>
            <v-text-field
              v-model="email"
              label="อีเมล"
              append-icon="icon-icon-email"
              outlined
              type="email"
              :rules="emailRules"
              required
              class="icon-size-16"
              style="font-family: 'Prompt', sans-serif !important;"
            ></v-text-field>
            <v-btn
              depressed
              dark
              block
              height="64"
              color="#E66E32"
              style="font-size: 24px; margin-top: 28px; margin-bottom: 74px;"
              @click="submit"
            >
              เปลี่ยนรหัสผ่าน
            </v-btn>
            <a
              @click="$router.push({ name: 'SignIn' })"
              style="color: black; font-size: 20px;"
            >
              <u>กลับไปหน้าเข้าสู่ระบบ</u>
            </a>
          </v-form>
        </v-col>
      </v-col>
    </v-row>
  </section>
</template>
<script>
import { apiUrl } from "../../utils/url"
import axios from 'axios'

export default {
  name: "forgetPassword",
  data() {
    return {
      email: '',
      emailRules: [
        value => !!value || "กรุณากรอกอีเมล",
        value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;
          return pattern.test(value) || "รูปแบบอีเมลไม่ถูกต้อง";
        },
      ],
      isChangePassword: true,
      changePasswordFail: '',
    };
  },
  mounted() {
    this.setLoading(true);
    setTimeout(() => {
      this.setLoading(false);
    }, 1000);
  },
  methods: {
    setLoading(val) {
      this.$store.commit("SET_LOADING", val);
    },
    submit() {
      if(this.$refs.form.validate()) {
        this.sentEmailToResetPassWord()
      }
    },
    // Sent email for get recover code to reset password
    sentEmailToResetPassWord() {
      this.setLoading(true)
      axios
      .post(apiUrl + "/auth/"+this.email+"/password")
      .then((response) => {
        let data = response.data
        if (data.status === "success") {
          this.setLoading(false)
          this.$router.push({ name: "ChangePassword", params: { email: this.email, recoveryCode: null } })
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
  },
};
</script>
<style scoped>
@import "../../assets/style/main.css";
</style>