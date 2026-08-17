<template>
  <v-card style="background: #F5F5F5;">
    <v-card-title class="card-title">
      <div class="text-center" style="width: 100%">
        <label>ZOOM</label>
        <v-icon
          color="white"
          size="20"
          style="position: absolute; right: 15px; top: 13px;"
          @click="exitDialog()"
        > icon-icon-close </v-icon>
      </div>
    </v-card-title>
    <v-card-text class="py-0 px-3">
      <v-container class="py-0">
        <v-row>
          <v-col>
            <v-card tile class="text-center">
              <div v-if="fingerInfo !== ''">
                <div ref="panzoom">
                  <canvas
                    ref = "canRef"
                    :height="canvasHeight"
                    :width="canvasWidth"
                    @mousedown="beginDrawing($event)"
                    @mouseup="stopDrawing($event)"
                    :style="{
                      'background-image': `url(${fingerInfo.image})`,
                      'background-size': 'contain',
                      'background-position': 'center'
                    }"
                  ></canvas>
                </div>
                <div v-if="isDrawingPoint && fingerInfo.isEditLineAndPoint" style="position: absolute; top: 5px; right: 5px;">
                  <v-tooltip top :disabled="point_coordinates.length === 0 || pointIndex === point_coordinates.length ? true : false">
                    <template v-slot:activator="{ on,attrs }">
                      <v-btn
                        fab
                        x-small
                        ripple
                        :disabled="point_coordinates.length === 0 || pointIndex === point_coordinates.length ? true : false"
                        @click="pointIndex = pointIndex+1"
                        color="#FBFBFB"
                        style="border-radius: 2px; opacity: 0.97;"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon size="16">icon-undo_icon</v-icon>
                      </v-btn>
                    </template>
                    <span>Undo</span>
                  </v-tooltip>
                  <v-tooltip top :disabled="point_coordinates.length === 0 || pointIndex <= 0 ? true : false">
                    <template v-slot:activator="{ on,attrs }">
                      <v-btn
                        fab
                        x-small
                        ripple
                        :disabled="point_coordinates.length === 0 || pointIndex <= 0 ? true : false"
                        @click="pointIndex = pointIndex-1"
                        color="#FBFBFB"
                        class="ml-1"
                        style="border-radius: 2px; opacity: 0.97;"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon size="16">icon-redo_icon</v-icon>
                      </v-btn>
                    </template>
                    <span>Redo</span>
                  </v-tooltip>
                </div>
                <div v-if="fingerInfo.isEditLineAndPoint" style="position: absolute; top: 5px; left: 5px;">
                  <v-tooltip top :disabled="isClearLineAndPoint">
                    <template v-slot:activator="{ on,attrs }">
                      <v-btn
                        fab
                        x-small
                        :disabled="isClearLineAndPoint"
                        @click="clearLineAndPoint()"
                        color="#FBFBFB"
                        class="ml-1"
                        style="border-radius: 2px; opacity: 0.97;"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>icon-clear_icon</v-icon>
                      </v-btn>
                    </template>
                    <span>Clear</span>
                  </v-tooltip>
                </div>
              </div>
              <v-icon 
                v-else
                size="239" 
                color="#AEAEAE" 
                tile class="height-100"
              > icon-finger_icon </v-icon>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="3" class="pr-1 pt-0">
            <v-btn
              v-if="fingerInfo.isEditLineAndPoint"
              block
              color="#E66E32"
              v-bind:class="{ 'white--text': !isOutlineOnLineBtn }"
              style="font-size: 10px;"
              elevation="0"
              small
              :outlined="isOutlineOnLineBtn"
              :disabled="isDisableOnLineBtn"
              @click="lineButtonClick()"
            >
              <v-icon left x-small>icon-Stroke_icon</v-icon> Line
            </v-btn>
          </v-col>
          <v-col cols="3" class="pl-1 pt-0">
            <v-btn
              v-if="fingerInfo.isEditLineAndPoint"
              block
              color="#FFC312"
              v-bind:class="{ 'white--text': !isOutlineOnPointBtn }"
              style="font-size: 10px;"
              elevation="0"
              small
              :outlined="isOutlineOnPointBtn"
              :disabled="isDisableOnPointBtn"
              @click="pointButtonClick()"
            >
              <v-icon left x-small>icon-Point_icon</v-icon> Point
            </v-btn>
          </v-col>
          <v-col cols="6" class="d-flex font-weight-bold pt-1 pb-1">
            <span>Zoom</span>
            <v-slider
              v-model="zoomRange"
              color="#466BB2"
              :step="stepZoom"
              :min="minScale"
              :max="maxScale"
              :disabled="!isLockPanZoom ? false : this.fingerInfo !== '' ? true : false"
              class="slider-zoom"
            ></v-slider>
          </v-col>
        </v-row>
        <v-row v-if="fingerInfo.isEditLineAndPoint">
          <v-col class="pt-0">
            <v-card>
              <v-card-text class="px-0 pt-3 pb-2">
                <v-col class="zoom-result-title-box py-1 px-3" style="font-size: 16px;">
                  <span>
                    {{ fingerInfo.displayFingerPrintSelected !== '' ? fingerInfo.displayFingerPrintSelected['nameAngle'] : '-' }}
                  </span>
                </v-col>
                <v-col class="d-inline font-weight-medium" style="padding-left: 28px;">
                  <span style="color: black;">
                    AI : <span class="pl-2">{{fingerInfo.displayFingerPrintSelected.angle.ai_RC}}</span>
                  </span>
                </v-col>
                <v-col class="d-inline font-weight-medium" style="padding-left: 30px;">
                  <span style="color: black" class="mt-2">
                    RC :
                  </span>
                </v-col>
                <v-col class="d-inline pl-0">
                  <div style="width: 25%; display: inline-flex;">
                    <v-text-field
                      v-model="analyst_RC"
                      solo
                      outlined                
                      :height="25"
                      class="analyst-input"
                      @change="isChangeData = true"
                    ></v-text-field>
                  </div>
                </v-col>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn
                  color="white"
                  text
                  small
                  style="background:#74B9FF; font-weight: normal; font-size: 13px;"
                  class="px-10"
                  @click="saveDialog()"
                > บันทึก </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
import Panzoom from '@panzoom/panzoom'

export default {
  props: ['fingerInfo'],
  data() {
    return {
      canvas: null,
      ctx: null,
      canvasHeight: 385,
      canvasWidth: 385,
      panzoomEle: null,
      panzoomParent: null,
      zoomRange: 1,
      maxScale: 4,
      minScale: 0.4,
      stepZoom: 0.1,
      isLockPanZoom: false,
      line_coordinate: [],
      point_coordinates: [],
      analyst_RC: 0,
      pointIndex: 0,
      isDrawingLine: false,
      isDrawingPoint: false,
      isOutlineOnLineBtn: false,
      isDisableOnLineBtn: false,
      isOutlineOnPointBtn: false,
      isDisableOnPointBtn: false,
      isClearLineAndPoint: true,
      isChangeData: false
    }
  },
  watch: {
    zoomRange (val) {
      this.panzoomEle.zoom(val)
    },
    isLockPanZoom (val) {
      this.lockPanZoom(val)
    },
    pointIndex (val) {
      this.clearCanvasAndMarkingPoint()
      this.drawCircle(this.line_coordinate[0].start.point_x, this.line_coordinate[0].start.point_y, 3, 'rgb(255, 0, 0)')
      this.drawLine(this.line_coordinate[0])
      this.drawCircle(this.line_coordinate[0].end.point_x, this.line_coordinate[0].end.point_y, 3, 'rgb(255, 0, 0)')
      for (let i = val; i < this.point_coordinates.length; i++) {
        this.drawCircle(this.point_coordinates[i].point_x, this.point_coordinates[i].point_y, 2, 'rgb(255, 255, 0)')
      }
      this.isChangeData = true
    },
    async isOnline (val) {
      if (val) {
          await this.$store.dispatch('getUserProfile')  
      }
    }
  },
  mounted() {
    this.selectCanvasElem()
    this.selectPanZoomElement()
    setTimeout(() => {
      this.selectFingerInfo()
    }, 0)
  },
  methods: {
    selectCanvasElem() {
      if ((this.fingerInfo.isEditLineAndPoint || this.fingerInfo.isShowLineAndPoint) && this.fingerInfo !== '') {
        this.canvas = this.$refs.canRef
        this.ctx = this.canvas.getContext('2d')
        let image = new Image()
        image.src = this.fingerInfo.image
        image.onload = () => {
          let scale = this.canvasHeight / image.height
          let newHeight = this.canvasHeight
          let newWidth = image.width * scale
          if (newWidth > this.canvasWidth) {
            scale = this.canvasWidth / image.width
            newWidth = this.canvasWidth
            newHeight = image.height * scale
          }
          this.canvasHeight = newHeight
          this.canvasWidth = newWidth
        }
      }
    },
    selectPanZoomElement() {
      if (this.fingerInfo !== '') {
        const elem = this.$refs.panzoom
        this.panzoomEle = Panzoom(elem, {
          maxScale: this.maxScale,
          minScale: this.minScale,
          canvas: true
        })
        this.panzoomParent = this.$refs.panzoom.parentElement
        this.panzoomParent.addEventListener('wheel', (event) => {
          if (event.deltaY > 0) {
            if (this.zoomRange !== this.minScale && !this.isLockPanZoom) {
              this.zoomRange -= (this.stepZoom * (event.deltaY/100))
              this.panzoomEle.zoomWithWheel(event)
            }
          } else {
            if (this.zoomRange !== this.maxScale && !this.isLockPanZoom) {
              this.zoomRange += (this.stepZoom * ((event.deltaY * -1)/100))
              this.panzoomEle.zoomWithWheel(event)
            }
          }
        })
      }
    },
    selectFingerInfo() {
      if ((this.fingerInfo.isEditLineAndPoint || this.fingerInfo.isShowLineAndPoint) && this.fingerInfo !== '') {
        if (this.fingerInfo.displayFingerPrintSelected.angle.line.length !== 0) {
          this.line_coordinate = Array.from(this.fingerInfo.displayFingerPrintSelected.angle.line)
          this.drawCircle(this.line_coordinate[0].start.point_x, this.line_coordinate[0].start.point_y, 3, 'rgb(255, 0, 0)', false)
          this.drawLine(this.line_coordinate[0], false)
          this.drawCircle(this.line_coordinate[0].end.point_x, this.line_coordinate[0].end.point_y, 3, 'rgb(255, 0, 0)', false)
        }
        if (this.fingerInfo.displayFingerPrintSelected.angle.plot_coordinates.length !== 0) {
          this.point_coordinates = Array.from(this.fingerInfo.displayFingerPrintSelected.angle.plot_coordinates)
          if (this.point_coordinates.length > 0) {
            for (let i = this.pointIndex; i < this.point_coordinates.length; i++) {
              this.drawCircle(this.point_coordinates[i].point_x, this.point_coordinates[i].point_y, 2, 'rgb(255, 255, 0)', false)
            }
          }
        }
        if (this.fingerInfo.displayFingerPrintSelected.angle.analyst_RC !== null || this.fingerInfo.displayFingerPrintSelected.angle.analyst_RC !== "") {
          this.analyst_RC = this.fingerInfo.displayFingerPrintSelected.angle.analyst_RC
        }
      }
    },
    lockPanZoom(status) {
      this.panzoomEle.setOptions({
        disablePan: status,
        disableZoom: status,
        cursor: status ? 'cell' : 'move',
        exclude: status ? [this.$refs.canRef] : []
      })
    },
    beginDrawing(e) {
      if (this.isDrawingLine && this.isLockPanZoom) {
        if (this.line_coordinate !== null) {
          this.line_coordinate = [{
            start: {
              point_x: e.offsetX,
              point_y: e.offsetY
            },
            end: {
              point_x: "",
              point_y: ""
            }
          }]
        } else {
          this.line_coordinate[0].start.point_x = e.offsetX
          this.line_coordinate[0].start.point_y = e.offsetY
        }
        this.clearCanvasAndMarkingPoint()
        this.drawCircle(e.offsetX, e.offsetY, 3, 'rgb(255, 0, 0)')
      } else if (this.isDrawingPoint && this.isLockPanZoom) {
        this.drawCircle(e.offsetX, e.offsetY, 2, 'rgb(255, 255, 0)')
        if (this.pointIndex !== 0) {
          this.point_coordinates.splice(0, this.pointIndex)
          this.pointIndex = 0
        }
        this.point_coordinates.unshift({ point_x: e.offsetX, point_y: e.offsetY })
      }
    },
    stopDrawing(e) {
      if (this.isDrawingLine && this.isLockPanZoom) {
        if (this.line_coordinate[0].start.point_x === e.offsetX && this.line_coordinate[0].start.point_y === e.offsetY) {
          this.clearCanvasAndMarkingPoint()
          this.line_coordinate = []
        } else {
          this.drawCircle(e.offsetX, e.offsetY, 3, 'rgb(255, 0, 0)')
          this.line_coordinate[0].end.point_x = e.offsetX
          this.line_coordinate[0].end.point_y = e.offsetY
          this.drawLine(this.line_coordinate[0])
        }
      }
      this.isChangeData = true
    },
    async drawLine(line, created = true) {
      this.ctx.beginPath()
      this.ctx.moveTo(line.start.point_x, line.start.point_y)
      this.ctx.lineTo(line.end.point_x, line.end.point_y)
      this.ctx.strokeStyle = "rgba(255, 0, 0, 0.4)"
      this.ctx.lineWidth = 3
      this.ctx.lineCap = 'round';
      this.ctx.stroke()
      this.ctx.closePath()
      this.isClearLineAndPoint = false
      if (created) {
        this.isChangeData = true
      }
    },
    drawCircle(x, y, radius, color, created = true) {
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI)
      this.ctx.fillStyle = color
      this.ctx.fill()
      this.ctx.closePath()
      this.isClearLineAndPoint = false
      if (created) {
        this.isChangeData = true
      }
    },
    async clearCanvasAndMarkingPoint() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      if (this.point_coordinates.length > 0) {
        for (let i = this.pointIndex; i < this.point_coordinates.length; i++) {
          this.drawCircle(this.point_coordinates[i].point_x, this.point_coordinates[i].point_y, 2, 'rgb(255, 255, 0)')
        }
      }
    },
    lineButtonClick() {
      this.isLockPanZoom = !this.isLockPanZoom
      this.isOutlineOnLineBtn = !this.isOutlineOnLineBtn
      this.isDisableOnLineBtn = false
      this.isDisableOnPointBtn = !this.isDisableOnPointBtn
      this.isDrawingLine = !this.isDrawingLine
      this.isDrawingPoint = false
    },
    pointButtonClick() {
      this.isLockPanZoom = !this.isLockPanZoom
      this.isOutlineOnPointBtn = !this.isOutlineOnPointBtn
      this.isDisableOnPointBtn = false
      this.isDisableOnLineBtn = !this.isDisableOnLineBtn
      this.isDrawingPoint = !this.isDrawingPoint
      this.isDrawingLine = false
    },
    clearLineAndPoint() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.isClearLineAndPoint = true
      this.line_coordinate = []
      this.point_coordinates = []
      this.isChangeData = true
    },
    exitDialog() {
      if (this.fingerInfo.isEditLineAndPoint && this.isChangeData) {
        this.$swal({
          html: "<h3>ข้อมูลยังไม่ถูกบันทึก ต้องการออกหรือไม่ ?</h3>",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#74B9FF",
          cancelButtonColor: "#EC0927",
          cancelButtonText: "&emsp;&emsp;ยกเลิก&emsp;&emsp;",
          confirmButtonText: "&emsp;&emsp;ยืนยัน&emsp;&emsp;",
          reverseButtons: true,
          customClass: 'font-prompt'
        }).then((result) => {
          if (result.isConfirmed) {
            this.$emit('PanZoomDialog', false)
          }
        })
      } else {
        this.$emit('PanZoomDialog', false)
      }
    },
    saveDialog() {
      if (this.fingerInfo.isEditLineAndPoint) {
        if (this.pointIndex !== 0) {
          this.point_coordinates.splice(0, this.pointIndex)
          this.pointIndex = 0
        }
        let data = {}
        data.hand = this.fingerInfo.displayFingerPrintSelected.hand
        data.finger = this.fingerInfo.displayFingerPrintSelected.finger
        data.nameAngleEng = this.fingerInfo.displayFingerPrintSelected.nameAngleEng
        data.line = this.line_coordinate
        data.point = this.point_coordinates
        data.analyst_RC = this.analyst_RC
        this.$emit('PanZoomDialog', false)
        this.$emit('SavePanZoomDialog', data)
      }
    }
  },
}
</script>

<style lang="css" scope>
@import '../../assets/style/main.css';
.card-title {
  background:#466BB2;
  color:white;
  padding: 8px 0 6px !important;
}
.zoom-result-title-box {
  width: 110px;
  color: white;
  background-color: #466BB2 !important;
  border: 1px solid #466BB2 !important;
  border-radius: 0px 19px 19px 0px !important;
  opacity: 1 !important;
  background-color:#F5F5F5;  
  height: 35px;
  display: inline-flex !important;
  justify-content: center !important;
  align-items: center !important;
}

/* Text Field */
.analyst-input.v-text-field .v-input__control {
  min-height: 25px !important;
  max-height: 25px !important;
}
.analyst-input.v-text-field .v-input__control .v-input__slot {
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
  box-shadow: none !important;
}
.analyst-input.v-text-field .v-input__control .v-text-field__details {
  display: none !important;
}

/* Slider Zoom */
.slider-zoom .v-slider__thumb {
  height: 15px;
  width: 15px;
  left: -7px;
  cursor: pointer;
}
.slider-zoom .v-slider__thumb::before {
  height: 30px;
  width: 30px;
  left: -7.5px;
  top: -8px;
}
.slider-zoom .v-slider--horizontal .v-slider__track-container {
  height: 8px;
}
.slider-zoom .v-slider--horizontal .v-slider__track-container .v-slider__track-fill {
  border-radius: 50px 0 0 50px;
}
.slider-zoom .v-slider--horizontal .v-slider__track-container .v-slider__track-background {
  border-radius: 0 50px 50px 0;
  background-color: #cccccc !important;
}
.slider-zoom .v-input__control .v-input__slot {
  top: -5px;
  margin: 0
}
.slider-zoom .v-input__control .v-messages {
  display: none !important;
}
</style>