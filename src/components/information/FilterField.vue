<template>
  <div id="filterField">
    <v-menu
      v-model="filterOpened"
      bottom
      offset-y
      transition="slide-y-transition"
      rounded="md"
      :close-on-content-click="false"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          outlined
          height="34"
          class="btn-filter font-light pr-2 pl-3"
        >
          <v-icon left size="16" class="mr-1"> icon-Filter_icon </v-icon>
          <span :class="filterShow === '' ? 'pr-8' : ''">Filter</span>
          <span v-if="filterShow !== ''" class="mr-1">:</span>
          <span v-if="filterShow !== ''" class="font-medium">
            {{ filterShow }}
          </span>
          <v-icon left size="13" class="ml-2 mr-0"> icon-icon-menu-down </v-icon>
        </v-btn>
      </template>

      <v-card :width="450" class="text-center">
        <v-card-actions style="display: block !important">
          <v-row
            class="ma-2"
            no-gutters
            v-for="(item, idx) in filterItems"
            :key="idx"
          >
            <!-- Header Filter -->
            <v-col>
              <v-select
                v-model="headerSelected[idx]"
                :items="allHeader"
                outlined
                hide-details
                placeholder="Select.."
                class="font-14 font-very-light text-grey pr-3 filter-select"
                append-icon="icon-arrow-drop-down"
                @change="changeHeader(idx)"
              >
                <template v-slot:item="{ parent, item, on, attrs }">
                  <v-list-item
                    ripple
                    v-bind="attrs"
                    v-on="on"
                    :disabled="checkDisableItem(idx, item)"
                  >
                    <v-list-item-content>
                      <v-list-item-title
                        class="font-14 font-very-light"
                        :class="
                          parent.selectedItems[0] === item
                            ? 'text-blue'
                            : checkDisableItem(idx, item)
                            ? 'text-light-grey'
                            : 'text-grey'
                        "
                        v-html="item"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Option Filter -->
            <v-col>
              <v-autocomplete
                v-model="optionSelected[idx]"
                :items="getOption(headerSelected[idx])"
                outlined
                hide-details
                placeholder="Select.."
                class="font-14 font-very-light pr-3 text-grey filter-autocomplete"
                append-icon="icon-icon-chevron-down"
                return-object
                :disabled="headerSelected[idx] ? false : true"
              >
                <template v-slot:item="{ parent, item, on, attrs }">
                  <v-list-item ripple v-bind="attrs" v-on="on">
                    <v-list-item-content>
                      <v-list-item-title
                        class="font-14 font-very-light"
                        :class="
                          parent.selectedItems[0] === item
                            ? 'text-blue'
                            : 'text-grey'
                        "
                        v-html="parent.genFilteredText(item)"
                      ></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
                <template v-slot:no-data>
                  <v-list-item-content>
                    <v-list-item-title
                      class="font-14 font-very-light text-grey text-center"
                    >
                      No data available
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="auto" style="align-items: center; display: flex">
              <v-icon size="20" @click="clearFilter(idx)">
                icon-icon-close-circle
              </v-icon>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>
<script>
export default {
  name: "FilterField",
  props: ["filterOption"],
  data() {
    return {
      filterOpened: false,
      filterData: [],
      filterItems: [],
      allHeader: [],
      headerSelected: [],
      optionSelected: [],
      headerValue: [],
      filterShow: "",
      filterResult: [],
    };
  },
  watch: {
    headerSelected() {
      let value = []
      this.headerSelected.forEach( ele => {
        let data = this.filterOption.find( ele2 => {
          if (ele === ele2.header) return true
        });
        value.push(data.header_value)
      });
      this.headerValue = Array.from(value)
      this.filterTextShowAndSendAPI();
    },
    optionSelected() {
      this.filterTextShowAndSendAPI();
    },
  },
  created() {
    this.filterData = Array.from(this.filterOption);
    this.$nextTick(() => {
      this.beginFilterOption();
    });
  },
  methods: {
    beginFilterOption() {
      this.filterItems.push(Array.from(this.filterData));
      this.filterItems.forEach((ele) => {
        ele.forEach((hd) => {
          this.allHeader.push(JSON.parse(JSON.stringify(hd.header)));
        });
      });
      this.filterTextShowAndSendAPI();
    },
    filterTextShowAndSendAPI() {
      let selectedText = [];
      let data = {
        header: [],
        value: []
      }
      this.optionSelected.forEach((ele, idx) => {
        if (ele !== "All" && ele !== "") {
          selectedText.push(ele);
          data.header.push(this.headerValue[idx])
          data.value.push(ele)
        }
      });
      if (selectedText.length !== 0) {
        this.filterShow = selectedText.join(", ");
      } else {
        this.filterShow = "";
      }
      if (JSON.stringify(this.filterResult) !== JSON.stringify(data)) {
        this.filterResult = JSON.parse(JSON.stringify(data))
        this.$emit("FilterReturn", this.filterResult);
      }
    },
    checkDisableItem(idx, item) {
      let found = this.headerSelected.findIndex((info) => {
        if (info !== "" && info === item) {
          return true;
        }
      });
      if (found === -1) {
        return false;
      } else if (found === idx) {
        return false;
      } else {
        return true;
      }
    },
    getOption(header) {
      let found = this.filterData.find((ele) => {
        if (ele.header === header && header !== "") return true;
      });
      if (found !== undefined) {
        return found.option;
      }
    },
    clearFilter(idx) {
      if (this.filterItems.length === 1) {
        this.headerSelected = [];
        this.optionSelected = [];
        this.filterTextShowAndSendAPI();
        this.filterOpened = false;
      } else if (this.filterItems.length > 1) {
        this.filterItems.splice(idx, 1);
        this.optionSelected.splice(idx, 1);
        this.headerSelected.splice(idx, 1);
      }
    },
    changeHeader(index) {
      this.optionSelected[index] = "";
    },
  },
};
</script>
<style lang="css" scoped>
@import "../../assets/style/main.css";
@import "../../assets/style/information-style.css";
.v-menu__content {
  top: 165px !important;
}
</style>
