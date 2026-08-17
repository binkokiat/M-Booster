<template>
  <div class="import-data">
    <div class="pa-3 content background-main">
      <v-row justify="center" class="px-3 mt-5">
        <v-card tile style="width: 97%; min-height: 82vh">
          <v-card-title class="pt-7 pb-1 pl-10">
            <span style="font-size: 1.5rem">
              นำเข้าข้อมูลผลการวิเคราะห์ศักยภาพ myDNA
            </span>
          </v-card-title>
          <v-card-actions>
            <v-row justify="center" style="text-align: -webkit-center">
              <v-col cols="12">
                <v-img
                  v-show="!showResponse"
                  src="../../assets/images/Excel-Logo.png"
                  width="350"
                  max-width="350"
                  :class="fileUpload === null ? 'mb-6' : ''"
                >
                </v-img>
                <div v-show="showResponse" class="px-15">
                  <v-expansion-panels
                    v-model="panelCompleted"
                    :readonly="importCompletedList.length === 0 ? true : false"
                    class="mb-3"
                  >
                    <v-expansion-panel>
                      <v-expansion-panel-header
                        disable-icon-rotate
                        color="#f4f5f7"
                        style="font-size: 1rem"
                        class="px-6 py-6 font-medium"
                      >
                        <span>
                          Complete
                          <span style="font-weight: 400; color: #707070">
                            {{ `(${importCompletedList.length} User)` }}
                          </span>
                        </span>
                        <template v-slot:actions>
                          <v-icon color="#2ECC71"> icon-icon-check </v-icon>
                        </template>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content color="#f4f5f7">
                        <div style="max-height: 320px; overflow-y: auto">
                          <v-list
                            v-for="(item, index) in importCompletedList"
                            :key="index"
                            dense
                            class="import-list"
                          >
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title class="text-left px-3">
                                  {{
                                    item.reference_code !== ""
                                      ? `${item.user_id} (${item.reference_code}) ${item.status}`
                                      : `${item.user_id} ${item.status}`
                                  }}
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                  <v-expansion-panels
                    v-model="panelFail"
                    :readonly="importFailList.length === 0 ? true : false"
                  >
                    <v-expansion-panel>
                      <v-expansion-panel-header
                        disable-icon-rotate
                        color="#f4f5f7"
                        style="font-size: 1rem"
                        class="px-6 py-6 font-medium"
                      >
                        <span>
                          Fail
                          <span style="font-weight: 400; color: #707070">
                            {{ `(${importFailList.length} User)` }}
                          </span>
                        </span>
                        <template v-slot:actions>
                          <v-icon color="#EC0927"> icon-Alert_icon </v-icon>
                        </template>
                      </v-expansion-panel-header>
                      <v-expansion-panel-content color="#f4f5f7">
                        <div style="max-height: 320px; overflow-y: auto">
                          <v-list
                            v-for="(item, index) in importFailList"
                            :key="index"
                            dense
                            class="import-list"
                          >
                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title class="text-left px-3">
                                  {{
                                    item.reference_code !== ""
                                      ? `${item.user_id} (${item.reference_code}) ${item.status}`
                                      : `${item.user_id} ${item.status}`
                                  }}
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-list>
                        </div>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
              </v-col>
              <v-col>
                <p
                  style="font-size: 1.2rem"
                  v-if="fileUpload !== null"
                  class="mb-10"
                >
                  {{ fileUpload.name }}
                </p>
                <v-btn
                  class="mx-5"
                  :outlined="
                    fileUpload !== null ? true : showResponse ? true : false
                  "
                  color="#0F6939"
                  dark
                  large
                  @click="handleFileButtonClick"
                  :class="
                    fileUpload !== null
                      ? 'button-send-data'
                      : showResponse
                      ? 'button-send-data'
                      : ''
                  "
                  style="width: 300px"
                >
                  <v-icon class="mr-2">
                    {{
                      fileUpload !== null
                        ? "icon-result_icon"
                        : showResponse
                        ? "icon-result_icon"
                        : "icon-import_icon"
                    }}
                  </v-icon>
                  <span style="font-size: 1.1rem">
                    {{
                      fileUpload !== null
                        ? "เลือกไฟล์ใหม่"
                        : showResponse
                        ? "เลือกไฟล์ใหม่"
                        : "เพิ่มไฟล์ของคุณ"
                    }}
                  </span>
                </v-btn>
                <input
                  type="file"
                  ref="files"
                  @change="onFileSelected"
                  style="display: none"
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                />
                <v-btn
                  v-if="fileUpload !== null && showResponse === false"
                  style="width: 300px"
                  color="#0F6939"
                  dark
                  large
                  @click="importData()"
                >
                  <v-icon class="mr-2"> icon-import_icon </v-icon>
                  <span style="font-size: 1.1rem"> ส่งข้อมูล </span>
                </v-btn>
                <v-btn
                  v-if="fileUpload === null && showResponse"
                  style="width: 300px"
                  color="#0F6939"
                  dark
                  large
                  :to="{ name: 'UserList' }"
                >
                  <v-icon class="mr-2"> icon-Correct_icon </v-icon>
                  <span style="font-size: 1.1rem"> ยืนยัน </span>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-row>
    </div>
  </div>
</template>
<script>
import { storage } from "../../utils/firebase";
import { apiUrl } from "../../utils/url";
import axios from "axios";

const STORAGE_REF = storage.ref();

export default {
  name: "importReport",
  data() {
    return {
      fileUpload: null,
      showResponse: false,
      importCompletedList: [],
      importFailList: [],
      panelCompleted: undefined,
      panelFail: undefined,
    };
  },
  computed: {
    userProfile() {
      return this.$store.state.currentUser;
    },
  },
  watch: {
    panelCompleted(val) {
      if (val === 0) this.panelFail = undefined;
    },
    panelFail(val) {
      if (val === 0) this.panelCompleted = undefined;
    },
  },
  async created() {
    await this.$store.dispatch("getUserProfile");
  },
  methods: {
    handleFileButtonClick() {
      this.$refs.files.click();
    },
    onFileSelected(event) {
      if (event.target.files[0] !== undefined) {
        this.showResponse = false;
        let file = event.target.files[0];
        this.fileUpload = {
          name: file.name,
          file: event.target.files[0],
        };
      }
    },
    async importData() {
      if (this.fileUpload !== null) {
        this.setLoading(true);
        var fileUrl = await this.uploadFileToStorage(this.fileUpload);
        this.importReportWithApi(fileUrl);
      }
    },
    async uploadFileToStorage(file) {
      return new Promise(function (resolve, reject) {
        // Create file metadata including the content type
        var metadata = {
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };

        // Upload the file and metadata

        var storagePath = "import-report";
        var fileName = "user-report.xlsx";

        let fileRef = STORAGE_REF.child(storagePath).child(fileName);
        let uploadTask = fileRef.put(file.file, metadata);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            var progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log('Upload is ' + progress + '% done')
          },
          function error(err) {
            console.log("error", err);
            reject();
          },
          function complete() {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function (downloadURL) {
                resolve(downloadURL);
              });
          }
        );
      });
    },
    importReportWithApi(fileUrl) {
      let header = { access_token: this.userProfile.access_token };
      axios
        .post(
          apiUrl + "/users/import_report",
          { import_url: fileUrl },
          { headers: header }
        )
        .then((response) => {
          let data = response.data;
          if (data.status == "success") {
            this.importCompletedList = Array.from(data.result.imported);
            this.importFailList = Array.from(data.result.not_imported);
            if (
              this.importCompletedList.length !== 0 &&
              this.importFailList.length === 0
            ) {
              this.panelCompleted = 0;
              this.panelFail = undefined;
            } else if (
              this.importCompletedList.length === 0 &&
              this.importFailList.length !== 0
            ) {
              this.panelCompleted = undefined;
              this.panelFail = 0;
            } else if (
              this.importCompletedList.length !== 0 &&
              this.importFailList.length !== 0
            ) {
              this.panelCompleted = 0;
              this.panelFail = undefined;
            } else {
              this.panelCompleted = undefined;
              this.panelFail = undefined;
            }
            this.setLoading(false);
            this.clearData();
            this.showResponse = true;
          }
        })
        .catch(async (error) => {
          let errorMessage = error.response.data.message_error;
          if (errorMessage === "Access token expired") {
            await this.$store.dispatch("refreshToken");
            this.importReportWithApi(fileUrl);
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
                this.clearData();
                this.showResponse = false;
              }
            });
          }
        });
    },
    setLoading(val) {
      this.$store.commit("SET_LOADING", val);
    },
    clearData() {
      this.$refs.files.value = null;
      this.fileUpload = null;
    },
  },
};
</script>
<style scoped>
@import "../../assets/style/main.css";
.import-list {
  padding: 0;
  border: 0.1px solid #e4e4e4;
  height: 40px;
}
.import-list > .v-list-item {
  min-height: 100%;
}
.v-expansion-panel::before {
  box-shadow: none;
}
</style>