<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title style="height: 15vh" class="header-title-report">
      <v-row no-gutters align="center">
        <v-col cols="6" class="text-center">
          <span>"ศักยภาพ 10 ด้าน"</span>
        </v-col>
        <v-col cols="6" class="d-flex" style="justify-content: flex-end;">
          <v-card tile width="70%">
            <v-row no-gutters>
              <div style="width: 35%; align-self: center;" class="text-center">
                <span class="f-title t-bold">ค่าประจำตัว</span>
                <p class="mb-0 f-title t-bold">{{ avgPre.toFixed(2) }}</p>
              </div>
              <div class="py-3" style="width: 2%">
                <v-divider vertical class="p-divider"></v-divider>
              </div>
              <div style="width: 63%; align-self: center;" class="text-center">
                <div class="d-flex px-1">
                  <div class="f-title t-bold" style="width: 80%">
                   โดดเด่น > {{ getAvgIncrease() }} (+3.0)
                  </div>
                  <div style="width: 20%">
                    <v-icon color="#00B050">icon-icon-up</v-icon> 
                  </div>
                </div>
                <v-divider class="p-divider-green mx-2 mb-1"></v-divider>
                <v-divider class="p-divider-red mx-2"></v-divider>
                <div class="d-flex px-1">
                  <div class="f-title t-bold" style="width: 80%">
                   ไม่ถนัด &lt; {{ getAvgDecrease() }} (-3.0)
                  </div>
                  <div style="width: 20%">
                    <v-icon color="#EA2027">icon-icon-drow</v-icon>
                  </div>
                </div>
              </div>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="pt-5 pb-5 potential-scroll">
      <v-row no-gutters class="text-center">
        <v-col cols="6">
          <span class="p-title t-bold">"สมองซีกซ้าย"</span>
        </v-col>
        <v-col cols="6">
          <span class="p-title t-bold">"สมองซีกซ้าย"</span>
        </v-col>
      </v-row>
      <v-row no-gutters v-for="(potential, pIdx) in potentials" :key="pIdx" class="my-5" style="text-align: -webkit-center;">
        <v-col cols="6">
          <v-card class="p-10-box">
            <v-card-title class="f-title t-bold">
              <v-img :src="mappingIcon(`cpot00R0CPR` + `${pIdx + 1}`)" max-height="35" max-width="35" class="mr-2"></v-img>
              {{ mappingTitle(`cpot00R0CPR` + `${pIdx + 1}`) }}
            </v-card-title>
            <v-card-text style="height: 20vh;">
                <div class="pl-3 p-10-sub-box text-start">
                  <v-row no-gutters align="center">
                    <v-col cols="4">
                      <span class="f-title t-bold">
                        ศักยภาพ
                      </span>
                    </v-col>
                    <v-col cols="8" style="display: flex; justify-content: center;">
                      <div class="p-10-content-box font-expain">
                        <span class="p-10-sub-content1-box">{{potential['pre_r'].toFixed(2) }}</span>
                        <span class="p-10-sub-content1-box">{{ `(`+  potentialDiff(potential['pre_r']) + `)` }}</span>
                        <span class="p-10-sub-content2-box">
                          <v-icon v-if="potentialDiff(potential['pre_r']) >= 3" size="20" :color="colorIcon(potential['pre_r'])">{{ mappingIconDiff(potential['pre_r'])}}</v-icon> 
                          <v-icon v-else size="15" :color="colorIcon(potential['pre_r'])">{{ mappingIconDiff(potential['pre_r'])}}</v-icon>
                        </span>
                        <v-icon class="mr-2" size="15" v-if="potential['a_r'] !== null && potential['a_r'] !== 0"
                          >icon-icon-cross</v-icon
                        >
                        <span class="p-10-sub-content2-box">{{ mappingPreRanking(`pre_r`+`${pIdx + 1}`) }} </span>
                         
                      </div>
                    </v-col>
                    <v-col cols="4">
                      <span class="py-3 f-title t-bold">
                          ศักยภาพแฝง
                      </span>
                    </v-col>
                    <v-col cols="8" style="display: flex; justify-content: center;">
                      <div class="p-10-content-box font-expain">
                        <span class="p-10-sub-content1-box">{{ potential['post_r'].toFixed(2)  }}</span>
                        <span class="p-10-sub-content1-box">{{ `(`+  potentialDiff(potential['post_r']) + `)` }}</span>
                        <span class="p-10-sub-content2-box">
                          <v-icon size="20" v-if="potentialDiff(potential['post_r']) >= 3" :color="colorIcon(potential['post_r'])">{{ mappingIconDiff(potential['post_r'])}}</v-icon>
                          <v-icon size="15" v-else :color="colorIcon(potential['post_r'])">{{ mappingIconDiff(potential['post_r'])}}</v-icon>
                        </span>
                        <v-icon class="mr-2" size="15" v-if="potential['a_r'] !== null && potential['a_r'] !== 0"
                          >icon-icon-cross</v-icon
                        >
                        <span class="p-10-sub-content2-box">{{ mappingPostRanking(`post_r`+`${pIdx + 1}`) }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </div>
                <div class="mt-3 text-start">
                  <v-row no-gutters class="mx-5 ">
                    <span 
                      v-for="(info, fIdx) in mappingInformation(`cpot00R0CPR` + `${pIdx + 1}`)" :key="fIdx"
                      class="font-expain line-bullet" 
                    >
                    {{ info }}
                    </span>
                  </v-row>
                </div>
            </v-card-text>
            <v-card-actions style="justify-content: center;">
              <v-btn color="#70A1FF" small dark @click="displayDescription(`dpot00R0DPR` + `${pIdx + 1}`)">
                <v-icon size="20" class="mr-2">icon-icon-video</v-icon>
                คลิปอธิบาย
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="p-10-box">
            <v-card-title class="f-title t-bold">
             <!-- <v-icon size="35" color="#004769" class="mr-2">
               {{ mappingIcon(`cpot00L0CPL` + `${pIdx + 1}`) }}
             </v-icon> -->
             <v-img :src="mappingIcon(`cpot00L0CPL` + `${pIdx + 1}`)" max-height="35" max-width="35" class="mr-2"></v-img>
              {{ mappingTitle(`cpot00L0CPL` + `${pIdx + 1}`) }}
            </v-card-title>
            <v-card-text style="height: 20vh;">
                <div class="pl-3 p-10-sub-box text-start">
                  <v-row no-gutters align="center">
                    <v-col cols="4">
                      <span class="f-title t-bold">
                        ศักยภาพ
                      </span>
                    </v-col>
                    <v-col cols="8" style="display: flex; justify-content: center;">
                      <div class="p-10-content-box font-expain">
                        <span class="p-10-sub-content1-box">{{ potential['pre_l'].toFixed(2) }}</span>
                        <span class="p-10-sub-content1-box">{{ `(`+  potentialDiff(potential['pre_l']) + `)` }}</span>
                        <span class="p-10-sub-content2-box">
                          <v-icon size="20" v-if="potentialDiff(potential['pre_l']) >= 3" :color="colorIcon(potential['pre_l'])">{{ mappingIconDiff(potential['pre_l'])}}</v-icon>
                          <v-icon size="15" v-else :color="colorIcon(potential['pre_l'])">{{ mappingIconDiff(potential['pre_l'])}}</v-icon>
                        </span>
                        <v-icon class="mr-2" size="15" v-if="potential['a_l'] !== null && potential['a_l'] !== 0"
                        >icon-icon-cross</v-icon>
                        <span class="p-10-sub-content2-box">{{ mappingPreRanking(`pre_l`+`${pIdx + 1}`) }} </span>
                      </div>
                    </v-col>
                    <v-col cols="4">
                      <span class="py-3 f-title t-bold">
                          ศักยภาพแฝง
                      </span>
                    </v-col>
                    <v-col cols="8" style="display: flex; justify-content: center;">
                      <div class="p-10-content-box font-expain">
                        <span class="p-10-sub-content1-box">{{ potential['post_l'].toFixed(2) }}</span>
                        <span class="p-10-sub-content1-box">{{ `(`+  potentialDiff(potential['post_l']) + `)` }}</span>
                        <span class="p-10-sub-content2-box">
                          <v-icon size="20" v-if="potentialDiff(potential['post_l']) >= 3" :color="colorIcon(potential['post_l'])">{{ mappingIconDiff(potential['post_l'])}}</v-icon>
                          <v-icon size="15" v-else :color="colorIcon(potential['post_l'])">{{ mappingIconDiff(potential['post_l'])}}</v-icon>
                        </span>
                        <v-icon class="mr-2" size="15" v-if="potential['a_l'] !== null && potential['a_l'] !== 0"
                        >icon-icon-cross</v-icon>
                        <span class="p-10-sub-content2-box">{{ mappingPostRanking(`post_l`+`${pIdx + 1}`) }}</span>
                      </div>
                    </v-col>
                  </v-row>
                </div>
                <div class="mt-3 text-start">
                  <v-row no-gutters class="mx-5" >           
                    <span 
                      v-for="(info, fIdx) in mappingInformation(`cpot00L0CPL` + `${pIdx + 1}`)" :key="fIdx"
                      class="font-expain line-bullet" 
                    >
                    {{ info }}
                    </span>
                  </v-row>
                </div>
            </v-card-text>
            <v-card-actions style="justify-content: center;">
              <v-btn color="#70A1FF" small dark @click="displayDescription(`dpot00L0DPL` + `${pIdx + 1}`)">
                <v-icon size="20" class="mr-2">icon-icon-video</v-icon>
                คลิปอธิบาย
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
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
                  size="20"
                  @click="closeDialog()"
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
        <v-row no-gutters class="pl-7 mt-6 p-10-expain-text-box" >
          <div style="width: 45%" class="pl-3">
            <p>
              <strong>ศักยภาพ</strong> คือ ความไวในการใช้งาน และการเรียนรู้ในด้านนั้นๆ
            </p>
            <p class="mt-2">
              <strong>ศักยภาพแฝง</strong> คือ ศักยภาพสูงสุดที่ใช้ได้เเมื่อได้รับการส่งเสริม ได้รับแรงบันดาลใจ หรือการกระตุ้น (การกระตุ้นเกิดขึ้นได้จากการทำกิจกรรมที่ชอบ, สนุก, อยากเรียนรู้, รางวัล เป็นต้น)
            </p>
          </div>
          <div style="width: 53%;">
             <div class="px-2 pb-2 p-10-expain-box">
               <v-row no-gutters>
                  <v-col cols="6" class="py-1">
                      <span>
                        <v-icon size="20" color="#2ECC71">
                          icon-icon-star
                        </v-icon>
                      </span>
                      <span>
                        ศักยภาพระดับสูง (ถนัด)
                      </span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    <span>
                      <v-icon size="17" color="#EC0927">
                        icon-icon-circle
                      </v-icon>
                    </span>
                    <span>
                      ศักยภาพไม่ถนัด (ควรฝึกฝนให้ใช้ได้)
                    </span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    <span>
                      <v-icon size="17" color="#3742FA">
                        icon-icon-triangle-up
                      </v-icon>
                    </span>
                    <span>
                      ศักยภาพระดับค่อนข้างสูง
                    </span>
                  </v-col>
                  <v-col cols="6" class="py-1">
                    <span>
                      <v-icon size="17" color="#FFA502">
                        icon-icon-triangle-down
                      </v-icon>
                    </span>
                    <span>
                      ศักยภาพระดับกลาง
                    </span>
                  </v-col>
                  <v-col cols="12" class="pt-2">
                    <span>
                      <v-icon size="17" color="#747D8C">
                        icon-icon-cross
                      </v-icon>
                    </span>
                    <span>
                      ศักยภาพที่ต้องรับการส่งเสริมจากภายนอก
                    </span>
                  </v-col>
               </v-row>
            </div>
          </div>
        </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: "Potential10Side",
  props: ['userReport', 'informations'],
  data() {
    return {
      dialog: false,
      description: null,
      preRankings: [],
      postRankings: []
    };
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
    this.getRanking()
  },
  methods: {
    getAvgDecrease () {
      let decrease = this.avgPre - 3.0
      let AvgDecrease = decrease.toFixed(2)
      return AvgDecrease
    },
    getAvgIncrease () {
      let increase = this.avgPre + 3.0
      let AvgIncrease = increase.toFixed(2)
      return AvgIncrease
    },
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
    mappingTitle (key) {
      let found = this.informations.find((list, index) => {
        if(list.mb_code === key) return true
      })
      if (found !== undefined) {
        return found.header
      }
    },
    mappingInformation(key) {
      let res = []
      let found = this.informations.find((list, index) => {
        if (list.mb_code === key) return true
      });
      let lists = found.information.split("\n")
      lists.forEach(list => {
        if (list !== "") {
          res.push(list)
        }
      })
      return res
    },
    potentialDiff(p) {
      let pDiff = p - this.avgPre
      let res = pDiff.toFixed(2) < 0 ? pDiff.toFixed(2) : '+'+ pDiff.toFixed(2)
      return res
    },
    async getRanking () {
      this.preRankings = this.getPreRanking()
      this.postRankings = await this.getPostRanking()
    },
    getPreRanking() {
      let preList = [
        { key: 'pre_r1', value: this.userReport['pre_r1']},
        { key: 'pre_r2', value: this.userReport['pre_r2']},
        { key: 'pre_r3', value: this.userReport['pre_r3']},
        { key: 'pre_r4', value: this.userReport['pre_r4']},
        { key: 'pre_r5', value: this.userReport['pre_r5']},
        { key: 'pre_l1', value: this.userReport['pre_l1']},
        { key: 'pre_l2', value: this.userReport['pre_l2']},
        { key: 'pre_l3', value: this.userReport['pre_l3']},
        { key: 'pre_l4', value: this.userReport['pre_l4']},
        { key: 'pre_l5', value: this.userReport['pre_l5']}
      ]
      let sort = preList.sort((a, b) => {return a.value - b.value})
      let preSort = sort.reverse()

      preSort[0]['ranking'] = 1
      for (let pIdx = 1; pIdx < preSort.length; pIdx++) {
        if (preSort[pIdx]['value'] === preSort[pIdx-1]['value']) {
          preSort[pIdx]['ranking'] = preSort[pIdx-1]['ranking']
        } else {
          preSort[pIdx]['ranking'] = pIdx+1
        }
      }
      return preSort
    },
    getPostRanking () {
      let postList = [
        { key: 'post_r1', value: this.userReport['post_r1']},
        { key: 'post_r2', value: this.userReport['post_r2']},
        { key: 'post_r3', value: this.userReport['post_r3']},
        { key: 'post_r4', value: this.userReport['post_r4']},
        { key: 'post_r5', value: this.userReport['post_r5']},
        { key: 'post_l1', value: this.userReport['post_l1']},
        { key: 'post_l2', value: this.userReport['post_l2']},
        { key: 'post_l3', value: this.userReport['post_l3']},
        { key: 'post_l4', value: this.userReport['post_l4']},
        { key: 'post_l5', value: this.userReport['post_l5']}
      ]
      let sort = postList.sort((a, b) => {return a.value - b.value})
      let postSort = sort.reverse()

      postSort[0]['ranking'] = 1
      for (let pIdx = 1; pIdx < postSort.length; pIdx++) {
        if (postSort[pIdx]['value'] === postSort[pIdx-1]['value']) {
          postSort[pIdx]['ranking'] = postSort[pIdx-1]['ranking']
        } else {
          postSort[pIdx]['ranking'] = pIdx+1
        }
      }
      return postSort
    },
    mappingPreRanking (key) {
      if (this.preRankings.length !== 0) {
        let found = this.preRankings.find((pre, index) => {
          if (pre.key === key) return true
        })
        if (found !== undefined) {
          return found.ranking
        }
      }
    },
    mappingPostRanking (key) {
      if (this.postRankings.length !== 0) {
        let found = this.postRankings.find((post, index) => {
          if (post.key === key) return true
        })
        if (found !== undefined) {
          return found.ranking
        }
      }
    },
    mappingIcon(key) {
      let found = this.informations.find((list, index) => {
        if (list.mb_code === key) return true
      })
      return found.icon
    },
    mappingIconDiff (p) {
      let diff = this.potentialDiff(p)
      let diffNumber = parseFloat(diff)
      
      if (diffNumber >= 3) {
        return 'icon-icon-star'
      } else if (diffNumber >= 0.00 & diffNumber <= 2.99) {
        return 'icon-icon-triangle-up'
      } else if (diffNumber >= -2.99 && diffNumber <= -0.01) {
        return 'icon-icon-triangle-down'
      } else if (diffNumber < -3.00) {
        return  'icon-icon-circle'
      } else {
        return ''
      }
    },
    colorIcon(p) {
      let diff = this.potentialDiff(p)
      let diffNumber = parseFloat(diff)

      if (diffNumber >= 3) {
        return '#2ECC71'
      } else if (diffNumber >= 0.00 && diffNumber <= 2.99) {
        return '#3742FA'
      } else if (diffNumber >= -2.99 && diffNumber <= -0.01) {
        return '#FFA502'
      } else if (diffNumber < -3.00) {
        return  '#EC0927'
      } else {
        return ""
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
