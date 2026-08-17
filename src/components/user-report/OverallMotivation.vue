<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report">"แรงจูงใจในภาพรวม"</v-card-title>
    <v-card-text class="pt-8 px-8 brain-scroll">
      <v-row no-gutters>
        <v-col cols="4" class="justify-lg-end d-flex pr-12">
          <div class="percent-box" >
            <span>{{ userReport['dver_ww'] }}</span>
          </div>
        </v-col>
        <v-col cols="4" class="justify-lg-center d-flex">
          <div class="percent-box mr-2">
            <span>{{ userReport['dver_wp'] }}</span>
          </div>
          <div class="percent-box ml-2">
            <span>{{ userReport['dver_pw'] }}</span>
          </div>
        </v-col>
        <v-col cols="4" class="d-flex pl-12">
          <div class="percent-box">
            <span>{{ userReport['dver_pp'] }}</span>
          </div>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="4" class="justify-lg-end d-flex pr-12">
          <div class="name-percebt">
            <v-icon color="black" large>icon-icon-warrior</v-icon>
            <span class="ml-1">นักรบ</span>
          </div>
        </v-col>
        <v-col cols="4" class="justify-lg-center d-flex">
          <div class="name-percebt" style="width: auto !important;">
            <span class="ml-1">นักรบ+นักคิด</span>
          </div>
        </v-col>
        <v-col cols="4" class="justify-lg-start d-flex pl-12">
          <div class="name-percebt">
            <v-icon color="black" large>icon-icon-think</v-icon>
            <span>นักคิด</span>
          </div>
        </v-col>
      </v-row>

      <v-row no-gutters class="py-5 px-1">
        <v-col cols="6" class="left-progress">
          <v-progress-linear
            :value="warior_progress"
            color="#BADC58"
            height="30"
            reverse 
            background-color="white"
            style="border-right: 4px solid;border-radius: 8px 0px 0px 8px;"
          ></v-progress-linear>
          <v-divider
            vertical
            class="left-divider-progress"
          ></v-divider>
        </v-col>
        <v-col cols="6" class="right-progress">
          <v-progress-linear
            :value="thinker_progress"
            color="#BADC58" 
            height="30"
            background-color="white"
            style="border-radius: 0px 8px 8px 0px;"
          ></v-progress-linear>
          <v-divider
            vertical
            class="right-divider-progress"
          ></v-divider>
        </v-col>
      </v-row>
      
      <v-row no-gutters class="px-5 pt-5">
        <div style="width: 100%;">
          <div class="motivation-box">
            <div>
              <v-img :src="detail.icon" max-height="48" max-width="48"></v-img>
            </div>
            <span class="motivation-header ml-3">
              แรงจูงใจแบบ "{{ detail.header }}"
            </span>
          </div>
          <div class="motivation-text">
            <p class="my-7 line-paragraph">
              {{ detail.information }}
            </p>
          </div>
          <div class="videoWrapper">
            <iframe
              :src="getYoutubeEmbedLinkFromURL(detail.video)" 
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "OverallMotivation",
  props: ['userReport', 'informations'],
  data() {
    return {
      warior_progress: 0,
      thinker_progress: 0,
      items: ['dver_ww', 'dver_wp', 'dver_pw', 'dver_pp']
    };
  },
  computed: {
    detail () {
      return this.mappingDetail()
    }
  },
  mounted(){
    this.hilightProgress()
  },
  methods: {
    hilightProgress() {
      this.items.forEach(item => {
        if (item === "dver_ww") {
          let dver_ww = parseFloat(this.userReport['dver_ww'])
          if (dver_ww > 0) {
            if (dver_ww < 12) {
              this.warior_progress = dver_ww * 7.5
            } else {
              this.warior_progress = 90
            }
          }
        } else if (item === 'dver_wp') {
          let dver_wp = parseFloat(this.userReport['dver_wp'])
          if (dver_wp > 0) {
            if (dver_wp < 12) {
              this.warior_progress = dver_wp * 7.5
            } else {
              this.warior_progress = 90
            }
          }
        } else if (item === 'dver_pw') {
          let dver_pw = parseFloat(this.userReport['dver_pw'])
          if (dver_pw > 0) {
            if (dver_pw < 12) {
              this.thinker_progress = dver_pw * 7.5
            } else {
              this.thinker_progress = 90
            }
          }
        } else if (item === 'dver_pp') {
           let dver_pp = parseFloat(this.userReport['dver_pp'])
          if (dver_pp > 0) {
            if (dver_pp < 12) {
              this.thinker_progress = dver_pp * 7.5
            } else {
              this.thinker_progress = 90
            }
          }
        }
      });
    },
    mappingDetail () {
      let found = this.informations.find(info => {
        if (info.mb_code === this.userReport['dver']) return true
      })
      if (found !== undefined) {
        return found
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
