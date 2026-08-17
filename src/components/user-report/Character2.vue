<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report">"ลักษณะนิสัย 2"</v-card-title>
    <v-card-text class="pt-5 brain-scroll">
      <v-row no-gutters class="mx-10">
        <v-col
          cols="6"
          class="px-3"
          v-for="item in items"
          :key="item"
        >
          <v-card tile style="min-height: 300px; height: fit-content;" v-if="item === 'fcha_01' || item === 'fcha_03'">
            <v-card-title class="brain-box-title">
              {{ mappingTitle(item) }}
            </v-card-title>
            <v-card-text class="pt-2 brain-box">
              <p class="brain-box-sub-title">
                {{ mappingHeaderBrain(item) }}
              </p>
              <p class="font-infomation new-line">
                {{ mappingDetail(item) }}
              </p>
            </v-card-text>
          </v-card>
          <v-card tile class="mt-3 personality-box" v-if="item === 'fcha_02' || item === 'fcha_04'">
            <v-card-text class="mt-3">
              <p class="personality-box-sub-title">
                {{ mappingHeaderPersonality(item) }}
              </p>
              <p class="font-infomation new-line">
                {{ mappingPersonalityDetail(item) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "Character2",
  props: ['userReport', 'informations'],
  data() {
    return {
      items: ['fcha_01', 'fcha_03', 'fcha_02', 'fcha_04']
    };
  },
  computed: {
    userProfile () {
      return this.$store.state.currentUser
    },
    overall () {
      return this.informations.overall_charecteristics
    },
    personality () {
      return this.informations.personality
    }
  },
  methods: {
    mappingTitle(key) {
      let found = this.overall.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      let res = found.header.split('ของ')
      return res[1]
    },
    mappingHeaderBrain (key) {
      let found = this.overall.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      return found.header
    },
    mappingDetail(key) {
      let found = this.overall.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      return found.information
    },
    mappingHeaderPersonality (key) {
      let found = this.personality.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      return found.header
    },
    mappingPersonalityDetail (key) {
      let found = this.personality.find(info => {
        if (info.mb_code === this.userReport[key]) return true
      })
      return found.information
    }
  },
};
</script>
<style scoped>
@import "../../assets/style/report-style.css";
</style>
