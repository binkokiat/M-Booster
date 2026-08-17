<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report">"กิจกรรมตามค่าศักยภาพ"</v-card-title>
    <v-card-text class="pt-5 px-8 brain-scroll">
      <v-row no-gutters class="px-10">
        <!-- Title -->
        <v-col cols="6">
          <div 
            v-for="(item, idx) in informations" :key="idx"
            class="activity-box mb-2"
          >
            <v-img :src="item.icon" max-height="50" max-width="50" ></v-img>
            <span class="activity-text">{{ item.header }}</span>
          </div>
        </v-col>
        <v-col cols="1">
          <v-divider
            vertical
            style="background-color: black;"
          ></v-divider>
        </v-col>
        <!-- Display star -->
        <v-col cols="5">
          <div 
            v-for="(activity, idx_act) in activities" :key="idx_act"
            class="activity-box mb-2"
          >
            <img 
              v-for="(item, idx) in createStar(activity)" :key="idx"
              :src="require('../../assets/images/report/' + item.image)"
              :class="item.image !== 'icon-plus.png' ? 'mx-1' : 'mx-4'" 
              :height="item.image !== 'icon-plus.png' ? 35 : 12"
            >
          </div>
        </v-col>
      </v-row>
      <v-row no-gutters class="px-2 mt-6">
        <v-card tile class="activity-card">
          <div v-for="(info, idx) in starInfo" :key="idx">
            <v-row class="mx-2 my-3">
              <div class="activity-card-img-box">
                <img 
                  :src="require('../../assets/images/report/' + info.image)"
                  class="mr-2"
                  height="25"
                >
              </div>
              <div class="activity-card-text-box">
                <span v-html="info.info"></span>
              </div>
            </v-row>
          </div>
        </v-card>
      </v-row>
    </v-card-text>
  </v-card>
</template>
<script>
export default {
  name: "ActivitiesByPotential",
  props: ['userReport', 'informations'],
  data() {
    return {
      starInfo: [
        {
          image: 'icon-star3.png',
          info: `ระดับแนวโน้มความถนัดในแต่ละกิจกรรมที่เกิดจากการพิจารณาค่า<b>ศักยภาพในสภาวะปกติ</b>`
        },
        {
          image: 'icon-star4.png',
          info: `ระดับแนวโน้มความถนัดในแต่ละกิจกรรมที่เกิดจากการพิจารณาค่า<b>ศักยภาพแฝง</b>`
        },
        {
          image: 'icon-plus.png',
          info: `ระดับแนวโน้มความถนัดในแต่ละกิจกรรมที่เกิดจากการพิจารณาค่าศักยภาพที่ได้รับการส่งเสริมแล้ว<br/><b>(เฉพาะลายนิ้วมือกลุ่ม A เท่านั้น)</b>`
        },
      ],
      starImagePath: {
        green_star_and_plus: 'icon-star1.png',
        white_star_and_plus: 'icon-star2.png',
        green_star: 'icon-star3.png',
        white_star: 'icon-star4.png',
        star: 'icon-plus.png'
      }
    }
  },
  computed: {
    activities () {
      return this.getDataActivity()
    }
  },
  methods: {
    getInformations(key) {
      let found = this.informations.find((post, index) => {
        if(post.mb_code === key) return true
      })
      if (found !== undefined) {
        return found
      }
    },
    getDataActivity () {
      let activities = []
      for (let idx = 1; idx <= 15; idx++) {
        const preAct = 'pre_act_'+ idx.toString().padStart(2, '0') 
        const postAct = 'post_act_'+idx.toString().padStart(2, '0') 
        const aAct = 'a_act_'+idx.toString().padStart(2, '0') 
        let obj = {
          'pre_act': this.userReport[preAct],
          'post_act': this.userReport[postAct],
          'a_act': this.userReport[aAct]
        }
        activities.push(obj)
      }
      return activities
    },
    createStar(act) {
      let pre = act['pre_act']
      let post = act['post_act']
      let a = act['a_act']
      let arr = [pre, post, a]
      let starImage = []
      let max = Math.max(pre, post , a)
      let max_idx = arr.indexOf(Math.max(...arr))
      let begin_image = max_idx === 0 ? this.starImagePath.green_star : max_idx === 1 ? this.starImagePath.white_star : this.starImagePath.star
      for (let i = 0; i < max; i++) {
        starImage.push( {image: begin_image} )
      }
      if (max_idx === 0) {
        for (let i = 0; i < a; i++) {
          starImage[i] = {image: this.starImagePath.green_star_and_plus}
        }
      } else if (max_idx === 1) {
        if (a === pre) {
          for (let i = 0; i < a; i++) {
            starImage[i] = {image: this.starImagePath.green_star_and_plus}
          }
        } else if (a > pre) {
          for (let i = 0; i < a; i++) {
            starImage[i] = {image: this.starImagePath.white_star_and_plus}
          }
          for (let i = 0; i < pre; i++) {
            starImage[i] = {image: this.starImagePath.green_star_and_plus}
          }
        } else if (a < pre) {
          for (let i = 0; i < pre; i++) {
            starImage[i] = {image: this.starImagePath.green_star}
          }
          for (let i = 0; i < a; i++) {
            starImage[i] = {image: this.starImagePath.green_star_and_plus}
          }
        }
      } else {
        for (let i = 0; i < post; i++) {
          starImage[i] = {image: this.starImagePath.white_star_and_plus}
        }
        for (let i = 0; i < pre; i++) {
          starImage[i] = {image: this.starImagePath.green_star_and_plus}
        }
      }
      return starImage
    }
  },
};
</script>
<style scoped>
@import "../../assets/style/report-style.css";
</style>