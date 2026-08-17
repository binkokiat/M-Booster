<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report">"ลักษณะนิสัย 1"</v-card-title>
    <v-card-text class="pt-5 brain-scroll">
      <v-row no-gutters class="mx-10">
        <v-col cols="2" class="sub-header text-white">
          <div class="text-center">
            <p style="font-size: 1.1vmax;">ตำแหน่งรูปนิ้วมือ</p>
            <p style="font-size: 1.1vmax;">รูปแบบลาย</p>
          </div>
        </v-col>
        <v-col cols="10" class="f-box">
          <v-row no-gutters class="px-5" justify="space-around">
            <div v-for="(item, r) in items" :key="r">
              <p class="mb-0 f-title text-back font-bold">{{ item.title }}</p>
              <p class="mb-0 mt-2 text-back font-bold" style="display: flex">
                <v-icon>icon-finger_icon</v-icon>
                <span class="ml-3">
                  <div>
                    {{ getHeaderEN(item.key) }}
                  </div>
                  <div>
                    {{ getHeaderTH(item.key) }}
                  </div>
                </span>
              </p>
            </div>
          </v-row>
        </v-col>
      </v-row>
      <v-row no-gutters class="pt-5 px-10">
        <div v-for="(detail, d) in getDetialsDisplay" :key="'d'+d">
          <p class="my-1 f-title text-back font-bold"> 
            {{ detail.header }}
          </p>
          <p class="font-infomation-charater1">
            {{ detail.information }}
          </p>
        </div>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Character1",
  props: ['userReport', 'informations'],
  data() {
    return {
      items: [
        { title: "นิ้วโป้งซ้าย (L1)", key: 'acha_01' },
        { title: "นิ้วชี้ซ้าย (L2)",  key: 'acha_02' },
        { title: "นิ้วโป้งขวา (R1)", key: 'acha_03' },
        { title: "นิ้วชี้ขวา (R2)",  key: 'acha_04' }
      ],
      details: []
    };
  },
  computed: {
    userProfile () {
      return this.$store.state.currentUser
    },
    getDetialsDisplay() {
      return [...new Set(this.details.map(detail => detail))]
    }
  },
  watch: {
    userProfile (user) {
      this.getDetials()
    }
  },
  created() {
    this.getDetials()
  },
  methods: {
    getHeaderEN(key) {
      let found = this.informations.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      let res = found.header.split(' ')
      return res[0]
    },
    getHeaderTH(key) {
      let found = this.informations.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      let res = found.header.split(' ')
      return res[1]
    },
    getDetials () {
      this.details = []
      this.items.forEach(item => {
       let found = this.informations.find(info => {
          if (info.mb_code === this.userReport[item.key]) return true
        })
        this.details.push(found)
      })
    }
  }
};
</script>
<style scoped>
@import "../../assets/style/report-style.css";
</style>
