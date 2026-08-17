<template>
  <v-card style="background: #F5F5F5;">
    <v-card-title class="py-1" style="background:#466BB2;color:white;">
      <v-row>
        <div class="text-center pt-1" style="width: 100%">
          <label for="SCANNING">SCANNING</label>
          <v-icon
            class="text-right pt-1"
            color="white"
            size="20"
            style="position: absolute; right: 15px;"
            @click="exitFunc()"
            >icon-icon-close</v-icon
          >
        </div>
      </v-row>
    </v-card-title>
    <v-card-text class="pb-3"> 
        <v-row class="mt-5 ml-5 mr-1" justify="space-between">
          <!-- Section stream scanner -->
          <div style="width: 40%">
            <v-card tile class="text-center left-fingerprint-box mb-1" style="height: 475px;">
              <v-card-text class="pa-1" style="height: inherit;">
                <v-img
                  v-if="displayZoomFingerPrint !== ''"
                  :src="displayZoomFingerPrint"
                  color="#F5F5F5"
                  height="100%"
                  contain
                ></v-img>
                <canvas
                  v-else-if="isActive === true && stopInterval === false && hasFingerPrint === true"
                  id="fingerFrame"
                  height="460px"
                  width="320px"
                  ref="fingerFrame"
                ></canvas>
                <v-icon 
                  v-else
                  color="#AEAEAE" 
                  size="8rem" 
                  style="height: 100%"
                >
                  icon-finger_icon
                </v-icon>
              </v-card-text>
            </v-card>
            <span v-if="displayZoomFingerPrint === ''" :class="isActive ? hasFingerPrint ? 'green--text' : 'red--text' : 'red--text'">
              Status: <span v-text="statusLabel"></span>
            </span>
          </div>

          <!-- Section Display fingerprint scan -->
          <div style="width: 20%">
            <v-row no-gutters>
              <v-col cols="12">
                <span class="f-center-title">1</span>
                <v-card tile class="text-center f-center-fingerprint-box">
                  <v-card-text
                    class="f-center-display-fingerprint f-border-blue pointer"
                  >
                    <div
                      v-if="displayFingerPrint !== null && displayFingerPrint['angle_1']['image'] !== ''"
                    >
                      <v-img
                        :src="displayFingerPrint['angle_1']['image']"
                        :height="96"
                        cover
                        color="#F5F5F5"
                        @click="displayZoomFingerPrintSelected(displayFingerPrint['angle_1']['image'])"
                      ></v-img>
                    </div>
                    <div v-else style="height:96px;">
                      <v-icon
                        color="#AEAEAE"
                        style="font-size:3rem;margin-top:20%;"
                        >icon-finger_icon</v-icon
                      >
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <div v-for="l in 3" :key="'ld' + l">
                  <span class="f-center-title">{{ l * 2 }}</span>
                  <v-card class="text-center f-center-fingerprint-box ">
                    <v-card-text
                      class="f-center-display-fingerprint f-border-orange pointer"
                    >
                      <div
                        v-if="displayFingerPrint !== null && displayFingerPrint['angle_' + l * 2]['image'] !== ''"
                      >
                        <v-img
                          :src="displayFingerPrint['angle_' + l * 2]['image']"
                          :height="96"
                          cover
                          color="#F5F5F5"
                          @click="displayZoomFingerPrintSelected(displayFingerPrint['angle_' + l * 2]['image'])"
                        ></v-img>
                      </div>
                      <div v-else style="height:96px;">
                        <v-icon
                          color="#AEAEAE"
                          style="font-size:3rem;margin-top:20%;"
                          >icon-finger_icon</v-icon
                        >
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-col>
              <v-col cols="6" md="6">
                <div v-for="r in 3" :key="'rd' + r">
                  <span class="f-center-title">{{
                    r === 1 ? "3" : r === 2 ? "5" : "7"
                  }}</span>
                  <v-card class="text-center f-center-fingerprint-box ">
                    <v-card-text
                      class="f-center-display-fingerprint f-border-green pointer"
                    >
                      <div
                        v-if="displayFingerPrint !== null && displayFingerPrint[`angle_${r === 1 ? '3' : r === 2 ? '5' : '7'}`]['image'] !== ''"
                      >
                        <v-img
                          :src="displayFingerPrint[`angle_${r === 1 ? '3' : r === 2 ? '5' : '7'}`]['image']"
                          :height="96"
                          cover
                          color="#F5F5F5"
                          @click="displayZoomFingerPrintSelected(displayFingerPrint[`angle_${r === 1 ? '3' : r === 2 ? '5' : '7'}`]['image'])"
                        ></v-img>
                      </div>
                      <div v-else style="height:96px;">
                        <v-icon
                          color="#AEAEAE"
                          style="font-size:3rem;margin-top:20%;"
                          >icon-finger_icon</v-icon
                        >
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Section table selected fingerprint -->
          <div class="pl-7" style="width: 40%">
            <table class="f-table">
              <!-- Hand Left -->
              <thead>
                <tr class="f-row-height">
                  <th></th>
                  <th colspan="3" class="text-center f-gray-highlight f-border">
                    <span class="f-text">มุมฝั่งซ้าย</span>
                  </th>
                  <th
                    style="width: 11%"
                    class="text-center f-gray-highlight f-border"
                  >
                    <span class="f-text">กลาง</span>
                  </th>
                  <th colspan="3" class="text-center f-gray-highlight f-border">
                    <span class="f-text">มุมฝั่งขวา</span>
                  </th>
                </tr>
                <tr class="f-row-height">
                  <th class="f-gray-highlight f-border f-border">
                    <span class="f-text">มือซ้าย</span>
                  </th>
                  <th
                    v-for="(leftHand, hlIdx) in hands"
                    :key="'HL' + hlIdx"
                    class="f-border"
                    :class="leftHand.angle === 'left' ? 'f-orange-color' : leftHand.angle === 'center' ? 'f-blue-color' : 'f-green-color'"
                  >
                    <span>{{ leftHand.number }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(finger, fIdx) in fingers"
                  :key="'L' + finger.fingerKey + fIdx"
                  class="f-row-height f-border"
                  :class="'L' + finger.fingerKey === activeFIdx ? 'tr-active' : 'tr-not-active'"
                >
                  <th
                    class="f-gray-light-highlight f-border pointer"
                    style="width: 70px;"
                    @click="toggleHilightRow('L' + finger.fingerKey ), getImageToShow('left', finger.fingerKey)"
                  >
                    <span class="f-sub-title">{{ finger.finger }}  </span>
                  </th>
                  <td
                    v-for="(angleKey, hrIdx) in Object.keys(finger.angle)"
                    :key="'HR-AL' + hrIdx"
                    class="text-center f-border bg-white"
                    style="width: 70px;"
                  >
                    <div
                      v-if="'L' + finger.fingerKey === activeFIdx"
                      @click="setFingerPrintImage('left', finger.fingerKey, angleKey)"
                      style="height: 35px;"
                    >
                      <div
                        class="f-check-box"
                        v-if="form !== null && form['left'][finger.fingerKey]['angle'][angleKey] !== undefined"
                      >
                        <v-btn
                          v-if="form['left'][finger.fingerKey]['angle'][angleKey]['image']"
                          elevation="0"
                          icon
                          dark
                          color="#466BB2"
                          class="f-check-button"
                        >
                          <v-icon size="20">icon-Correct_icon</v-icon>
                        </v-btn>
                      </div>
                    </div>
                    <div v-else style="height: 35px;">
                      <div
                        class="f-check-box"
                        v-if="form !== null && form['left'][finger.fingerKey]['angle'][angleKey] !== undefined"
                      >
                        <v-btn
                          v-if="form['left'][finger.fingerKey]['angle'][angleKey]['image']"
                          elevation="0"
                          icon
                          dark
                          color="#466BB2"
                          class="f-check-button"
                        >
                          <v-icon size="20">icon-Correct_icon</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </td>
                  <td style="width: 30px; background: transparent !important;">
                    <v-btn
                      class="mx-2 f-delete-button"
                      fab
                      dark
                      elevation="0"
                      @click="confirmDelete('left', finger.finger, finger.fingerKey)"
                    >
                      <v-icon size="12" dark>
                        icon-Bin_icon
                      </v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
              <!-- Hand Right -->
              <thead>
                <tr class="f-row-height">
                  <th class="f-gray-highlight f-border">
                    <span class="f-text">มือขวา</span>
                  </th>
                  <th
                    v-for="(rightHand, rIdx) in hands"
                    :key="'R' + rIdx"
                    class="f-border"
                    :class="rightHand.angle === 'left' ? 'f-orange-color' : rightHand.angle === 'center' ? 'f-blue-color' : 'f-green-color'"
                  >
                    <span>{{ rightHand.number }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(finger, fIdx) in fingers"
                  :key="'R' + finger.fingerKey + fIdx"
                  class="f-row-height f-border"
                  :class="'R' + finger.fingerKey === activeFIdx ? 'tr-active' : 'tr-not-active'"
                >
                  <th
                    class="f-gray-light-highlight f-border pointer"
                    style="width: 70px;"
                    @click="toggleHilightRow('R' + finger.fingerKey), getImageToShow('right', finger.fingerKey)"
                  >
                    <span class="f-sub-title">{{ finger.finger}}</span>
                  </th>
                  <td
                    v-for="(angleKey, hrIdx) in Object.keys(finger.angle)"
                    :key="'HR-AR' + hrIdx"
                    class="text-center f-border bg-white"
                    style="width: 70px;"
                  >
                    <div
                      v-if="'R' + finger.fingerKey === activeFIdx"
                      @click="setFingerPrintImage('right', finger.fingerKey, angleKey)"
                      style="height: 35px;"
                    >
                      <div
                        class="f-check-box"
                        v-if="form !== null && form['right'][finger.fingerKey]['angle'][angleKey] !== undefined"
                      >
                        <v-btn
                          v-if="form['right'][finger.fingerKey]['angle'][angleKey]['image']"
                          elevation="0"
                          icon
                          dark
                          color="#466BB2"
                          class="f-check-button"
                        >
                          <v-icon size="20">icon-Correct_icon</v-icon>
                        </v-btn>
                      </div>
                    </div>
                    <div v-else style="height: 35px;">
                      <div
                        class="f-check-box"
                        v-if="form !== null && form['right'][finger.fingerKey]['angle'][angleKey] !== undefined"
                      >
                        <v-btn
                          v-if="form['right'][finger.fingerKey]['angle'][angleKey]['image']"
                          elevation="0"
                          icon
                          dark
                          color="#466BB2"
                          class="f-check-button"
                        >
                          <v-icon size="20">icon-Correct_icon</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </td>
                  <td style="width: 30px; background: transparent !important;">
                    <v-btn
                      class="mx-2 f-delete-button"
                      fab
                      dark
                      elevation="0"
                      @click="confirmDelete('right', finger.finger, finger.fingerKey)"
                    >
                      <v-icon size="12" dark>
                        icon-Bin_icon
                      </v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-row>
    </v-card-text>
    <v-card-actions class="pb-4" style="justify-content: center;">
      <!-- <v-btn
        v-if="!stopInterval"
        color="#888888"
        dark
        class="mr-3 f-button"
        @click="stopInterval = true, displayZoomFingerPrint = '', stopScan()"
      >
        <v-icon size="18" color="#ffff" class="mr-2">icon-finger_icon</v-icon>
        หยุด
      </v-btn> -->
      <v-btn
        v-if="stopInterval"
        color="#E66E32"
        dark
        class="mr-3 f-button"
        @click="stopInterval = false, displayZoomFingerPrint = '', beginOperation()"
      >
        <v-icon size="18" color="#ffff" class="mr-2">icon-finger_icon</v-icon>
        เริ่มสแกน
      </v-btn>
      <v-btn
        color="#74B9FF"
        :dark="!onUpdate"
        class="f-button"
        @click="scanningCompleted()"
        :disabled="onUpdate"
      >
        <v-icon size="18" class="mr-2">icon-Correct_icon</v-icon>
        เสร็จสิ้น
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from "axios";
import { storage } from "../../utils/firebase";
import { apiUrl } from "../../utils/url";
import dayjs from "dayjs";

const STORAGE_REF = storage.ref();

export default {
  props: ["fingerPrintInfo", "hand"],
  data() {
    return {
      statusLabel: '',
      dialog: false,
      isdelFinger: false,
      loading: false,
      hands: [
        { angle: "left", number: "6" },
        { angle: "left", number: "4" },
        { angle: "left", number: "2" },
        { angle: "center", number: "1" },
        { angle: "right", number: "3" },
        { angle: "right", number: "5" },
        { angle: "right", number: "7" },
      ],
      fingers: [
        {
          finger: "นิ้วโป้ง",
          fingerKey: "thumb",
          angle: {
            angle_6: { image: "" },
            angle_4: { image: "" },
            angle_2: { image: "" },
            angle_1: { image: "" },
            angle_3: { image: "" },
            angle_5: { image: "" },
            angle_7: { image: "" },
          },
        },
        {
          finger: "นิ้วชี้",
          fingerKey: "index",
          angle: {
            angle_6: { image: "" },
            angle_4: { image: "" },
            angle_2: { image: "" },
            angle_1: { image: "" },
            angle_3: { image: "" },
            angle_5: { image: "" },
            angle_7: { image: "" },
          },
        },
        {
          finger: "นิ้วกลาง",
          fingerKey: "middle",
          angle: {
            angle_6: { image: "" },
            angle_4: { image: "" },
            angle_2: { image: "" },
            angle_1: { image: "" },
            angle_3: { image: "" },
            angle_5: { image: "" },
            angle_7: { image: "" },
          },
        },
        {
          finger: "นิ้วนาง",
          fingerKey: "ring",
          angle: {
            angle_6: { image: "" },
            angle_4: { image: "" },
            angle_2: { image: "" },
            angle_1: { image: "" },
            angle_3: { image: "" },
            angle_5: { image: "" },
            angle_7: { image: "" },
          },
        },
        {
          finger: "นิ้วก้อย",
          fingerKey: "pinkie",
          angle: {
            angle_6: { image: "" },
            angle_4: { image: "" },
            angle_2: { image: "" },
            angle_1: { image: "" },
            angle_3: { image: "" },
            angle_5: { image: "" },
            angle_7: { image: "" },
          },
        },
      ],
      fingerPrintSelected: null,
      activeFIdx: "",
      displayImage: "",
      form: {
        left: {
          thumb: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          index: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          middle: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          ring: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          pinkie: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
        },
        right: {
          thumb: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          index: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          middle: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          ring: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
          pinkie: {
            angle: {
              angle_1: {
                image: "",
              },
              angle_2: {
                image: "",
              },
              angle_3: {
                image: "",
              },
              angle_4: {
                image: "",
              },
              angle_5: {
                image: "",
              },
              angle_6: {
                image: "",
              },
              angle_7: {
                image: "",
              },
            },
          },
        },
      },
      handSelected: null,
      displayFingerPrint: null,
      displayZoomFingerPrint: "",
      fpHTTSrvOpEP: "http://127.0.0.1:15270/fpoperation",
      lastInitOp: null,
      stopInterval: false,
      isActive: false,
      user: null,
      fingerPrint: null,
      lastModified: "",
      userID: '',
      fingerId: '',
      isEditPage: false,
      isFoundDriverScanner: true,
      hasFingerPrint: false,
      onUpdate: false,
      tempFingerprints: null,
    };
  },
  computed: {
    getStatus() {
      return this.$store.state.status
    },
    getUserID() {
      return this.$route.params.clientId
    },
    userProfile() {
      return this.$store.state.currentUser
    },
    userInfo() {
      return this.$store.state.userInfo 
    },
    isOnline () {
      return this.$store.state.isOnline
    }
  },
  watch: {
    userInfo(val){
      if (val !== undefined) {
        this.createdUser(val)
      }
    },
    hand: {
        immediate: true,
        handler(newValue, oldValue) {
            if (newValue !== null) {
              if (this.$route.path !== "/add-user") {
                this.isEditPage = true
                this.form = JSON.parse(
                  JSON.stringify(this.fingerPrintInfo["fingerprint"])
                );
                this.lastModified = this.fingerPrintInfo.latest_modified
                this.fingerId = this.fingerPrintInfo.finger_id
                this.userID = this.getUserID
              }

              let hand = newValue.hand === 'right' ? 'R' : 'L'
              let fIdx = hand+newValue.finger
              this.setInitialData()
              this.toggleHilightRow(fIdx)
              this.getImageToShow(newValue.hand, newValue.finger)
            }
        }
    },
    async isOnline (val) {
      if (val) {
          await this.$store.dispatch('getUserProfile')  
      }
    }
  },
  created() {
    this.setInitialData()
    this.beginOperation()
  },
  methods: {
    setInitialData () {
      if (this.$route.path !== "/add-user") {
        this.isEditPage = true
        this.form = JSON.parse(
          JSON.stringify(this.fingerPrintInfo["fingerprint"])
        );
        this.lastModified = this.fingerPrintInfo.latest_modified
        this.fingerId = this.fingerPrintInfo.finger_id
        this.userID = this.getUserID
      } 
    },
    initailData() {
      this.displayZoomFingerPrint = ""
      this.toggleHilightRow("Lthumb")
    }, 
    setLoading(val) {
      this.$store.commit("SET_LOADING", val)
    },
    toggleHilightRow(fIdx) {
      this.activeFIdx = fIdx;
      this.displayZoomFingerPrint = ""
    },
    async setFingerPrintImage(hand, finger, angle_) {
      if (this.isActive) {
        if (this.stopInterval === false) {
          if (this.hasFingerPrint) {
            if (this.userID === undefined || this.userID === '') {
              this.$store.commit('SET_IS_SAVE_USER_INFO', true)
              this.fingerPrintSelected = {
                hand: hand,
                finger: finger,
                angle_: angle_
              }
            } else {
              this.setValueBeforeUpdateFingerPrint(hand, finger, angle_)
            }
          } else {
            this.checkFingerPrint()
          }  
        }
      } else {
        this.stopScan()
        if (this.isFoundDriverScanner) {
          this.scanNotActive()
        } else {
          this.driverNotFound()
        }
      }
    },
    async createdUser (data) {
      this.userID = data.user_id

      let fingerPrintInfo = await this.getFingerPrint()

      this.form = JSON.parse(JSON.stringify(fingerPrintInfo['fingerprint']))
      this.lastModified = fingerPrintInfo['latest_modified']
      this.fingerId = fingerPrintInfo['finger_id']

      this.setValueBeforeUpdateFingerPrint(this.fingerPrintSelected.hand, this.fingerPrintSelected.finger, this.fingerPrintSelected.angle_)
    },
    async setValueBeforeUpdateFingerPrint(hand, finger, angle_) {
      let img64 = document.getElementById("fingerFrame").toDataURL("image/jpeg")

      if (this.isOnline) {
        let imageUrl = await this.uploadFingerPrintsImageToStorage(hand, finger, angle_, img64)

        this.$set(this.form[hand][finger]["angle"][angle_], "image", imageUrl)

        if (this.onUpdate) {
          this.tempFingerprints = JSON.parse(JSON.stringify(this.form))
        } else {
          this.updateFingerPrint(this.form)
        }
      } else {
        this.$set(this.form[hand][finger]["angle"][angle_], "image", img64)
        this.updateFingerPrintTolocalDB()
      } 
    },
    async uploadFingerPrintsImageToStorage(hand, finger, angle_, fingerImage) {
      let self = this
      return new Promise(function(resolve, reject) {
        let storagePath = `users/${self.userID}/fingerprints/${hand}/${finger}`
        let imageName = angle_ + ".jpg"
        let imageRef = STORAGE_REF.child(storagePath).child(imageName)
        let uploadTask = imageRef.putString(fingerImage, "data_url", {
          contentType: "image/jpeg",
        });
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            let progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            // console.log('Upload is ' + progress + '% done')
          },
          function error(err) {
            reject();
          },
          function complete() {
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function(downloadURL) {
                resolve(downloadURL)
                self.setLoading(false)
              });
          }
        );
      });
    },
    async getFingerPrint() {
      if (this.isOnline) {
        return await this.$store.dispatch("getFingerPrint", this.userID)
      } else {
        return await this.$store.dispatch("getFingerprintFromLocalDB", this.userID)
      }
    },
    async updateFingerPrint(fingerprint) {
      this.onUpdate = true
      let header = { access_token: this.userProfile.access_token }
      let data = {}
      data.fingerprint = fingerprint
      data.latest_modified = this.lastModified
      data.finger_id = this.fingerId
      
      axios
        .put(apiUrl + "/users/" + this.userID + "/fingerprint", data, {
          headers: header,
        })
        .then(async (response) => {
          if (response.data.status === "success") {
            this.setLoading(false)
            this.displayFingerPrint = this.form[this.handSelected.hand][this.handSelected.finger]["angle"]
            this.lastModified = response.data.result.latest_modified

            if (this.tempFingerprints) {
             let current = JSON.parse(JSON.stringify(this.tempFingerprints))
             this.tempFingerprints = null

             this.updateFingerPrint(current)

            } else {
              this.onUpdate = false
            }

            this.$emit("SaveScanDialog", response.data.result)
          }
        })
        .catch( async (error) => {
          this.onUpdate = false
          this.setLoading(false)
          let errorMessage = error.response.data.message_error 
          if (errorMessage === "Please fetch new data") {
            this.$swal({
              title: "เนื่องจากมีข้อมูลที่อัพเดทล่าสุด",
              text: "ระบบจะทำการรีเฟรชข้อมูลให้อัตโนมัติ",
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
            }).then(async (result) => {
              if (result.isConfirmed) {
                location.reload()
              }
            })
          } else if (errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.updateFingerPrint(fingerprint) 
          }
        })
    },
    getImageToShow(hand, finger) {
      this.handSelected = { hand, finger }
      this.displayFingerPrint = this.form[hand][finger]["angle"]
    },
    displayZoomFingerPrintSelected(img) {
      this.stopScan()
      this.displayZoomFingerPrint = img
    },
    confirmDelete(hand, display, finger) {
      if (this.isActive) {
        this.isdelFinger = !this.isdelFinger
        let textDisplay = `${display}${hand === "left" ? "ซ้าย" : "ขวา"}`
        this.$swal({
          html:
            "<strong><span>คุณต้องการลบข้อมูล<b style='color:red;'>" +
            textDisplay +
            "</b>หรือไม่ ?</span></strong>",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#74B9FF",
          cancelButtonColor: "#EC0927",
          cancelButtonText: "&emsp;&emsp;ยกเลิก&emsp;&emsp;",
          confirmButtonText: "&emsp;&emsp;ยืนยัน&emsp;&emsp;",
          reverseButtons: true,
          customClass: "font-prompt",
        }).then((result) => {
          if (result.isConfirmed) {
            this.deleteFingerprint(hand, finger)
          }
        });
      } else {
          if (this.isFoundDriverScanner) {
            this.scanNotActive()
          } else {
            this.driverNotFound()
          }
      }
    },
    deleteFingerprint(hand, finger) {
        this.form[hand][finger] = {
          ai_type: "",
          ai_RC1: 0,
          ai_RC2: 0,
          analyst_type: "",
          analyst_RC1: 0,
          analyst_RC2: 0,
          angle: { angle_1 : {}, angle_2 : {}, angle_3 : {}, angle_4 : {}, angle_5 : {}, angle_6 : {}, angle_7 : {} }
      }
      for (let index = 1; index <= 7; index++) {
        let angle_ = "angle_" + index;
        this.form[hand][finger]['angle'][angle_] = {
            ai_RC: 0,
            ai_count_image: "",
            ai_enhanced_image: "",
            analyst_RC: 0,
            image: ""
        }
      }
      this.displayZoomFingerPrint = ""
      this.deleteFingerprintWithAPI(this.form)
    },
    deleteFingerprintWithAPI(fingerprint) {
      let header = { access_token: this.userProfile.access_token }
      let data = {}
      data.fingerprint = fingerprint
      data.latest_modified = this.lastModified
      data.finger_id = this.fingerId
      
      axios
        .put(apiUrl + "/users/" + this.userID + "/fingerprint", data, {
          headers: header,
        })
        .then(async (response) => {
          if (response.data.status === "success") {

            this.setLoading(false)

            this.displayFingerPrint = this.form[this.handSelected.hand][this.handSelected.finger]["angle"]
            this.lastModified = response.data.result.latest_modified
            this.displayFingerPrint = null

            this.$emit("SaveScanDialog", response.data.result)
            this.$swal({
              title: "ลบข้อมูลเรียบร้อยแล้ว",
              text: "ข้อมูลของคุณยังถูกเก็บไว้ในฐานข้อมูล",
              icon: "success",
              customClass: "font-prompt",
              showConfirmButton: false,
              timer: 2000,
            })

          }
        }).catch( async (error) => {
          this.setLoading(false)
          let errorMessage = error.response.data.message_error 
          if (errorMessage === "Please fetch new data") {
            this.$swal({
              title: "เนื่องจากมีข้อมูลที่อัพเดทล่าสุด",
              text: "ระบบจะทำการรีเฟรชข้อมูลให้อัตโนมัติ",
              icon: "error",
              confirmButtonText: "ตกลง",
              customClass: "font-prompt",
            }).then(async (result) => {
              if (result.isConfirmed) {
                location.reload()
              }
            })
          } else if (errorMessage === 'Access token expired') {
              await this.$store.dispatch('refreshToken')
              this.deleteFingerprintWithAPI(fingerprint) 
          }
        })
    },
    async updateFingerPrintTolocalDB () {

      let data = {}
      data.id = this.userID,
      data.fingerprint = this.form
      data.latest_modified = this.lastModified
      data.finger_id = this.fingerId
      
      let fingerPrintInfo = await this.$store.dispatch('updateFingerprintTolocalDB', data)
      this.form = JSON.parse(JSON.stringify(fingerPrintInfo['fingerprint']))
      this.setLoading(false)

      this.displayFingerPrint = null
      this.displayFingerPrint = this.form[this.handSelected.hand][this.handSelected.finger]["angle"]
      this.$emit("SaveScanDialog", fingerPrintInfo)
    },
    //  เครื่องสแกนของ My DNA
    beginOperation() {
      let json = JSON.stringify({
        operation: "capture",
        lfd: "no",
        invert: "yes",
      });
      let req = new XMLHttpRequest();
      try {
        req.open("POST", this.fpHTTSrvOpEP);
        req.setRequestHeader("Content-type", "application/json; charset=utf-8")
        req.onload = () => {
          if (req.status == 200) {
            let response = JSON.parse(req.response)
            if (response.status === 'success') {
              this.isFoundDriverScanner = true
              if (this.stopInterval === false) {
                this.isActive = true
              }
              this.parseOperationDsc(response)
            } else {
              this.isActive = false
              this.stopScan()
              this.scanNotActive()
            }
          } else {
            this.stopInterval = true
            this.isActive = false
            this.fixError(req.statusText)
          }
        };
        req.send(json);
        req.onerror = (error) => {
          this.stopInterval = true
          this.isActive = false
          this.isFoundDriverScanner = false
          this.driverNotFound()
        }
      } catch(err) {
        this.stopInterval = true
        this.isActive = false
        this.isFoundDriverScanner = false
        this.driverNotFound()
      }
    },
    parseOperationDsc(opDsc) {
      let res = true;
      if (opDsc.state == "done") {
        if (opDsc.status == "success") {
          if (opDsc.operation == "capture") {
            this.hasFingerPrint = true
            this.statusLabel = 'Scanning.'
            this.interval = setInterval(this.beginOperation(), 1000)
          }
        }
        if (opDsc.status == "fail") {
          if (this.isActive === false) {
            this.scanNotActive()
          }
          res = false
        }
      } else if (opDsc.state == "init") {
        // ขั้นตอนการกำหนดไอดีรูปทุกครั้งที่เรียกรูป
        this.lastInitOp = opDsc.id;
        setTimeout(this.getOperationState, 1000, opDsc.id)
        setTimeout(
          this.getOperationImg,
          1000,
          opDsc.id,
          parseInt(opDsc.devwidth),
          parseInt(opDsc.devheight)
        );
      } else if (opDsc.state == "inprogress") {
        // ทำงานเมื่อไม่ได้วางนิ้วมือ
        this.hasFingerPrint = false
        this.statusLabel = 'No finger on the scanner.'
        setTimeout(this.getOperationState, 1000, this.lastInitOp)
        setTimeout(
          this.getOperationImg,
          1500,
          this.lastInitOp,
          parseInt(opDsc.devwidth),
          parseInt(opDsc.devheight)
        );
      }
      return res;
    },
    getOperationState(opId) {
      let url = this.fpHTTSrvOpEP + "/" + opId
      let req = new XMLHttpRequest()
      try {
        req.open("GET", url)
        req.onload = () => {
          if (req.status == 200) {
            let response = JSON.parse(req.response)
            if (response.status === 'success') {
              if (this.stopInterval === false) {
                this.parseOperationDsc(response)
              }
            } else {
              if (this.stopInterval === false) {
                this.isActive = false
                this.stopScan()
                this.scanNotActive()
              }
            }
          } else {
            this.stopInterval = true
            this.isActive = false
            this.statusLabel = 'Scanner is stopped. Please start again before scanning.'
          }
        };
        req.send();
      } catch (err) {
        this.stopInterval = true
        this.isActive = false
        this.statusLabel = 'Scanner is stopped. Please start again before scanning.'
      }
    },
    getOperationImg(opId, frameWidth, frameHeight) {
      if (this.stopInterval === false && this.isActive === true) {
        let url = this.fpHTTSrvOpEP + "/" + opId + "/image"
        let req = new XMLHttpRequest()
        req.open("GET", url)
        req.onload = () => {
          if (req.status == 200) {
            this.drawFingerFrame(
              new Uint8Array(req.response),
              opId,
              frameWidth,
              frameHeight
            );
          } else {
            this.stopScan()
          }
        };
        req.send();
        req.responseType = "arraybuffer"
      }
    },
    drawFingerFrame(frameBytes, opId, frameWidth, frameHeight) {
      if (this.hasFingerPrint) {
        let ctx = this.$refs.fingerFrame.getContext("2d")
      
        let imgData = ctx.createImageData(
          this.$refs.fingerFrame.width,
          this.$refs.fingerFrame.height
        );
        for (let i = 0; i < frameBytes.length; i++) {
          // red
          imgData.data[4 * i] = frameBytes[i]
          // green
          imgData.data[4 * i + 1] = frameBytes[i]
          // blue
          imgData.data[4 * i + 2] = frameBytes[i]
          //alpha
          imgData.data[4 * i + 3] = 255
        }
        ctx.putImageData(
          imgData,
          0,
          0,
          0,
          0,
          this.$refs.fingerFrame.width,
          this.$refs.fingerFrame.height
        )
      }
    },
    stopScan() {
      if (this.lastInitOp !== null) {
        if (this.isActive === true) {
          let url = this.fpHTTSrvOpEP + '/' + this.lastInitOp + '/cancel'
          let req = new XMLHttpRequest()
          req.open('PUT', url)
          req.onload = () => {
            if (req.status === 200) {
              this.stopInterval = true
            } else {
              this.stopInterval = false
            }
          }
          req.send()
        } else {
          this.stopInterval = true
        }
      } else {
        this.stopInterval = true
        this.isActive = false
      }
    },
    scanningCompleted() {
      if (!this.isEditPage) {
        if (this.isActive) {
          this.stopScan()
        }
        if (this.userID !== "") {
          this.$router.push({name: 'EditUser', params: { clientId: this.userID }})
        } else {
          this.$emit("ScaningDialog", false)
        }
      } else {
        if (this.isActive) {
          this.stopScan()
        }
        this.$emit("ScaningDialog", false)
      }
    },
    exitFunc() {
      if (this.onUpdate) {
        this.$swal({
          title: "กรุณารอสักครู่",
          text: "กำลังอัพเดทลายนิ้วมือ",
          icon: "warning",
          customClass: "font-prompt",
          showConfirmButton: true,
          confirmButtonText: "ตกลง",
        })
      } else {
        this.stopScan()
        this.$swal({
          html: "<h3>คุณต้องการออกจากการทำงานใช่หรือไม่ ?</h3>",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#74B9FF",
          cancelButtonColor: "#EC0927",
          cancelButtonText: "&emsp;&emsp;ยกเลิก&emsp;&emsp;",
          confirmButtonText: "&emsp;&emsp;ยืนยัน&emsp;&emsp;",
          reverseButtons: true,
          customClass: "font-prompt",
        }).then((result) => {
          if (result.isConfirmed) {
            this.initailData()
            this.$store.commit('SET_IS_SAVE_USER_INFO', false)
            this.$emit("ScaningDialog", false)
          }
        })
      }
    },
    checkFingerPrint() {
      if (!this.hasFingerPrint) {
        this.$swal({
          text: "กรุณาวางนิ้วมือบนเครื่องสแกน",
          icon: "warning",
          customClass: "font-prompt",
          showConfirmButton: true,
          confirmButtonText: "ตกลง",
        })
      }
    },
    scanNotActive() {
      this.isActive = false
      this.stopInterval = true
      this.statusLabel = 'Scanner was disconnected.'
      // this.$swal({
      //   title: "<h5>สถานะเครื่องสแกนไม่พร้อมใช้งาน</h5>",
      //   text: "กรุณาเชื่อมต่อเครื่องสแกน",
      //   icon: "warning",
      //   customClass: "font-prompt",
      //   showConfirmButton: true,
      //   confirmButtonText: "ตกลง",
      // });
    },
    driverNotFound() {
      this.isActive = false
      this.stopInterval = true
      this.statusLabel = 'Driver is not found. Please following the installation in the manual.'
      // this.$swal({
      //   title: "<h5>ไม่พบไดรเวอร์ของเครื่องสแกน</h5>",
      //   text: "กรุณาติดตั้งไดรเวอร์ของเครื่องสแกน",
      //   icon: "warning",
      //   customClass: "font-prompt",
      //   showConfirmButton: true,
      //   confirmButtonText: "ตกลง",
      // });
    },
    fixError(text = null) {
      this.isActive = false
      this.stopInterval = true
      let error = text ? ` - ${text}` : null
      this.statusLabel = `Error${error}`
      // this.$swal({
      //   title: "เกิดข้อผิดพลาด",
      //   text: "กรุณาลองอีกครั้งในภายหลัง",
      //   icon: "error",
      //   customClass: "font-prompt",
      //   showConfirmButton: true,
      //   confirmButtonText: "ตกลง",
      // });
    },
  },
};
</script>

<style lang="css" scope>
@import "../../assets/style/main.css";
@import "../../assets/style/fingerprint-style.css";
</style>
