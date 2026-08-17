<template>
  <v-card style="background: #f5f5f5">
    <v-card-title class="card-title">
      <div class="text-center" style="width: 100%">
        <label>
          {{
            dialogMode === "create" ? "Create Information" : "Edit Information"
          }}</label
        >
        <v-icon
          color="white"
          style="position: absolute; right: 15px; top: 11px"
          @click="exitDialog()"
          size="20"
        >
          icon-icon-close
        </v-icon>
      </div>
    </v-card-title>
    <v-card-text class="py-0 px-3" style="background-color: white">
      <v-container class="py-0 pl-6 pr-2">
        <v-form ref="form" lazy-validation>
          <div class="dialog-scroll pr-4">
            <v-row>
              <v-col cols="12" class="pb-0">
                <span class="black--text font-medium">MB Code</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-text-field
                  v-model="characterData.mb_code"
                  placeholder="Enter MB Code"
                  outlined
                  :filled="dialogMode === 'edit' ? true : false"
                  :disabled="dialogMode === 'edit' ? true : false"
                  :rules="rules.text"
                  hide-details="auto"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.age_range">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Age range</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-select
                  v-model="characterData.age_range"
                  :items="templateData.age_range"
                  placeholder="Select Age range"
                  append-icon="icon-arrow-drop-down"
                  outlined
                  solo
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Group</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-text-field
                  v-if="templateData.group.length === 1"
                  v-model="characterData.group"
                  placeholder="Enter Group"
                  filled
                  outlined
                  hide-details="auto"
                  disabled
                ></v-text-field>
                <v-select
                  v-else
                  v-model="characterData.group"
                  :items="templateData.group"
                  placeholder="Select Group"
                  append-icon="icon-arrow-drop-down"
                  outlined
                  solo
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.header">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Header</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-text-field
                  v-model="characterData.header"
                  placeholder="Enter Header"
                  outlined
                  solo
                  hide-details="auto"
                  :rules="rules.text"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.sub_header">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Sub Header</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-text-field
                  v-model="characterData.sub_header"
                  placeholder="Enter Sub Header"
                  outlined
                  solo
                  hide-details="auto"
                  :rules="rules.text"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.information">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Information</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-textarea
                  v-model="characterData.information"
                  placeholder="Enter someting.."
                  outlined
                  solo
                  hide-details="auto"
                  :rules="rules.text"
                ></v-textarea>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.video">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Video link</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-text-field
                  v-model="characterData.video"
                  placeholder="Enter Video link"
                  outlined
                  solo
                  hide-details="auto"
                  :rules="rules.text"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.icon">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Icon</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-file-input
                  ref="icon"
                  placeholder="Choose a file.."
                  hide-details="auto"
                  accept="image/png, image/jpeg"
                  truncate-length="50"
                  show-size
                  outlined
                  solo
                  @change="onIconSelected"
                  :prepend-icon="null"
                  :rules="rules.icon"
                >
                  <template v-slot:append-outer>
                    <v-btn
                      elevation="0"
                      class="btn-file-input"
                      @click="handleImageButtonClick('icon')"
                    >
                      Browse
                    </v-btn>
                  </template>
                </v-file-input>
              </v-col>
              <v-col cols="12" class="pt-1" v-show="iconUpload">
                <v-img
                  v-if="iconUpload"
                  :src="iconUpload"
                  contain
                  height="120"
                ></v-img>
              </v-col>
            </v-row>
            <v-row v-if="templateData.open.image">
              <v-col cols="12" class="pb-0 pt-1">
                <span class="black--text font-medium">Image</span>
              </v-col>
              <v-col cols="12" class="pt-1">
                <v-file-input
                  ref="image"
                  placeholder="Choose a file.."
                  hide-details="auto"
                  accept="image/png, image/jpeg"
                  truncate-length="50"
                  show-size
                  outlined
                  solo
                  @change="onImageSelected"
                  :prepend-icon="null"
                  :rules="rules.image"
                >
                  <template v-slot:append-outer>
                    <v-btn
                      elevation="0"
                      class="btn-file-input"
                      @click="handleImageButtonClick('image')"
                    >
                      Browse
                    </v-btn>
                  </template>
                </v-file-input>
              </v-col>
              <v-col cols="12" class="pt-1" v-show="imageUpload">
                <v-img
                  v-if="imageUpload"
                  :src="imageUpload"
                  contain
                  height="200"
                ></v-img>
              </v-col>
            </v-row>
          </div>
          <v-row>
            <v-col cols="12" class="text-center mb-3">
              <v-btn
                color="#74b9ff"
                dark
                height="40"
                elevation="0"
                class="save-button"
                @click="submit"
              >
                Save
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: ["templateData", "dialogMode", "dataInfo"],
  data() {
    return {
      rules: {
        text: [(value) => !!value || "กรุณากรอกข้อมูล"],
        icon: [
          (value) =>
            this.checkFileInputRule(value, "icon") || "กรุณาเลือกข้อมูล",
        ],
        image: [
          (value) =>
            this.checkFileInputRule(value, "image") || "กรุณาเลือกข้อมูล",
        ],
      },
      characterData: {
        mb_code: "",
        age_range: "0",
        group: "",
        header: "",
        sub_header: "",
        information: "",
        video: "",
        icon: "",
        image: "",
      },
      iconUpload: null,
      imageUpload: null,
      isIconUpload: false,
      isImageUpload: false,
    };
  },
  created() {
    this.setInformations();
  },
  methods: {
    setLoading(val) {
      this.$store.commit("SET_LOADING", val);
    },
    setInformations() {
      if (this.dialogMode === "create") {
        this.characterData.age_range = this.templateData.open.age_range
          ? this.templateData.age_range[0]
          : "";
        this.characterData.group = this.templateData.group[0];
      } else if (this.dialogMode === "edit") {
        let data = JSON.parse(JSON.stringify(this.dataInfo))
        for (const key in data) {
          this.characterData[key] = data[key];
        }
        this.characterData.icon = this.characterData.icon || "";
        this.characterData.image = this.characterData.image || "";
        this.iconUpload = this.characterData.icon || null;
        this.imageUpload = this.characterData.image || null;
      }
    },
    handleImageButtonClick(mode) {
      if (mode === "icon") {
        this.$refs.icon.$refs.input.click();
      } else {
        this.$refs.image.$refs.input.click();
      }
    },
    onIconSelected(file) {
      this.iconUpload = null;
      if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          this.iconUpload = e.target.result;
          this.isIconUpload = true;
        };
      } else {
        this.isIconUpload = false;
      }
    },
    onImageSelected(file) {
      this.imageUpload = null;
      if (file) {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
          this.imageUpload = e.target.result;
          this.isImageUpload = true;
        };
      } else {
        this.isImageUpload = false;
      }
    },
    async submit() {
      if (this.$refs.form.validate()) {
        this.saveInformation(this.characterData);
      }
    },
    async saveInformation(data) {
      this.setLoading(true);
      if (this.dialogMode === "create") {
        let createData = {
          mb_code: data.mb_code.trim(),
          age_range: data.age_range.trim(),
          group: data.group.trim(),
          header: data.header.trim(),
          sub_header: data.sub_header.trim(),
          information: data.information.trim(),
          video: data.video.trim(),
          icon: data.icon ? data.icon.trim() : "",
          image: data.image ? data.image.trim() : "",
        };
        createData.icon = this.isIconUpload
          ? this.iconUpload
            ? await this.$store.dispatch("uploadInformationImageToStorage", {
                file: this.iconUpload,
                mode: "icon",
                mb_code: createData.mb_code,
              })
            : createData.icon
          : createData.icon;
        createData.image = this.isImageUpload
          ? this.imageUpload
            ? await this.$store.dispatch("uploadInformationImageToStorage", {
                file: this.imageUpload,
                mode: "image",
                mb_code: createData.mb_code,
              })
            : createData.image
          : createData.image;
        for (const key in this.templateData.open) {
          if (!this.templateData.open[key]) {
            delete createData[key];
          }
        }
        await this.$emit("CreateCharacterDialog", createData);
        this.$emit("CharacterDialog", false);
      } else if (this.dialogMode === "edit") {
        let editData = {
          mb_code: data.mb_code.trim(),
          age_range: data.age_range.trim(),
          group: data.group.trim(),
          header: data.header.trim(),
          sub_header: data.sub_header.trim(),
          information: data.information.trim(),
          video: data.video.trim(),
          icon: data.icon ? data.icon.trim() : "",
          image: data.image ? data.image.trim() : "",
        };
        editData.icon = this.isIconUpload
          ? this.iconUpload
            ? await this.$store.dispatch("uploadInformationImageToStorage", {
                file: this.iconUpload,
                mode: "icon",
                mb_code: editData.mb_code,
              })
            : editData.icon
          : editData.icon;
        editData.image = this.isImageUpload
          ? this.imageUpload
            ? await this.$store.dispatch("uploadInformationImageToStorage", {
                file: this.imageUpload,
                mode: "image",
                mb_code: editData.mb_code,
              })
            : editData.image
          : editData.image;
        for (const key in this.templateData.open) {
          if (!this.templateData.open[key]) {
            delete editData[key];
          }
        }
        editData.latest_modified = this.dataInfo.latest_modified
        await this.$emit("EditCharacterDialog", editData);
        this.$emit("CharacterDialog", false);
      }
    },
    checkFileInputRule(value, mode) {
      if (mode === "icon") {
        if (value) {
          return true;
        } else if (this.iconUpload) {
          return true;
        }
      } else {
        if (value) {
          return true;
        } else if (this.imageUpload) {
          return true;
        }
      }
      return false;
    },
    exitDialog() {
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
          this.$emit("CharacterDialog", false);
        }
      });
    },
  },
};
</script>

<style lang="css" scope>
@import "../../assets/style/main.css";
.card-title {
  background: #466bb2;
  color: white;
  padding: 8px 0 6px !important;
}
/* Text Field */
.v-text-field .v-input__control {
  min-height: 32px !important;
  max-height: auto !important;
}
.v-text-field .v-input__control .v-input__slot {
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
  box-shadow: none !important;
}
.v-text-field .v-input__control .v-text-field__details {
  margin-bottom: 0 !important;
}
.v-text-field .v-input__control .v-text-field__slot input {
  min-height: 32px !important;
  max-height: 32px !important;
  font-size: 14px !important;
}

/* Select */
.v-select .v-input__control {
  min-height: 32px !important;
  max-height: 32px !important;
}
.v-select .v-input__control .v-input__slot {
  min-height: 32px !important;
  max-height: 32px !important;
}
.v-select .v-input__control .v-select__slot {
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
  box-shadow: none !important;
}
.v-select .v-input__control .v-select__slot input {
  min-height: 32px !important;
  max-height: 32px !important;
}
.v-select .v-input__control .v-select__slot .v-select__selection {
  color: #707070 !important;
  font-size: 14px !important;
}
.v-select .v-input__control .v-select__slot .v-input__append-inner {
  margin-top: 2px !important;
}
.v-select .v-input__control .v-select__slot .v-input__append-inner i {
  font-size: 24px !important;
}

/* File Input */
.v-file-input .v-input__control {
  min-height: 32px !important;
  max-height: auto !important;
}
.v-file-input .v-input__append-outer {
  margin: 0 !important;
  height: 31px !important;
  position: absolute !important;
  top: 1px !important;
  right: 1.5px !important;
}
.v-file-input .v-input__control .v-input__slot {
  min-height: auto !important;
  display: flex !important;
  align-items: center !important;
  box-shadow: none !important;
}
.v-file-input .v-input__control .v-text-field__details {
  margin-bottom: 0 !important;
}
.v-file-input .v-input__control .v-text-field__slot input {
  min-height: 32px !important;
  max-height: 32px !important;
  font-size: 14px !important;
}

.btn-file-input {
  height: 100% !important;
  border-radius: 0px 5px 5px 0px !important;
  border-left: thin solid #b9b9b9 !important;
  color: #6e7982 !important;
}
.v-textarea {
  font-size: 14px !important;
}
.v-textarea textarea {
  margin-top: 0 !important;
}

.save-button {
  font-size: 20px !important;
  font-weight: 400 !important;
  padding-left: 120px !important;
  padding-right: 120px !important;
}

.dialog-scroll {
  min-height: 490px;
  max-height: 490px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>