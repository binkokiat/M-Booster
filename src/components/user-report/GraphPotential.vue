<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report"
      >"กราฟแสดงค่าศักยภาพ"</v-card-title
    >
    <v-card-text class="pt-5 p-content-center">
      <v-row no-gutters class="mx-5">
        <!-- Section Graph -->
        <v-col cols="6" class="px-3">
          <div class="graph-title text-end">"สมองซีกขวา"</div>
          <div class="my-5">
              <radar-chart
                v-if="chartData !== null"
                :options="chartOption"
                :chartdata="chartData"
              ></radar-chart>
          </div>
          <div class="graph-title text-start">"สมองซีกซ้าย"</div>
        </v-col>
        <!-- Section Potential -->
        <v-col cols="6" class="px-3 d-flex" style="justify-content: flex-end">
          <v-card color="#F5F5F5" width="400px" style="border-radius: 29px;box-shadow: unset">
            <v-card-subtitle>
              <v-row no-gutters class="text-center">
                <v-col cols="6" class="title-potential-box"
                  >ศักยภาพ / ส่วนต่าง</v-col
                >
                <v-col cols="6" class="title-potential-box"
                  >ศักยภาพแฝง / ส่วนต่าง</v-col
                >
              </v-row>
            </v-card-subtitle>
            <v-card-text>
              <v-row
                no-gutters
                v-for="(potential, pIdx) in potentials"
                :key="pIdx"
                class="justify-center"
              >
                <v-col cols="6">
                  <div style="justify-content: flex-end;" class="d-flex my-3">
                     <v-tooltip left>
                      <template v-slot:activator="{ on, attrs }">
                        <span 
                        v-bind="attrs"
                        v-on="on" 
                        class="t-uppercase t-bold pointer-default">
                        {{  `R` + `${pIdx + 1}` }}</span>
                      </template>
                      <span style="font-size: .9vmax" class="t-bold">{{
                        mappingTitle(`dpot00R0DPR` + `${pIdx + 1}`)
                        }}</span>
                    </v-tooltip>
                    
                    <v-icon class="ml-3" size="20" color="#70A1FF" @click="displayDescription(`dpot00R0DPR` + `${pIdx + 1}`)"
                      >icon-icon-video</v-icon
                    >
                    <div
                      class="mx-2 p-content-box p-content-box-gray text-white text-center"
                    >
                      {{ potential['pre_r'] }}
                    </div>
                    <div
                      class="p-content-box text-white text-center"
                      :class="colorBox(potential['pre_r'])"
                    >
                      {{ potentialDiff(potential['pre_r']) }}
                    </div>
                    <div style="min-width: 15px;" class="ml-3 mr-2">
                      <v-icon size="15" v-if="potential['a_r'] !== null && potential['a_r'] !== 0"
                        >icon-icon-cross</v-icon
                      >
                    </div>
                  </div>
                  <div style="justify-content: flex-end;" class="d-flex">
                    <v-tooltip left>
                      <template v-slot:activator="{ on, attrs }">
                        <span 
                        v-bind="attrs"
                        v-on="on" 
                        class="t-uppercase t-bold pointer-default">
                        {{ `L` + `${pIdx + 1}` }}</span>
                      </template>
                      <span style="font-size: .8rem" class="t-bold">{{
                        mappingTitle(`dpot00L0DPL` + `${pIdx + 1}`)
                        }}</span>
                    </v-tooltip>
                    <v-icon class="ml-3" size="20" color="#70A1FF" @click="displayDescription(`dpot00L0DPL` + `${pIdx + 1}`)"
                      >icon-icon-video</v-icon
                    >
                    <div
                      class="mx-2 p-content-box p-content-box-gray text-white text-center"
                    >
                      {{ potential['pre_l'] }}
                    </div>
                    <div
                      class="p-content-box p-content-box-red text-white text-center"
                      :class="colorBox(potential['pre_l'])"
                    >
                      {{ potentialDiff(potential['pre_l']) }}
                    </div>
                    <div style="min-width: 15px;" class="ml-3 mr-2">
                      <v-icon size="15" v-if="potential['a_l'] !== null && potential['a_l'] !== 0"
                        >icon-icon-cross</v-icon
                      >
                    </div>
                  </div>
                </v-col>
                <v-col cols="auto">
                  <div class="d-flex my-3" style="justify-content: flex-end;">
                    <div
                      class="mx-2 p-content-box p-content-box-gray text-white text-center"
                    >
                      {{ potential['post_r'] }}
                    </div>
                    <div
                      class="p-content-box text-white text-center"
                      :class="colorBox(potential['post_r'])"
                    >
                      {{ potentialDiff(potential['post_r']) }}
                    </div>
                    <div style="min-width: 15px;" class="ml-3">
                      <v-icon size="15" v-if="potential['a_r'] !== null && potential['a_r'] !== 0"
                        >icon-icon-cross</v-icon
                      >
                    </div>
                  </div>
                  <div class="d-flex" style="justify-content: flex-end;">
                    <div
                      class="mx-2 p-content-box p-content-box-gray text-white text-center"
                    >
                      {{ potential['post_l'] }}
                    </div>
                    <div
                      class="p-content-box text-white text-center"
                      :class="colorBox(potential['post_l'])"
                    >
                      {{ potentialDiff(potential['post_l']) }}
                    </div>
                    <div style="min-width: 15px;" class="ml-3">
                      <v-icon size="15" v-if="potential['a_l'] !== null && potential['a_l'] !== 0"
                        >icon-icon-cross</v-icon
                      >
                    </div>
                  </div>
                </v-col>
                <div v-if="pIdx+1 !== potentials.length" class="mt-2" style="height:0.9px; width:100%; background-color: #707070"></div>
              </v-row>
            </v-card-text>
            <v-card-text class="pt-2">
              <div class="d-flex" style="justify-content: center">
                <div class="d-flex mx-2">
                  <div class="p-expain-box p-content-box-green mr-2"></div>
                  <span>โดดเด่น</span>
                </div>
                <div class="d-flex mx-2">
                  <div class="p-expain-box p-content-box-dark-blue mr-2"></div>
                  <span>ดี</span>
                </div>
                <div class="d-flex mx-2">
                  <div class="p-expain-box p-content-box-yellow mr-2"></div>
                  <span>พอใช้</span>
                </div>
                <div class="d-flex mx-2">
                  <div class="p-expain-box p-content-box-red mr-2"></div>
                  <span>ไม่ถนัด</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    <v-dialog
      v-model="dialog"
      width="70%"
      v-if="description !== null"
      scrollable
      persistent
    >
      <v-card tile>
        <v-card-title class="py-1" style="background-color:#70A1FF; color:white;">
          <v-row no-gutters>
            <div class="text-center pt-1" style="width: 100%">
              <label class="p-sub-title text-white">ค่าศักยภาพ</label>
              <v-icon
                class="text-right pt-1"
                color="white"
                style="position: absolute; right: 15px;"
                @click="closeDialog()"
                size="20"
                >icon-icon-close</v-icon
              >
            </div>
          </v-row>
        </v-card-title>
        <v-card-text class="py-5 px-10">
          <v-row no-gutters class="py-5">
            <v-col cols="3">
              <v-img
              :src="description.image"
              width="83%"
              cover
              >
              </v-img>
            </v-col>
            <v-col cols="9">
              <p class="p-title t-bold">{{ description.header}} </p>
              <p class="p-sub-title t-bold">{{ description.sub_header }} </p>
              <p class="font-infomation">{{ description.information }} </p>
            </v-col>
          </v-row>
          <div class="videoWrapper">
            <iframe
              :src="getYoutubeEmbedLinkFromURL(description.video)" 
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import RadarChart from "../charts/RadarChart.vue";

export default {
  components: { RadarChart },
  name: "GraphPotential",
  props: ['userReport', 'informations'],
  data() {
    return {
      dialog: false,
      description: null,
      chartOption: {
        plugins: {
          datalabels: {
            display: false
          }
        },
        legend: { 
          display: false
        },
        elements: { 
          point: { 
            radius: 0,
            hoverRadius: 0
          } 
        },
        tooltips: {
          enabled: false
        },
        scale: {
            ticks: {
              min: 0
            }
        },
        responsive: true,
        maintainAspectRatio: false,
      },
      chartData: null
    }
  },
  computed: {
    potentials () {
      return this.getDataPotential()
    },
    avgPre () {
      return this.userReport['avg_pre']
    }
   },
  mounted() {
    this.getChartData()
  },
  methods: {
    getDataPotential () {
      let potentials = []
      for (let idx = 1; idx <= 5; idx++) {
        const preRKey = 'pre_r'+idx
        const preLKey = 'pre_l'+idx
        const postRKey = 'post_r'+idx
        const postLKey = 'post_l'+idx
        const aRKey = 'a_r'+idx
        const aLKey = 'a_l'+idx
        let obj = {
          'pre_r': this.userReport[preRKey],
          'pre_l': this.userReport[preLKey],
          'post_r': this.userReport[postRKey],
          'post_l': this.userReport[postLKey],
          'a_r': this.userReport[aRKey],
          'a_l': this.userReport[aLKey]
        }
        potentials.push(obj)
      }
      return potentials
    },
    getChartData () {
      this.chartData = {
        labels: [ "L1", "L2", "L3", "L4", "L5", "R5", "R4", "R3", "R2", "R1"],
        datasets: [
          {
            label: "ค่าประจำตัว",
            backgroundColor: "transparent",
            borderColor: "#39FF11",
            borderWidth: 1,
            pointBackgroundColor: "#39FF11",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#39FF11",
            data: this.getAvgDecrease(),
          },
          {
            label: "Increase",
            backgroundColor: "transparent",
            borderColor: "#39FF11",
            pointBackgroundColor: "#39FF11",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#39FF11",
            data: this.getAvgIncrease(),
          },
          {
            label: "ศักยภาพ",
            backgroundColor: "rgba(123, 100, 220, 0.7)",
            borderColor: "#3D51B4",
            borderWidth: 2,
            pointBackgroundColor: "#3D51B4",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#3D51B4",
            data: this.getPrePotential(),
          },
          {
            label: "ศักยภาพแฝง",
            backgroundColor: "rgba(230, 74, 25, 0.7)",
            borderColor: "#EC0927",
            borderWidth: 2,
            pointBackgroundColor: " #EC0927",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#EC0927",
            data: this.getPostPotential(),
          },
          {
            label: "ลายนิ้วมือ A",
            backgroundColor: "rgba(255, 247, 30, 0.7)",
            borderColor: "#FFF94C ",
            borderWidth: 2,
            pointBackgroundColor: "#FFF94C",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#FFF94C",
            data: this.getAPotential(),
          }
        ],
      }
    },
    getPrePotential () {
      let res = [
        this.userReport['pre_l1'],
        this.userReport['pre_l2'],
        this.userReport['pre_l3'],
        this.userReport['pre_l4'],
        this.userReport['pre_l5'],
        this.userReport['pre_r5'],
        this.userReport['pre_r4'],
        this.userReport['pre_r3'],
        this.userReport['pre_r2'],
        this.userReport['pre_r1']
      ]
      return res
    },
    getPostPotential () {
      let res = [
        this.userReport['post_l1'],
        this.userReport['post_l2'],
        this.userReport['post_l3'],
        this.userReport['post_l4'],
        this.userReport['post_l5'],
        this.userReport['post_r5'],
        this.userReport['post_r4'],
        this.userReport['post_r3'],
        this.userReport['post_r2'],
        this.userReport['post_r1']
      ]
      return res
    },
    getAPotential () {
      let a_l1 = this.userReport['a_l1'] === 0 ? this.userReport['post_l1'] : this.userReport['a_l1']
      let a_l2 = this.userReport['a_l2'] === 0 ? this.userReport['post_l2'] : this.userReport['a_l2']
      let a_l3 = this.userReport['a_l3'] === 0 ? this.userReport['post_l3'] : this.userReport['a_l3']
      let a_l4 = this.userReport['a_l4'] === 0 ? this.userReport['post_l4'] : this.userReport['a_l4']
      let a_l5 = this.userReport['a_l5'] === 0 ? this.userReport['post_l5'] : this.userReport['a_l5']
      let a_r5 = this.userReport['a_r5'] === 0 ? this.userReport['post_r5'] : this.userReport['a_r5']
      let a_r4 = this.userReport['a_r4'] === 0 ? this.userReport['post_r4'] : this.userReport['a_r4']
      let a_r3 = this.userReport['a_r3'] === 0 ? this.userReport['post_r3'] : this.userReport['a_r3']
      let a_r2 = this.userReport['a_r2'] === 0 ? this.userReport['post_r2'] : this.userReport['a_r2']
      let a_r1 = this.userReport['a_r1'] === 0 ? this.userReport['post_r1'] : this.userReport['a_r1']

      let res = [
        a_l1,
        a_l2,
        a_l3,
        a_l4,
        a_l5,
        a_r5,
        a_r4,
        a_r3,
        a_r2,
        a_r1
      ]
      return res
    },
    getAvgDecrease () {
      // let decrease = this.avgPre - 3.0
      // let AvgDecrease = decrease.toFixed(2)
      let res = [this.avgPre, this.avgPre, this.avgPre, this.avgPre, this.avgPre, this.avgPre, this.avgPre, this.avgPre, this.avgPre, this.avgPre]
      return res
    },
    getAvgIncrease () {
      let increase = this.avgPre + 3.0
      let AvgIncrease = increase.toFixed(2)
      let res = [AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease, AvgIncrease]
      return res
    },
    potentialDiff(p) {
      const avgPre = this.avgPre;
      let p_different = p - avgPre;
      return p_different.toFixed(2);
    },
    colorBox(p) {
      let diff = this.potentialDiff(p);
      let diffNumber = parseFloat(diff);

      if (diffNumber >= 3) {
        return "p-content-box-green";
      } else if (diffNumber >= 0.00 && diffNumber <= 2.99) {
        return "p-content-box-dark-blue";
      } else if (diffNumber >= -2.99 && diffNumber <= -0.01) {
        return "p-content-box-yellow";
      } else if (diffNumber < -3.00) {
        return "p-content-box-red";
      } else {
        return "p-content-box-gray";
      }
    },
    mappingTitle (key) {
      let found = this.informations.find((list, index) => {
        if(list.mb_code === key) return true
      })
      if (found !== undefined) {
        return found.sub_header
      }
    },
    displayDescription(key) {
      let found = this.informations.find((list, index) => {
        if(list.mb_code === key) return true
      })
      this.description = found
      this.dialog = true
    },
    getYoutubeEmbedLinkFromURL (url) {
      const youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig
      const timeRegexp = /t=(\d+)[ms]?(\d+)?s?/
      const embed = 'https://www.youtube.com/embed/'
      let id = url.replace(youtubeRegexp, '$1')
      if (id.includes(';')) {
        let pieces = id.split(';')
        if (pieces[1].includes('%')) {
          let uriComponent = decodeURIComponent(pieces[1])
          id = ("http://youtube.com" + uriComponent).replace(youtubeRegexp, '$1')
        } else {
          id = pieces[0]
        }
      } else if (id.includes('#')) {
        id = id.split('#')[0]
      }
      let full_link = `${embed}${this.checkZeroWidthSpaceByUnicode(id)}`
      return full_link
    },
    checkZeroWidthSpaceByUnicode(theString) {
      const base_string = theString.split('')
      let unicodeString = ''
      for (let i=0; i < theString.length; i++) {
        let theUnicode = theString.charCodeAt(i).toString(16).toUpperCase();
        while (theUnicode.length < 4) {
          theUnicode = '0' + theUnicode
        }
        theUnicode = '\\u' + theUnicode
        // Check Zero Width Space
        if (!theUnicode.includes('\\u200B')) {
          unicodeString += base_string[i]
        }
        // unicodeString += theUnicode; // return Full Unicode
      }
      return unicodeString
    },
    closeDialog () {
      this.dialog = false
      this.description = null
    }
  },
};
</script>
<style scoped>
@import "../../assets/style/report-style.css";
</style>
