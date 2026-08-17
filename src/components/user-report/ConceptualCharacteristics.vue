<template>
  <v-card tile height="82vh" style="border-left: 2px solid #00000029">
    <v-card-title class="header-title-report">"ลักษณะทางความคิด"</v-card-title>
    <v-card-text class="pt-5 pl-0 brain-scroll">
      <v-row no-gutters>
        <div class="header-blue-report">
          <span v-for="(title, t) in titles" :key="t">
            {{ t === 0 ? '' + title : '& ' + title }}
          </span>
        </div>
      </v-row>
      <v-row no-gutters>
        <div class="pt-7">
          <div v-for="(item, idx) in details" :key="idx">
            <div class="sub-header-blue-report pl-15">
              <span> {{ item.header }} </span>
            </div>
            <div class="list-info px-15">
              <p class="new-line">
                {{ item.information }}
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
  name: "ConceptualCharacteristics",
  props: ['userReport', 'informations'],
  data() {
    return {
      items: ['scha_01', 'scha_02']
    };
  },
  computed: {
    titles () {
      return this.mappingTitle()
    },
    details () {
      return this.mappingDetial()
    }
  },
  methods: {
    mappingTitle() {
      let res = []
      for (let index = 0; index < this.items.length; index++) {
        let key = this.items[index]
        let found = this.informations.find(info => {
          if (info.mb_code === this.userReport[key]) return true
        })
        if (found !== undefined) {
          res.push(found.header)
        }
      }
      return res
    },
    mappingDetial () {
      let res = []
      for (let index = 0; index < this.items.length; index++) {
        let key = this.items[index]
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
