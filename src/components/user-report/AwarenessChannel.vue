<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report"
      >"ช่องทางการรับข้อมูล"</v-card-title
    >
    <v-card-text class="pt-5 brain-scroll">
        <v-row  no-gutters class="mx-5">
        <v-col cols="8">
          <!-- Graph -->
            <bar-chart
              v-if="chartData !== null"
              :width="400"
              :height="300"
              :chartdata="chartData"
              :options="chartOptions"
            ></bar-chart>
          <div class="mt-5">
            <p class="font-expain">
              <span class="d-flex">
                <div style="align-self: center">
                  <v-icon color="#EC0927" size="20">icon-icon-circle</v-icon>
                </div>
                <div class="ml-2">
                  บอกลำดับของช่องทางการเรียนรู้ที่เด่นที่สุดตามลำดับ เช่น
                  หมายเลข 1 คือเด่นที่สุด 2 และ 3 คือลำดับถัดไป
                  สามารถเปรียบเทียบตามค่า % ของแต่ละช่องทางที่แสดงไว้ประกอบได้
                </div>
              </span>
            </p>
          </div>
        </v-col>
        <v-col cols="4" class="pl-5 pb-5">
          <v-img
            v-if="tabSelected !== null"
            :src="lists[tabSelected].image"
            height="45vh"
          >
          </v-img>
        </v-col>
      </v-row>
      <v-row no-gutters class="mx-5 cn-tab-box">
        <v-tabs grow hide-slider background-color="#ffffff" v-model="tab">
          <v-tab
            v-for="(tab, cn) in tabs"
            :key="cn"
            :class="tabClass[cn]"
            :active-class="tabClassActive[cn]"
          >
             <v-img :src="tab.icon" max-height="20" max-width="20" ></v-img>
            <span class="mx-2 black--text" style="font-size: 1vmax;">{{ tab.header }}</span>
          </v-tab>
          <v-tabs-items v-model="tab">
            <v-tab-item v-for="(list, lIdx) in lists" :key="lIdx">
              <div class="mt-10">
                <v-row
                  no-gutters
                  class="px-5 mb-5"
                  align="center"
                >
                  <div>
                    <v-avatar :color="colorChannel(list.mb_code)" size="48">
                      <span class="white--text headline">{{ rankList[lIdx] }}</span>
                    </v-avatar>
                  </div>
                  <div class="ml-3">
                    <span class="cn-title"
                      >{{ list.sub_header }}</span
                    >
                    <div class="mt-2 d-flex" style="align-items: center">
                      <div
                        class="text-center font-infomation"
                        :class="classBoxPercentChannel(list.mb_code)"
                      >
                        <span>{{ channelPercent[lIdx] + '%'}}</span>
                      </div>
                      <!-- Check percent -->
                      <span class="ml-2 font-infomation" v-if="channelPercent[lIdx] <= maxValue() && channelPercent[lIdx] >= decreaseThreePercent()">
                        <v-icon color="#FFD03E">icon-icon-star</v-icon>
                        ช่องทางรับข้อมูลหลัก
                      </span>
                    </div>
                  </div>
                  <div class="mt-5 mx-3 font-infomation line-paragraph">
                    {{ list.information }}
                  </div>
                </v-row>
                <div class="mx-5 mb-5">
                    <div class="videoWrapper">
                      <iframe
                        :src="getYoutubeEmbedLinkFromURL(list.video)"
                        frameborder="0"
                        allowfullscreen
                      ></iframe>
                    </div>
                  </div>
              </div>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import BarChart from "../charts/BarChart.vue";
import ChartDataLabels from "chartjs-plugin-datalabels";

export default {
  components: { BarChart },
  name: "AwarenessChannel",
  props: ['userReport', 'informations'],
  data() {
    return {
      tab: null,
      tabSelected: null,
      tabs: [],
      items: ['isty0000LSKL', 'isty0000LSAL', 'isty0000LSVL'],
      tabClass: ['cn-menu-tab-green','cn-menu-tab-blue','cn-menu-tab-yellow'],
      tabClassActive: ['cn-menu-tab-green-active','cn-menu-tab-blue-active','cn-menu-tab-yellow-active'],
      lists: [],
      rankList: [],
      channelPercent: [],
      cnData: null,
      chartOptions: {
        elements: {
          point: {
            radius: 0,
            hoverRadius: 0,
          },
        },
        plugins: {
          datalabels: {
            formatter(value, context) {
              if (context.dataset.type === "line") {
                return ""
              } else {
                let percentSort = Array.from(context.dataset.data)
        
                percentSort.shift()
                percentSort.pop()

                percentSort.sort(function(a, b){return b - a})
                let index = percentSort.findIndex(ele => {
                  if (ele === value) return true
                })

                if (index !== -1) {
                  return index+1
                } else {
                  return ""
                }
              }
            },
            font: {
              size: 25,
              weight: 'bold',
              family: 'Prompt'
            }
          },
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              min: 0,
              stepSize: 5,
              fontFamily: 'Prompt'
            },
            gridLines: {
              display: true,
            },
          }],
          xAxes: [{
            ticks: {
              beginAtZero: true,
              fontFamily: 'Prompt'
            },
            gridLines: {
              display: true,
            },
          }],
        },
        legend: {
          display: false,
        },
        tooltips: {
          callbacks: {
            label(tooltipItem, data) {
              return " " + data.datasets[0].data[tooltipItem.index] + "%";
            },
            labelTextColor(tooltipItem, chart) {
              return "white";
            },
          },
          titleFontFamily : 'Prompt',
          bodyFontFamily : 'Prompt',
        },
        responsive: true,
        maintainAspectRatio: false,
      },
      chartData: null
    };
  },
  mounted() {
    this.observData()
  },
  computed: {
    kinestheticInfo () {
      return this.informations.learning_style_kinesthetic
    },
    auditoryInfo () {
      return this.informations.learning_style_auditory
    },
    visualInfo () {
      return this.informations.learning_style_visual
    }
  },
  watch: {
    tab(val) {
      this.tabSelected = val
    },
  },
  methods: {
    observData () {
      this.getDetails()
      this.getPercents()
      this.setupChartData()
    },
    getDetails() {
      this.lists = []
      this.tabs = [this.kinestheticInfo[0], this.auditoryInfo[0], this.visualInfo[0]]
      this.lists = [this.kinestheticInfo[0], this.auditoryInfo[0], this.visualInfo[0]]
    },
    getPercents () {
      this.channelPercent = []
      this.channelPercent = [parseFloat(this.userReport['lsty_kp']), parseFloat(this.userReport['lsty_ap']), parseFloat(this.userReport['lsty_vp'])]
      let percentSort = Array.from(this.channelPercent)

      percentSort.sort((a, b) => {return b - a});
      
      this.channelPercent.forEach(ele => {
        let index = percentSort.findIndex(percent => {
          if (percent === ele) return true
        })
        if (index !== -1) {
          this.rankList.push(index+1)
        }
      });
    },
    setupChartData () {
      let max = this.maxValue()
      let decrease = this.decreaseThreePercent()
      this.chartData = {
        labels: ['', this.tabs[0].header ,this.tabs[1].header ,this.tabs[2].header, ''],
        datasets: [
          {
            type: 'bar',
            backgroundColor: ["#ffffff", "#BADC58", "#9DC3EC", "#FFD32A", "#ffffff"],
            data:  [0, parseFloat(this.userReport['lsty_kp']), parseFloat(this.userReport['lsty_ap']), parseFloat(this.userReport['lsty_vp']), 0],
            barPercentage: 0.5,
          },
          {
            // -3%
            type: 'line',   
            data: [decrease ,decrease, decrease, decrease, decrease],
            fill: false,
            backgroundColor: '#ffffff',
            borderColor: '#70707080',
            borderWidth: 1
          }, 
          {
            // Max
            type: 'line',     
            data: [max, max, max, max, max],
            backgroundColor: '#E4E4E4',
            borderColor: '#70707080',
            borderWidth: 1,
            fill: '-1',
          }
        ],
      }
    },
    maxValue () {
      if (this.channelPercent.length !== 0) {
        var max = this.channelPercent.reduce(function(a, b) {
          return Math.max(a, b)
        })
        return max.toFixed(2)
      }
    },
    decreaseThreePercent () {
      let max = this.maxValue()
      let decrease = max - 3
      return decrease.toFixed(2)
    },
    colorChannel(channel) {
      if (channel === "isty0000LSKL") {
        return "#BADC58";
      } else if (channel === "isty0000LSAL") {
        return "#9DC3EC";
      } else if (channel === "isty0000LSVL") {
        return "#FFD32A";
      }
    },
    classBoxPercentChannel(channel) {
      if (channel === "isty0000LSKL") {
        return "cn-title-kinesthetic-box";
      } else if (channel === "isty0000LSAL") {
        return "cn-title-auditory-box";
      } else if (channel === "isty0000LSVL") {
        return "cn-title-visual-box";
      }
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
  },
};
</script>
<style scoped>
@import "../../assets/style/report-style.css";
</style>
