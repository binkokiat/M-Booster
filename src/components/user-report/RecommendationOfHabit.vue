<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report">"คำแนะนำตามลักษณะนิสัย"</v-card-title>
    <v-card-text class="pt-5 pl-0 brain-scroll">
      <v-row no-gutters>
        <div class="header-blue-report">
          คำแนะนำ : 
           <span v-for="(title, t) in mainDetails" :key="t">
            {{ t === 0 ? '' + title.header : '& ' + title.header }}
          </span>
        </div>
      </v-row>
      <v-row no-gutters>
        <div class="pt-7">
          <div v-for="(main, mainIdx) in mainDetails" :key="'main'+mainIdx">
            <div class="sub-header-blue-report pl-12">
              <span> {{ main.header }} </span>
            </div>
            <div class="list-info px-12">
              <p class="line-paragraph">
                {{ main.information }}
              </p>
            </div>
          </div>
          <div v-for="(moreDetial, moreIdx) in moreDetails" :key="'more'+moreIdx">
            <div class="sub-header-blue-report pl-12">
              <span> {{ moreDetial.header }} </span>
            </div>
            <div class="list-info px-12">
              <p class="new-line">
                {{ moreDetial.information }}
              </p>
            </div>
          </div>
        </div>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "RecommendationOfHabit",
  props: ['userReport', 'informations'],
  data() {
    return {
      recommendationOfHabitInfo: [
        {
          header: "G",
          infoList: [
            "เรียนรู้จากผู้ประสบความสำเร็จให้มากขึ้น ย้ำความมั่นใจกับตนเอง ใช้ความสามารถของตนในการตัดสิน พัฒนา ความสามารถของตนในการตัดสินใจและทำให้แผนการสำเร็จ ตั้งเป้าหมายให้ตนเองมากขึ้น พัฒนาความสามารถ ของตนเพื่อให้เป้าหมายลุล่วง นำความสามารถของตนมาลงมือกระทำ",
          ],
        },
        {
          header: "TDA",
          infoList: [
            "คุ้นเคยกับความคิดในวิธีการแบบมุมกลับ ดังนั้นจึงมักมองปัญหาจากมุมมองที่ไม่เหมือนใครและแตกต่างผลคือ ความประทับใจที่พยายามมอบให้นั้นทำให้ผู้อื่นรู้สึกแปลกเล็กน้อย เมื่อปฎิสัมพันธ์กับผู้คน หากได้พบปะกับผู้คน จำนวนมาก จะยิ่งโดดเด่นเป็นที่รู้จัก เป็นผู้ที่จดจ่อที่ผลปลายทาง ดังนั้นในการทำงานและในชีวิตจะต้องตั้งเป้า หมายรางวัล และการลงโทษต่อตนเองอย่างแน่วแน่ เพื่อจะพัฒนาตนเองมากขึ้น การคิดเชิงทางเลือกจะช่วยให้ได้ คำตอบเร็วขึ้นในการทำงานที่เกี่ยวกับการวิเคราะห์การอภิปรายและการวิจัย",
          ]
        },
        {
          header: "LG",
          infoList: [
            '1. เหมาะกับวิธี "เรียนรู้ผ่านแบบอย่าง" โดยการอ่านหนังสือชีวประวัติของผู้ยิ่งใหญ่ที่เป็นต้นแบบที่ดี มิฉะนั้นเด็กจะ ไม่สามารถเรียนรู้ได้อย่างลึกซึ้ง',
            '2. รับอิทธิพลจากสิ่งแวดล้อมและเพื่อนได้ง่าย เชื่อฟัง ต้องการแบบอย่างความประพฤติที่ดีให้เด็กทำตาม',
            '3. การศึกษาจนเป็นนิสัยเป็นกุญแจสู่ความสำเร็จ ดังนั้นจึงต้องการตัวอย่างและฝึกฝนซ้ำๆ',
            '4. เหมาะสำหรับ "การสอนที่มีการแบ่งช่วงและจัดตารางเวลา" ผู้ปกครองและครูต้องวางแผนและจัดตารางเวลาให้ กับเด็ก ช่วยวางจุดหมายไปตามทาง สอนให้เด็กรู้ว่าทำอย่างไร ให้กฎที่เหมาะสมและตั้งขอบเขตไว้',
            '5. ถามเด็กว่าสิ่งใดที่ทำได้ดี เช่น "มีอะไรสนุกหรือน่าสนใจบ้างที่โรงเรียน" "วันนี้คุณครูชมอะไร" เมื่อเด็กมี พฤติกรรมหรือการแสดงออกที่ดี ให้ถามว่า "ทำได้อย่างไร" เด็กก็จะชอบใจที่จะทำพฤติกรรมหรือการกระทำที่ทำให้ เขาได้รับคำชมเชยการยกย่องอีก',
          ]
        },
        {
          header: "N",
          infoList: [
            '1. เหมาะกับการศึกษาแบบอเมริกันซึ่งใช้ "การเรียนรู้ที่สร้างแรงบันดาลใจ" เพื่อให้การศึกแก่เด็ก ให้คำอธิบายและการชี้แนะที่แตกต่างซึ่งสอดคล้องและเหมาะสมสำหรับเด็กแต่ละวัย',
            '2. ในแต่ละวัน พฤติกรรมของเด็กอาจดูแปลกแต่การยอมรับสำคัญกว่าการถูกปฏิเสธ',
            '3. เคารพในวิธีคิดที่เป็นแบบเฉพาะและแตกต่างของเขา',
            '4. เสริมการฝึกความฉลาดทางอารมณ์ให้เด็ก เพื่อว่าเด็กจะได้เรียนรู้วิธีที่ดีขึ้นในการแสดงความคิดเห็นของตน',
            '5. ส่งเสริมให้เด็กใช้ประโยชน์และประยุกต์ใช้ความคิดที่แตกต่างและเป็นมุมกล้องในการวิเคราะห์ แยกแยะ สร้างสรรค์ คิดสิ่งใหม่ และการวิจัย ซึ่งช่วยให้เด็กแสดงออกได้ดีขึ้น',
          ]
        },
      ],
      header:[
        {
          key: 'G', // Generous
          text: 'เอื้ออารี'
        },
        {
          key: 'TDA', // Think different angles
          text: 'คิดมุมกลับ'
        },
        {
          key: 'LG', // Learn as a group
          text: 'สร้างแบบอย่างการเรียนรู้ เรียนรู้เป็นกลุ่ม - เอื้ออารี'
        },
        {
          key: 'N', // neutral
          text: 'เป็นกลางเรื่องรางวัลและการลงโทษ ให้กำลังใจ - คิดมุมกลับ'
        },
      ],
      items: [
        { main: 'mcha_01', moreDetail: 'mcha_11' },
        { main: 'mcha_02', moreDetail: 'mcha_12' },
        { main: 'mcha_03', moreDetail: 'mcha_13' },
        { main: 'mcha_04', moreDetail: 'mcha_14' }
      ]
    };
  },
  computed: {
    mainDetails () {
      return this.mappingMainDetail()
    },
    moreDetails () {
      return this.mappingMoreDetail()
    }
  },
  methods: {
    mappingHeader(header) {
      let found = this.header.find(function(post, index) {
        if(post.key === header) return true
      })
      return found.text
    },
    mappingMainDetail () {
      let res = []
      for (let index = 0; index < this.items.length; index++) {
        let key = this.items[index].main
        let found = this.informations.find(info => {
          if (info.mb_code === this.userReport[key]) return true
        })
        if (found !== undefined) {
          res.push(found)
        }
      }
      return res
    },
    mappingMoreDetail () {
      let res = []
      for (let index = 0; index < this.items.length; index++) {
        let key = this.items[index].moreDetail
        let found = this.informations.find(info => {
          if (info.mb_code === this.userReport[key]) return true
        })
        if (found !== undefined) {
          res.push(found)
        }
      }
      return res
    }
  },
};
</script>
<style scoped>
@import "../../assets/style/report-style.css";
</style>
