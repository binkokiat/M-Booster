<template>
  <div class="ConceptualCharacteristicsInformation" v-if="userProfile !== null">
    <div class="pa-3 content background-main">
      <v-row justify="space-between" class="px-3">
        <div>
          <p class="font-20 font-bold">ลักษณะทางความคิด</p>
        </div>
        <div>
          <v-btn
            color="#A3CB38"
            dark
            @click="openConceptualCharacteristicsDialog('create')"
          >
            Create Information
          </v-btn>
          <v-dialog
            v-if="renderConceptualCharacteristicsDialog"
            v-model="openingConceptualCharacteristicsDialog"
            persistent
            max-width="700"
          >
            <form-character
              @CharacterDialog="closingConceptualCharacteristicsDialog"
              :templateData="templateData"
              :dialogMode="dialogMode"
              :dataInfo="dataInfo"
              @CreateCharacterDialog="createConceptualCharacteristicsDialog"
              @EditCharacterDialog="editConceptualCharacteristicsDialog"
            ></form-character>
          </v-dialog>
        </div>
      </v-row>
      <v-row class="px-3 mb-4">
        <div>
          <v-btn
            color="#2b8152"
            dark
            @click="deleteConceptualCharacteristics()"
          >
            Delete ({{ informationSelected.length }})
          </v-btn>
        </div>
        <v-spacer></v-spacer>
        <div style="width: 350px">
          <v-text-field
            v-model="search"
            class="ml-3 pa-0"
            solo
            outlined
            placeholder="Search.."
            :height="35"
            append-icon="icon-Search_icon1"
            hide-details
          >
          </v-text-field>
        </div>
      </v-row>
      <!-- Data Table -->
      <v-row class="px-3">
        <v-data-table
          v-model="informationSelected"
          :headers="headers"
          :items="displayInformation"
          item-key="mb_code"
          :items-per-page="perPage"
          :page="page"
          :search="search"
          show-select
          hide-default-footer
          class="table header-green"
          style="width: 100%"
        >
          <template v-slot:item="{ item, isSelected, select }">
            <tr>
              <td>
                <div class="height-100">
                  <v-checkbox
                    color="#707070"
                    :input-value="isSelected"
                    @change="select($event)"
                  ></v-checkbox>
                </div>
              </td>
              <td class="text-center pa-3">
                <div class="height-100">
                  <span v-if="item.mb_code !== '' && item.mb_code !== null">
                    {{ item.mb_code }}
                  </span>
                  <span v-else> - </span>
                </div>
              </td>
              <td class="text-center pa-3">
                <div class="height-100">
                  <span v-if="item.age_range !== '' && item.age_range !== null">
                    {{ item.age_range }}
                  </span>
                  <span v-else> - </span>
                </div>
              </td>
              <td class="text-center pa-3">
                <div class="height-100">
                  <span v-if="item.group !== '' && item.group !== null">
                    {{ item.group }}
                  </span>
                  <span v-else> - </span>
                </div>
              </td>
              <td class="text-center pa-3">
                <div class="height-100">
                  <span v-if="item.header !== '' && item.header !== null">
                    {{ item.header }}
                  </span>
                  <span v-else> - </span>
                </div>
              </td>
              <td class="pa-3" style="max-width: 400px">
                <div class="height-100 hard_break" style="max-width: 400px">
                  <span
                    v-if="item.information !== '' && item.information !== null"
                    class="text-left"
                    style="max-width: 400px"
                    v-html="newLineText(item.information)"
                  ></span>
                  <span v-else> - </span>
                </div>
              </td>
              <td class="text-center pa-3">
                <div class="height-100">
                  <v-btn
                    color="#FF9F43"
                    fab
                    dark
                    elevation="0"
                    x-small
                    @click="openConceptualCharacteristicsDialog('edit', item)"
                  >
                    <v-icon size="15">icon-pen_icon</v-icon>
                  </v-btn>
                </div>
              </td>
            </tr>
          </template>

          <!-- Footer -->
          <template v-slot:footer="{ props }">
            <div class="table-footer">
              <v-row class="my-3 mx-2 justify-end">
                <v-col class="col-auto py-2">
                  <span>Rows per page :</span>
                </v-col>
                <v-col class="col-auto py-1" style="width: 100px">
                  <v-select
                    v-model="perPage"
                    :items="itemPerPage"
                    hide-details
                    class="per-page pa-0 ma-0"
                    append-icon="icon-arrow-drop-down"
                  >
                    <template v-slot:selection="{ item }">
                      <span
                        class="d-flex justify-center text-grey font-14 font-light"
                        style="width: 100%"
                        v-html="item"
                      ></span>
                    </template>
                    <template v-slot:item="{ parent, item, on, attrs }">
                      <v-list-item ripple v-bind="attrs" v-on="on">
                        <v-list-item-content>
                          <v-list-item-title
                            class="d-flex justify-center font-14 font-light"
                            :class="
                              parent.selectedItems[0] === item
                                ? 'text-blue'
                                : 'text-grey'
                            "
                            v-html="item"
                          ></v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </template>
                  </v-select>
                </v-col>
                <v-col class="col-auto py-2 px-0">
                  <span class="ml-4">
                    {{ props.pagination.page }} of
                    {{ props.pagination.pageCount }} page
                  </span>
                </v-col>
                <v-col class="col-auto py-1">
                  <v-btn
                    icon
                    :disabled="page === 1 && props.pagination.pageCount !== 0 ? true : false"
                    class="mr-1"
                    @click="page--"
                  >
                    <v-icon size="15">icon-icon-chevron-left</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    :disabled="
                      page === props.pagination.pageCount && props.pagination.pageCount !== 0
                        ? true
                        : false
                    "
                    class="ml-1"
                    @click="page++"
                  >
                    <v-icon size="15">icon-icon-chevron-right</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </template>
        </v-data-table>
      </v-row>
    </div>
  </div>
</template>

<script>
import { apiUrl } from "../../utils/url";
import axios from "axios";
import FormCharacter from "../../components/information/FormCharacter";

axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";

export default {
  name: "ConceptualCharacteristicsInformation",
  components: {
    FormCharacter,
  },
  data() {
    return {
      headers: [
        {
          text: "MB Code",
          value: "mb_code",
          align: "center",
          sortable: false,
          class: "header-table",
        },
        {
          text: "Age Range",
          value: "age_range",
          align: "center",
          sortable: false,
          class: "header-table",
          width: 130,
        },
        {
          text: "Group",
          value: "group",
          align: "center",
          sortable: false,
          class: "header-table",
        },
        {
          text: "Header",
          value: "header",
          align: "center",
          sortable: false,
          class: "header-table",
        },
        {
          text: "Information",
          value: "information",
          align: "center",
          sortable: false,
          class: "header-table",
          width: 400,
        },
        {
          text: "Action",
          value: "actions",
          align: "center",
          sortable: false,
          class: "header-table",
          width: 100,
        },
      ],
      displayInformation: [],
      informationSelected: [],
      search: "",
      page: 1,
      perPage: 10,
      itemPerPage: [10, 20, 50, 100],
      openingConceptualCharacteristicsDialog: false,
      renderConceptualCharacteristicsDialog: true,
      templateData: {
        open: {
          age_range: true,
          header: true,
          sub_header: false,
          information: true,
          video: false,
          icon: false,
          image: false,
        },
        age_range: ["000T200"],
        group: ["subconscious_character"],
      },
      dialogMode: "",
      dataInfo: null,
      filter: "",
    };
  },
  computed: {
    userProfile() {
      return this.$store.state.currentUser;
    },
  },
  async created() {
    this.setLoading(true);
    await this.$store.dispatch("getUserProfile");
    if (this.userProfile !== null) {
      this.getInformation();
    }
  },
  methods: {
    setLoading(val) {
      this.$store.commit("SET_LOADING", val);
    },
    async getInformation() {
      this.setLoading(true);
      let config = {
        headers: { access_token: this.userProfile.access_token },
        params: {
          groups: "subconscious_character",
          filters: this.filter,
        },
      };
      axios
        .get(apiUrl + "/informations", config)
        .then((response) => {
          if (response.data.status === "success") {
            this.displayInformation = Array.from(
              response.data.result.informations
            );
            this.setLoading(false);
          } else {
            this.setLoading(false);
            this.$swal({
              title: "มีบางอย่างผิดพลาด",
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            });
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error;
          if (errorMessage === "Access token expired") {
            await this.$store.dispatch("refreshToken");
            this.getInformation();
          } else {
            this.setLoading(false);
            this.$swal({
              title: "มีบางอย่างผิดพลาด",
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        });
    },
    openConceptualCharacteristicsDialog(mode, data = null) {
      this.dialogMode = mode;
      this.dataInfo = data || null;
      this.openingConceptualCharacteristicsDialog = true;
    },
    async createConceptualCharacteristicsDialog(data) {
      this.setLoading(true);
      let header = { access_token: this.userProfile.access_token };
      axios
        .post(apiUrl + "/informations", data, { headers: header })
        .then(async (response) => {
          let data = response.data;
          if (data.status === "success") {
            this.setLoading(false);
            this.$swal({
              title: "บันทึกข้อมูลสำเร็จ",
              icon: "success",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            }).then(async (result) => {
              if (result.isConfirmed) {
                await this.getInformation();
              }
            });
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error;
          this.setLoading(false);
          if (errorMessage === "Access token expired") {
            await this.$store.dispatch("refreshToken");
            this.getInformation();
          } else if (errorMessage === "mb_code is duplicated") {
            this.$swal({
              html: `<h3>MB Code "${data.mb_code.trim()}"<br>มีอยู่ในระบบอยู่แล้ว</h3>`,
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            });
          } else {
            this.setLoading(false);
            this.$swal({
              title: "มีบางอย่างผิดพลาด",
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        });
    },
    editConceptualCharacteristicsDialog(data) {
      this.setLoading(true);
      let header = { access_token: this.userProfile.access_token };
      axios
        .put(apiUrl + "/informations", data, { headers: header })
        .then(async (response) => {
          let data = response.data;
          if (data.status === "success") {
            this.setLoading(false);
            this.$swal({
              title: "อัพเดตข้อมูลสำเร็จ",
              icon: "success",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            }).then(async (result) => {
              if (result.isConfirmed) {
                await this.getInformation();
              }
            });
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error;
          this.setLoading(false);
          if (errorMessage === "Access token expired") {
            await this.$store.dispatch("refreshToken");
            this.getInformation();
          } else if (errorMessage === "mb_code is duplicated") {
            this.$swal({
              html: `<h3>MB Code "${data.mb_code_new.trim()}"<br>มีอยู่ในระบบอยู่แล้ว</h3>`,
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            });
          } else {
            this.setLoading(false);
            this.$swal({
              title: "มีบางอย่างผิดพลาด",
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload();
              }
            });
          }
        });
    },
    deleteConceptualCharacteristics() {
      if (this.informationSelected.length !== 0) {
        this.$swal({
          html: "<h2>คุณต้องการลบข้อมูลหรือไม่ ?</h2>",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#74B9FF",
          cancelButtonColor: "#EC0927",
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
          reverseButtons: true,
          customClass: "font-prompt",
        }).then((result) => {
          if (result.isConfirmed) {
            this.setLoading(true);
            let data = [];
            this.informationSelected.forEach((ele) => {
              data.push(ele.mb_code);
            });
            data = data.join(",");

            let config = {
              headers: { access_token: this.userProfile.access_token },
              params: { mb_code: data },
            };
            axios
              .delete(apiUrl + "/informations", config)
              .then(async (response) => {
                let data = response.data;
                if (data.status === "success") {
                  this.setLoading(false);
                  if (data.result.deleted.length !== 0) {
                    this.$swal({
                      title: "ลบข้อมูลสำเร็จ",
                      icon: "success",
                      confirmButtonText: "ตกลง",
                      customClass: "font-prompt",
                      allowOutsideClick: false,
                    }).then(async (result) => {
                      if (result.isConfirmed) {
                        this.displayInformation = [];
                        this.informationSelected = [];
                        await this.getInformation();
                      }
                    });
                  } else {
                    this.$swal({
                      title: "ไม่สามารถลบข้อมูลได้",
                      icon: "error",
                      confirmButtonText: "ตกลง",
                      customClass: "font-prompt",
                      allowOutsideClick: false,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        location.reload();
                      }
                    });
                  }
                }
              })
              .catch(async (error) => {
                let errorMessage = error.response.data.message_error;
                this.setLoading(false);
                if (errorMessage === "Access token expired") {
                  await this.$store.dispatch("refreshToken");
                  this.getInformation();
                } else {
                  this.setLoading(false);
                  this.$swal({
                    title: "มีบางอย่างผิดพลาด",
                    icon: "error",
                    confirmButtonText: "ตกลง",
                    customClass: "font-prompt",
                    allowOutsideClick: false,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      location.reload();
                    }
                  });
                }
              });
          }
        });
      } else {
        this.setLoading(false);
        this.$swal({
          html: "<h2>กรุณาเลือกข้อมูลที่ต้องการลบ</h2>",
          icon: "warning",
          confirmButtonText: "ตกลง",
          customClass: "font-prompt",
          allowOutsideClick: false,
        });
      }
    },
    newLineText(text) {
      let display_txt = text.replace(/\n/g, "<br />");
      return display_txt;
    },
    closingConceptualCharacteristicsDialog(statusDialog) {
      this.openingConceptualCharacteristicsDialog = statusDialog;
      this.renderConceptualCharacteristicsDialog = false;
      this.$nextTick(() => {
        this.renderConceptualCharacteristicsDialog = true;
      });
    },
  },
};
</script>
<style scoped>
@import "../../assets/style/information-style.css";
@import "../../assets/style/main.css";
</style>
