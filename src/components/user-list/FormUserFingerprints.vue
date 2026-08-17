<template>
  <v-card height="fit-content" tile class="mt-3">
    <v-row class="px-7 pt-3" justify="space-between">
      <!-- col 1 Tabhands -->
      <div style="width: 27%" class="py-0">
        <v-card tile height="70">
          <v-card-text class="pa-3">
            <v-avatar color="#466BB2">
              <v-icon dark>
                icon-finger_icon
              </v-icon>
            </v-avatar>
            <b>
              Fingers ID : <span style="margin-left: 14px;"> {{ form !== null ? form.finger_id  : '-' }} </span></b
            >
          </v-card-text>
        </v-card>
        <v-card tile class="mt-3">
          <v-tabs
            v-model="tab"
            background-color="#466BB2"
            slider-color="#E66E32"
            dark
            fixed-tabs
          >
            <v-tab
              v-for="item in tabhands"
              :key="item.name"
              style="font-size:17px"
            >
              {{ item.name }}
            </v-tab>
          </v-tabs>
          <v-tabs-items v-model="tab">
            <v-tab-item v-for="item in tabhands" :key="item.name">
              <v-card tile>
                <v-card-text class="justify-center">
                  <div class="pb-3">
                    <div class="hand-box mx-auto">
                      <v-img
                        class="ma-auto"
                        max-width="180"
                        :src="item.image"
                      ></v-img>
                      <v-btn
                        :ripple="false"
                        v-bind:class="[
                          item.class[0],
                          item.name === 'มือซ้าย'
                            ? { red_border: leftHand.isLittleFingger }
                            : { red_border: rightHand.isThumbFingger },
                        ]"
                        @click="
                          item.name === 'มือซ้าย'
                            ? toggleLeft_litterFinger()
                            : toggleRight_thumbFinger()
                        "
                      ></v-btn>
                      <v-btn
                        :ripple="false"
                        v-bind:class="[
                          item.class[1],
                          item.name === 'มือซ้าย'
                            ? { red_border: leftHand.isRingFingger }
                            : { red_border: rightHand.isIndexFingger },
                        ]"
                        @click="
                          item.name === 'มือซ้าย'
                            ? toggleLeft_ringFinger()
                            : toggleRight_indexFinger()
                        "
                      ></v-btn>
                      <v-btn
                        :ripple="false"
                        v-bind:class="[
                          item.class[2],
                          item.name === 'มือซ้าย'
                            ? { red_border: leftHand.isMiddleFingger }
                            : { red_border: rightHand.isMiddleFingger },
                        ]"
                        @click="
                          item.name === 'มือซ้าย'
                            ? toggleLeft_middleFinger()
                            : toggleRight_middleFinger()
                        "
                      ></v-btn>
                      <v-btn
                        :ripple="false"
                        v-bind:class="[
                          item.class[3],
                          item.name === 'มือซ้าย'
                            ? { red_border: leftHand.isIndexFingger }
                            : { red_border: rightHand.isRingFingger },
                        ]"
                        @click="
                          item.name === 'มือซ้าย'
                            ? toggleLeft_indexFinger()
                            : toggleRight_ringFinger()
                        "
                      ></v-btn>
                      <v-btn
                        :ripple="false"
                        v-bind:class="[
                          item.class[4],
                          item.name === 'มือซ้าย'
                            ? { red_border: leftHand.isThumbFingger }
                            : { red_border: rightHand.isLittleFingger },
                        ]"
                        @click="
                          item.name === 'มือซ้าย'
                            ? toggleLeft_thumbFinger()
                            : toggleRight_litterFinger()
                        "
                      ></v-btn>
                    </div>
                  </div>
                  <v-row class="mt-1 px-4" justify="center">
                    <v-btn
                        depressed
                        color="#E66E32"
                        block
                        style="color: white; border-radius: 10px;"
                        :disabled="!isUseFingerPrint || isLocalData"
                        @click.stop="dialogScanning = true"
                        class="py-6"
                    >
                        <v-icon size="25" left dark class="tab-hand mr-0">
                            icon-finger_icon
                        </v-icon>
                        <span style="font-size: 18pt;">สแกน</span>
                    </v-btn>
                    <v-dialog
                        v-if="renderScanDialog"
                        v-model="dialogScanning"
                        width="90%"
                        persistent
                        >
                        <form-finger-scan 
                        @SaveScanDialog="saveScanDialog" 
                        @ScaningDialog="closingDialogScanning" 
                        :fingerPrintInfo="fingerPrintInfo"
                        :hand="handSelected"
                        >
                        </form-finger-scan>
                    </v-dialog>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
        <v-card tile class="mt-3" style="background-color: #F5F5F5" v-if="isShowRC">
          <v-card-text class="px-0 pt-2">
            <div class="ai-result-title-box py-1 px-3" style="font-size: 14px;">
              AI Resulted
            </div>
            <div
              class="px-5 pt-3"
              style="display: flex; justify-content: space-between; color: #000000"
            >
              <span class="ai-text">
                TYPE : {{ fingerPrintSelected.ai_type || '-'}}
              </span>
              <span class="ai-text">
                RC 1 : {{ fingerPrintSelected.ai_RC1 }}
              </span>
              <span class="ai-text">
                RC 2 : {{ fingerPrintSelected.ai_RC2 }}
              </span>
            </div>
          </v-card-text>
        </v-card>
        <v-card tile class="mt-3" style="background-color: #CFE0FF" v-if="isShowRC">
          <v-card-text class="px-0 pt-2 pb-2">
            <div class="analyst-result-title-box py-1 px-3" style="font-size: 14px;">
              Analyst Reviewed
            </div>
            <div class="px-3 pt-5" style="display: flex;">
              <div style="width:30%; color: #000000;" class="pt-1">
                <span class="ai-text">TYPE : </span>
              </div>
              <div style="width:30%; height: 40px;">
                <v-select 
                  v-model="form['fingerprint'][handSelected.hand][handSelected.finger].analyst_type"
                  :items="typeList"
                  dense
                  solo
                  outlined
                  style="width: 60px"
                  class="ai-select-h-25"
                  append-icon="icon-arrow-drop-down"
                  :readonly="!isEditRCAndEditLinePoint"
                ></v-select>
              </div>

              <div style="width:30%; color: #000000;" class="pt-1 pl-3">
                <span class="ai-text">RC 1 : </span>
              </div>
              <div style="width:35%;">
                <v-text-field 
                class="ai-text-field-h-25"
                v-model="form['fingerprint'][handSelected.hand][handSelected.finger].analyst_RC1"
                dense 
                solo
                :height="40" 
                outlined
                disabled
                ></v-text-field>
              </div>

              <div style="width:35%; color: #000000" class="pt-1 pl-3">
                <span class="ai-text">RC 2 : </span>
              </div>
              <div style="width:30%;">
                <v-text-field 
                class="ai-text-field-h-25"
                dense 
                solo
                :height="40" 
                outlined
                disabled
                v-model="form['fingerprint'][handSelected.hand][handSelected.finger].analyst_RC2"
                ></v-text-field>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      <!-- col 2  -->
      <div style="width: 43%" class="px-5 py-0">
        <v-row>
          <v-col class="pt-0 px-2" cols="6" md="4">
            <v-card tile class="pa-2 text-center" color="#EEEEEE">
              มุมฝั่งซ้าย
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_2'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_2'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 2', 'angle_2', fingerPrintSelected['angle']['angle_2'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                <div class="pl-1 f-label d-flex">มุมที่ 2
                  <v-avatar 
                    v-if="getLineAndPoint('angle_2')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
              <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_2']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_2']['analyst_RC']"
                            @input="chackMaxAnalystRC('RC1')"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_4'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_4'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 4', 'angle_4', fingerPrintSelected['angle']['angle_4'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                 <div class="pl-1 f-label d-flex">มุมที่ 4
                  <v-avatar 
                    v-if="getLineAndPoint('angle_4')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
              <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_4']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_4']['analyst_RC']"
                            @input="chackMaxAnalystRC('RC1')"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_6'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_6'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 6', 'angle_6', fingerPrintSelected['angle']['angle_6'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                <div class="pl-1 f-label d-flex">มุมที่ 6
                  <v-avatar 
                    v-if="getLineAndPoint('angle_6')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
              <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_6']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_6']['analyst_RC']"
                            @input="chackMaxAnalystRC('RC1')"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col class="pt-0 px-2" tile cols="6" md="4">
            <v-card tile class="pa-2 text-center" color="#EEEEEE">
              กลาง
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_1'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_1'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 1', 'angle_1', fingerPrintSelected['angle']['angle_1'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                <div class="pl-1 f-label d-flex">มุมที่ 1
                  <v-avatar 
                    v-if="getLineAndPoint('angle_1')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
              <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_1']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_1']['analyst_RC']"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col class="pt-0 px-2" cols="6" md="4">
            <v-card tile class="pa-2 text-center" color="#EEEEEE">
              มุมฝั่งขวา
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_3'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_3'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 3', 'angle_3', fingerPrintSelected['angle']['angle_3'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                <div class="pl-1 f-label d-flex">มุมที่ 3
                  <v-avatar 
                    v-if="getLineAndPoint('angle_3')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
               <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_3']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_3']['analyst_RC']"
                            @input="chackMaxAnalystRC('RC2')"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_5'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_5'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 5', 'angle_5', fingerPrintSelected['angle']['angle_5'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                <div class="pl-1 f-label d-flex">มุมที่ 5
                  <v-avatar 
                    v-if="getLineAndPoint('angle_5')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
              <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_5']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_5']['analyst_RC']"
                            @input="chackMaxAnalystRC('RC2')"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
            <v-card tile class="mt-3 text-center" color="#FFFFF">
              <v-card-text class="pt-1 pb-0 px-1 finger-box">
                <div class="pointer" v-if="fingerPrintSelected !== '' && fingerPrintSelected['angle']['angle_7'].image !== ''">
                  <v-img
                    :src="fingerPrintSelected['angle']['angle_7'].image"
                    color="#F5F5F5"
                    :height="140"
                    contain
                    @click="getMoreImage('มุมที่ 7', 'angle_7', fingerPrintSelected['angle']['angle_7'], fingerPrintSelected.hand, fingerPrintSelected.finger)"
                    style="z-index: 1;"
                  >
                  </v-img>
                </div>
                <div
                  v-else
                  class="undisplay-finger-box"
                >
                  <v-icon size="50" color="#AEAEAE">
                    icon-finger_icon
                  </v-icon>
                </div>
                <div class="pl-1 f-label d-flex">มุมที่ 7
                  <v-avatar 
                    v-if="getLineAndPoint('angle_7')"
                    class="ml-3" 
                    color="red" 
                    size="20"
                  >
                    <v-icon dark size="12">icon-pen_icon</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
             <v-card-actions
                v-if="isShowRC"
                style="display: grid; text-align: start"
                color="#FFFF"
                class="pt-0"
              >
                <div class="analyst-review-box">
                    <div class="ai-box">
                      <span style="font-size:.75rem">AI : </span>
                      <span style="font-size:.75rem">
                        {{ fingerPrintSelected !== '' ? fingerPrintSelected['angle']['angle_7']['ai_RC'] : '0' }}
                      </span>
                    </div>
                    <div class="analyst-box">
                        <div style="width: 35%">
                          <span style="font-size:.75rem">RC : </span>
                        </div>
                        <div style="width: 65%; height: 27px">
                          <v-text-field 
                            dense 
                            outlined
                            class="ai-text-field-h-27"
                            v-model="formFingerprint()['angle']['angle_7']['analyst_RC']"
                            @input="chackMaxAnalystRC('RC2')"
                            :readonly="!isEditRCAndEditLinePoint"
                          ></v-text-field>
                        </div>
                    </div>
                </div>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <!-- col 3 -->
      <div style="width: 30%" class="py-0">
        <v-card tile class="text-center" height="400">
          <v-card-text class="height-100 justify-center align-center">
            <div v-if="displayFingerPrintSelected !== '' && displayFingerPrintSelected.angle.image !== ''" class="height-100">
              <v-img
                :src="displayFingerPrintSelected.angle.image"
                color="#F5F5F5"
                contain
                class="height-100 pointer"
                @click="openFingerZoomDialog(displayFingerPrintSelected.angle.image, displayFingerPrintSelected, isEditRCAndEditLinePoint, isShowLineAndPoint)"
              ></v-img>
            </div>
            <div v-else class="height-100">
              <v-icon 
                size="239" 
                color="#AEAEAE" 
                tile class="height-100"
              >icon-finger_icon</v-icon>
            </div>
          </v-card-text>
        </v-card>
        <v-dialog v-if="renderPanZoomDialog" v-model="panZoomDialogStatus" persistent max-width="450">
          <form-finger-pan-zoom
            @PanZoomDialog="closingPanZoomDialog"
            :fingerInfo="fingerInfo"
            @SavePanZoomDialog="savePanZoomDialog"
          ></form-finger-pan-zoom>
        </v-dialog>

        <!-- AI Count Result Image -->
        <div v-if="getStatus === 'AI Resulted' || displayFingerPrintSelected !== ''">
          <v-card tile v-if="displayFingerPrintSelected['angle']['ai_count_image'] !== ''" class="mt-3" color="#EEEEEE">
            <v-card-text class="px-0">
              <div class="ai-result-title-box py-1 px-3" style="font-size: 14px;">
                {{ displayFingerPrintSelected !== '' ? displayFingerPrintSelected['nameAngle'] : '-' }}
              </div>
              <div v-if="displayFingerPrintSelected !== ''" class="mt-5">
                <v-row justify="center">
                  <v-col cols="auto" class="text-center py-0 pr-3">
                    <img
                      :src="displayFingerPrintSelected['angle']['ai_count_image']"
                      color="#F5F5F5"
                      style="cursor: pointer; height: 155px;"
                      @click="openFingerZoomDialog(displayFingerPrintSelected.angle.ai_count_image, displayFingerPrintSelected, false, false)"
                    ><br/>
                    <span style="color: black">AI Count</span>
                  </v-col>
                  <v-col cols="auto" class="text-center py-0 pl-3">
                    <img
                      :src="displayFingerPrintSelected['angle']['ai_enhanced_image']"
                      color="#F5F5F5"
                      style="cursor: pointer; height: 155px;"
                      @click="openFingerZoomDialog(displayFingerPrintSelected.angle.ai_enhanced_image, displayFingerPrintSelected, false, false)"
                    ><br/>
                    <span style="color: black">Enhance</span>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-row>
  </v-card>
</template>

<script>
import FormFingerScan from "../../components/user-list/FormFingerScan";
import FormFingerPanZoom from "../../components/user-list/FormFingerPanZoom";

export default {
  props: ['fingerPrintInfo','save'],
  components: {
    FormFingerScan,
    FormFingerPanZoom
  },
  data() {
    return {
      leftHand: {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      },
      rightHand: {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      },
      tab: null,
      profileImage: null,
      tabhands: [
        {
          name: "มือซ้าย",
          image: require("../../assets/left_hand.png"),
          class: [
            "left-little-finger",
            "left-ring-finger",
            "left-middle-finger",
            "left-index-finger",
            "left-thumb-finger",
          ],
        },
        {
          name: "มือขวา",
          image: require("../../assets/right_hand.png"),
          class: [
            "right-thumb-finger",
            "right-index-finger",
            "right-middle-finger",
            "right-ring-finger",
            "right-little-finger",
          ],
        },
      ],
      fingerPrintSelected: '',
      displayFingerPrintSelected: '',
      dialogScanning: false,
      panZoomDialogStatus: false,
      renderPanZoomDialog: true,
      renderScanDialog: true,
      form: null,
      isEditPage: false,
      typeList: [
        "Wt",
        "Ws",
        "We",
        "Wi",
        "Wc",
        "Wd",
        "Wp",
        "Wl",
        "Wx",
        "U",
        "R",
        "Lf",
        "As",
        "At",
        "Au",
        "Ar",
      ],     
      handSelected: null,
      fingerInfo: null,
      isShowRC: false,
      isEditRCAndEditLinePoint: false,
      isShowLineAndPoint: false,
      isUseFingerPrint: false,
    };
  },
  computed: {
    getStatus () {
      return this.$store.state.status
    },
    userProfile() {
      return this.$store.state.currentUser
    },
    isLocalData () {
      return this.$store.state.isLocalData
    }
  },
  watch: {
    handSelected: {
      deep: true, 
      handler (newValue, oldValue) {
        if (this.isEditPage) {
          this.getDataFingerPrint(newValue)
        }
      }
    },
    save: {
      immediate: true,
      handler(newValue, oldValue) {
        if (newValue) {
            this.$emit('create', this.form)
        } else {
            this.$emit('save', false)
        }
      }
    },
    form: {
      deep: true,
      handler(newValue, oldValue) {
        if (newValue && this.isEditPage) {
          this.checkHasShowRC(newValue.fingerprint)
          this.checkHasEditRC(newValue.fingerprint)
          this.checkShowLineAndPoint(newValue.fingerprint)
        }
      }
    },
    getStatus () {
      this.checkHasShowRC(this.form.fingerprint)
      this.checkHasEditRC(this.form.fingerprint)
      this.checkUseFingerScan()
    },
    async isOnline (val) {
      if (val) {
          await this.$store.dispatch('getUserProfile')  
      }
    },
    isShowRC (val) {
      if (val) {
        this.chackMaxAnalystRC('RC1')
        this.chackMaxAnalystRC('RC2')
      }
    } 
  },
  async created() {
    await this.$store.dispatch('getUserProfile')
    
    if (this.userProfile !== null) {
      this.toggleLeft_thumbFinger()
      if (this.$route.path !== "/add-user") {
        this.isEditPage = true;
        this.form = JSON.parse(JSON.stringify(this.fingerPrintInfo))
        this.checkHasShowRC(this.form.fingerprint)
        this.checkHasEditRC(this.form.fingerprint)
        this.checkShowLineAndPoint(this.form.fingerprint)
      } 
      this.checkUseFingerScan()   
    }
  },
  methods: {
    checkHasShowRC (fingerprint) {
      let ai_rc = this.searchFingerprint(fingerprint, 'ai_rc')
      let analyst_rc = this.searchFingerprint(fingerprint, 'analyst_rc')
      if (ai_rc || analyst_rc) {
        this.isShowRC = true
      } else {
        if (this.userProfile.role === 'Analyst' && this.getStatus  === 'Analyst Reviewed') {
          this.isShowRC = true
        } else {
          this.isShowRC = false
        }
      }
    },
    checkHasEditRC (fingerprint) {
      if (this.userProfile.role === 'Analyst' && this.getStatus !== 'AI-Processing') {
        let ai_rc = this.searchFingerprint(fingerprint, 'ai_rc')
        let analyst_rc = this.searchFingerprint(fingerprint, 'analyst_rc')
        if ((ai_rc || analyst_rc) && !this.isLocalData) {
          this.isEditRCAndEditLinePoint = true
        } else if (this.getStatus === 'Analyst Reviewed' && !this.isLocalData) {
          this.isEditRCAndEditLinePoint = true
        } else {
          this.isEditRCAndEditLinePoint = false
        }
      } else {
        this.isEditRCAndEditLinePoint = false
      }
    },
    checkShowLineAndPoint(fingerprint) {
      if (this.userProfile.role === 'Analyst') {
        if (this.isEditRCAndEditLinePoint) {
          this.isShowLineAndPoint = true
        } else {
          let ai_rc = this.searchFingerprint(fingerprint, 'ai_rc')
          let analyst_rc = this.searchFingerprint(fingerprint, 'analyst_rc')
          let line_point = this.searchFingerprint(fingerprint, 'line_point')
          if (ai_rc || analyst_rc || line_point) {
            this.isShowLineAndPoint = true
          } else {
            this.isShowLineAndPoint = false
          }
        }
      } else {
        this.isShowLineAndPoint = false
      }
    },
    searchFingerprint(fingerprint, type) {
      let status = false
      if (type === 'analyst_rc') {
        for (const hand in fingerprint) {
          if (status) break
          for (const finger in fingerprint[hand]) {
            if (status) break
            for (const angle in fingerprint[hand][finger]['angle']) {
              status = fingerprint[hand][finger]['angle'][angle]['analyst_RC'] !== 0 ? true : false
              if (status) break
            }
          }
        }
      } else if (type === 'ai_rc') {
        for (const hand in fingerprint) {
          if (status) break
          for (const finger in fingerprint[hand]) {
            status = fingerprint[hand][finger]['ai_type'] !== '' ? true : false
            if (status) break
          }
        }
      } else if (type === 'line_point') {
        for (const hand in fingerprint) {
          if (status) break
          for (const finger in fingerprint[hand]) {
            if (status) break
            for (const angle in fingerprint[hand][finger]['angle']) {
              status = fingerprint[hand][finger]['angle'][angle]['line'].length !== 0 || fingerprint[hand][finger]['angle'][angle]['plot_coordinates'].length !== 0 ? true : false
              if (status) break
            }
          }
        }
      }
      return status
    },
    checkUseFingerScan() {
      if (this.userProfile.role === 'Analyst') {
        if (this.getStatus !== 'AI-Processing') {
          this.isUseFingerPrint = true
        } else {
          this.isUseFingerPrint = false
        }
      } else if (this.userProfile.role === 'Collector') {
        if (this.getStatus === 'Created' 
          || this.getStatus === 'Ready to Review' 
          || this.getStatus === 'Approved' 
          || this.getStatus === 'Disapproved'
        ) {
          this.isUseFingerPrint = true
        } else {
          this.isUseFingerPrint = false
        }
      } else {
        this.isUseFingerPrint = false
      }
    },
    closingDialogScanning(statusDialog) {
      this.dialogScanning = statusDialog;
      this.renderScanDialog = false
      this.$emit('imageExisting', true)
      this.$nextTick(() => {
        this.renderScanDialog = true
      })
    },
    getHandSelected(hand, finger) {
      this.handSelected = {
        hand: hand,
        finger: finger
      }
    },
    getDataFingerPrint (hand) {
      let data = this.form.fingerprint
      this.fingerPrintSelected = data[hand.hand][hand.finger]
      this.fingerPrintSelected.hand = hand.hand
      this.fingerPrintSelected.finger = hand.finger
      this.getMoreImage('มุมที่ 1', 'angle_1', this.fingerPrintSelected['angle']['angle_1'], hand.hand, hand.finger)
    },
    getMoreImage (angleName, angleNameEng, angle, hand, finger) {
      this.displayFingerPrintSelected = {
        nameAngle : angleName,
        nameAngleEng : angleNameEng,
        angle: angle,
        hand: hand,
        finger: finger
      }
    },
    formFingerprint () {
      return this.form['fingerprint'][this.handSelected.hand][this.handSelected.finger]
    },
    chackMaxAnalystRC (rc) {
      var list;
      if (rc === 'RC1') {
        list = [
          this.formFingerprint()['angle']['angle_2'].analyst_RC,
          this.formFingerprint()['angle']['angle_4'].analyst_RC,
          this.formFingerprint()['angle']['angle_6'].analyst_RC
        ]
      } else if (rc === 'RC2') {
        list =  [
          this.formFingerprint()['angle']['angle_3'].analyst_RC,
          this.formFingerprint()['angle']['angle_5'].analyst_RC,
          this.formFingerprint()['angle']['angle_7'].analyst_RC
        ]
      }
      var max = list.reduce(function(a, b) {
          return Math.max(parseInt(a), parseInt(b))
      })
      
      if (!isNaN(max)) {
        if (rc === 'RC1') {
          this.formFingerprint()['analyst_RC1'] = max.toString()
        }

        if (rc === 'RC2') {
          this.formFingerprint()['analyst_RC2'] = max.toString()
        }
      }
    },
    toggleLeft_litterFinger() {
      // Left Hand
      this.leftHand = {
        isLittleFingger: true,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      };
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('left', 'pinkie')
    },
    toggleLeft_ringFinger() {
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: true,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      };
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('left', 'ring')
    },
    toggleLeft_middleFinger() {
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: true,
        isIndexFingger: false,
        isThumbFingger: false,
      };
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('left', 'middle')
    },
    toggleLeft_indexFinger() {
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: true,
        isThumbFingger: false,
      };
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('left', 'index')
    },
    toggleLeft_thumbFinger() {
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: true,
      };
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('left', 'thumb')
    },
    toggleRight_thumbFinger() {
      // Right Hand
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: true
      };
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('right', 'thumb')
    },
    toggleRight_indexFinger() {
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: true,
        isThumbFingger: false,
      };
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('right', 'index')
    },
    toggleRight_middleFinger() {
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: true,
        isIndexFingger: false,
        isThumbFingger: false,
      };
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('right', 'middle')
    },
    toggleRight_ringFinger() {
      this.rightHand = {
        isLittleFingger: false,
        isRingFingger: true,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      };
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('right', 'ring')
    },
    toggleRight_litterFinger() {
      this.rightHand = {
        isLittleFingger: true,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      };
      this.leftHand = {
        isLittleFingger: false,
        isRingFingger: false,
        isMiddleFingger: false,
        isIndexFingger: false,
        isThumbFingger: false,
      }
      this.getHandSelected('right', 'pinkie')
    },
    openFingerZoomDialog (image, finger, isEditLineAndPoint, isShowLinePoint) {
      this.fingerInfo = {
        image: image,
        displayFingerPrintSelected: finger,
        isEditLineAndPoint: isEditLineAndPoint,
        isShowLineAndPoint: isShowLinePoint,
      }
      this.panZoomDialogStatus = true
    },
    closingPanZoomDialog(statusDialog) {
      this.panZoomDialogStatus = statusDialog;
      this.renderPanZoomDialog = false
      this.$nextTick(() => {
        this.renderPanZoomDialog = true
      })
    },
    savePanZoomDialog(data) {
      if (this.isEditPage) {
        this.form.fingerprint[data.hand][data.finger].angle[data.nameAngleEng].analyst_RC = data.analyst_RC
        this.form.fingerprint[data.hand][data.finger].angle[data.nameAngleEng].line = Array.from(data.line)
        this.form.fingerprint[data.hand][data.finger].angle[data.nameAngleEng].plot_coordinates = Array.from(data.point)
        this.chackMaxAnalystRC('RC1')
        this.chackMaxAnalystRC('RC2')

        this.$swal({
          title: "บันทึกข้อมูลสำเร็จ",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
          customClass: 'font-prompt'
        })
      }
    },
    async saveScanDialog(data) {
      if (this.isEditPage) {
        this.form.fingerprint = JSON.parse(JSON.stringify(data.fingerprint))
        this.form.latest_modified = JSON.parse(JSON.stringify(data.latest_modified))
        this.fingerPrintInfo.fingerprint = JSON.parse(JSON.stringify(data.fingerprint))
        this.fingerPrintInfo.latest_modified = JSON.parse(JSON.stringify(data.latest_modified))

        this.$nextTick(() => {
          this.getDataFingerPrint({'hand': this.handSelected.hand, 'finger': this.handSelected.finger})
        })

        this.$emit('imageExisting', true)
      } else {
        this.form = null
        this.form = JSON.parse(JSON.stringify(data))

        this.$nextTick(() => {
          this.getDataFingerPrint({'hand': this.handSelected.hand, 'finger': this.handSelected.finger})
        })
      }
    },
    getLineAndPoint (angle) {
      if (this.isEditPage === true && this.form.fingerprint.length !== 0 && this.userProfile.role === 'Analyst') {
        let line = this.form.fingerprint[this.handSelected.hand][this.handSelected.finger].angle[angle].line
        let point = this.form.fingerprint[this.handSelected.hand][this.handSelected.finger].angle[angle].plot_coordinates
        if (line.length !== 0 || point.length !== 0) {
          return true
        } else {
          return false
        }
      }
    }
  }
};
</script>
<style scoped>
@import "../../assets/style/main.css";
@import "../../assets/style/fingerprint-style.css";
</style>
