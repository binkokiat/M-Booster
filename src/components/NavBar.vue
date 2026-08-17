<template>
  <div id="navbar" v-if="isOpenNavBar & (currentUser !== null)">
    <v-navigation-drawer v-if="role !== 'User'" v-model="drawer" app>
      <v-sheet class="pb-3 pt-6" style="text-align: center">
        <v-avatar v-if="isOnline && currentUser.profile_image !== ''" class="mb-4" color="grey darken-1" size="100">
          <img :src="currentUser.profile_image" />
        </v-avatar>
        <v-avatar
          v-else
          color="#AEAEAE"
          size="90"
          class="mb-4"
        >
          <span style="color: #F3F3F3; font-size: 36px;">{{ currentUser.name.substr(0, 1) }}</span>
        </v-avatar>
        <div class="font-12 font-medium">{{ currentUser.name }}</div>
        <div class="font-12 font-medium">
          <v-icon size="15" color="#1DD1A1" class="pr-2">icon-icon-circle</v-icon
          >{{ role === "Analyst" ? "นักวิเคราะห์" : "ผู้เก็บลายนิ้วมือ" }}
        </div>
      </v-sheet>

      <!-- Side Bar -->
      <v-list>
        <template v-for="(menu, m) in menus">
          <v-list-item
            v-if="!menu.sub_menu"
            :key="m"
            link
            class="pl-5 menu"
            active-class="menu-active"
            :class="checkActiveMenu(menu, $route.path) ? 'menu-active' : ''"
            :to="{ path: menu.path }"
            @click="collapseSubItems()"
          >
            <v-list-item-icon>
              <v-icon :class="checkActiveMenu(menu, $route.path) ? 'text-blue' : 'text-black'" :size="menu.icon === 'icon-add-user' ? 23 : 18" v-text="menu.icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="font-10 font-medium" :class="checkActiveMenu(menu, $route.path) ? 'text-blue' : 'text-black'" v-text="menu.text" />
            </v-list-item-content>
          </v-list-item>

          <v-list-group
            v-else-if="role === 'Analyst'"
            :key="m"
            v-model="menu.active"
            no-action
            class="menu-group"
            :class="checkActiveMenu(menu, $route.path) ? 'menu-group-active' : ''"
            :disabled="!isOnline"
            :ripple="isOnline"
          >
            <template v-slot:prependIcon>
              <v-icon
                size="20"
                style="padding-left: 6px;"
                :class="checkActiveMenu(menu, $route.path) ? 'text-blue' : 'text-black'"
                v-text="menu.icon"
              />
            </template>
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title
                  class="font-10 font-medium"
                  :class="
                    checkActiveMenu(menu, $route.path) ? 'text-blue' : 'text-black'
                  "
                  v-text="menu.text"
                ></v-list-item-title>
              </v-list-item-content>
            </template>
            <template v-slot:appendIcon>
              <v-icon
                :class="checkActiveMenu(menu, $route.path) ? 'text-blue' : 'text-black'"
                >icon-arrow-drop-down</v-icon
              >
            </template>

            <v-list-item
              v-for="(child, c) in menu.sub_menu"
              :key="c"
              link
              :to="{ path: child.path }"
              class="sub-menu-group"
              active-class="sub-menu-group-active"
            >
              <v-list-item-content>
                <v-list-item-title class="font-10" :class="child.path === $route.path ? 'text-blue' : 'text-black'" v-html="child.text"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app dark color="#E66E32" :height="50">
      <img
        width="70"
        v-if="role === 'User'"
        src="../assets/logo mind booster.png"
      />
      <v-app-bar-nav-icon v-else @click="drawer = !drawer">
        <v-icon size="25">icon-icon-menu</v-icon>
      </v-app-bar-nav-icon>

      <v-btn v-if="!isDisplayBackToPreviousPage() && currentUser.role !== 'User'" class="ml-2" color="white" small :ripple="false" @click="$router.go(-1)">
        <span style="color: #E66E32">
          <v-icon size="15">icon-icon-chevron-left</v-icon> BACK
        </span>
      </v-btn>

      <v-spacer></v-spacer>
      <!-- Start section sign out -->
      <v-menu
        bottom
        offset-y
        :close-on-content-click="false"
        v-if="currentUser !== null"
      >
        <template v-slot:activator="{ on }">
          <v-avatar v-if="currentUser.profile_image !== ''" v-on="on" size="38" class="pointer">
            <img :src="currentUser.profile_image" />
          </v-avatar>
          <v-avatar
            v-else
            color="#AEAEAE"
            size="38"
            v-on="on"
            class="pointer"
          >
            <span style="color: #F3F3F3;">{{ currentUser.name.substr(0, 1) }}</span>
          </v-avatar>
        </template>
        <!-- Analyst and Collector Role -->
        <v-card
          v-if="role !== 'User'"
          :width="250"
          class="text-center profile-box"
        >
          <div class="pt-3">
            <v-avatar v-if="currentUser.profile_image !== ''" class="mb-4" color="grey darken-1" size="100">
              <img :src="currentUser.profile_image" />
            </v-avatar>
            <v-avatar
              v-else
              color="#AEAEAE"
              size="100"
              class="mb-4"
            >
              <span style="color: #F3F3F3; font-size: 40px;">{{ currentUser.name.substr(0, 1) }}</span>
            </v-avatar>
            <div class="font-12 font-medium">{{ currentUser.name }}</div>
            <div class="font-12 font-medium">
              <v-icon size="17" color="#1DD1A1" class="pr-2">icon-icon-circle</v-icon
              >{{
                currentUser.role === "Analyst"
                  ? "นักวิเคราะห์"
                  : "ผู้เก็บลายนิ้วมือ"
              }}
            </div>
          </div>
          <!-- <v-divider class="ma-3"></v-divider>
          <div>
            <p class="font-12" style="color: #707070">
              <span class="mx-3">
                <v-icon size="20">icon-Group_icon</v-icon>
              </span>
              <span class="font-12">Team list</span>
            </p>
          </div> -->
          <v-divider class="ma-3"></v-divider>
          <div class="py-1 pointer">
            <p class="font-12" style="color: #707070" @click="logout()">
              <span class="mx-3">
                <v-icon size="20">icon-log-out_icon</v-icon>
              </span>
              <span class="font-12">Log out</span>
            </p>
          </div>
        </v-card>
        <!-- User Role -->
        <v-card
          v-if="role === 'User' && currentUser !== null"
          :width="270"
          class="text-center profile-box"
        >
          <div class="pt-3">
            <v-avatar v-if="currentUser.profile_image !== ''" class="mb-4" color="grey darken-1" size="100">
              <v-img :src="currentUser.profile_image" aspect-ratio="1"></v-img>
            </v-avatar>
            <v-avatar v-else class="mb-4" color="#AEAEAE" size="100">
              <span style="color: #F3F3F3">{{ currentUser.name.substr(0, 1) }}</span>
            </v-avatar>
            <div class="font-12 font-bold">{{ currentUser.name }}</div>
            <div class="font-10 font-medium">{{ currentUser.user_id }}</div>
            
          </div>
          <v-divider class="ma-3"></v-divider>
          <div
            v-for="(user, u) in userProfile"
            :key="'u' + u"
            class="ml-3 my-5 pointer"
            @click="setCurrentUser(user)"            
          >
          <div class="d-flex" style="align-items: center;" v-if="currentUser.user_id !== user.user_id">
            <v-avatar size="40" v-if="user.profile_image !== ''">
              <v-img :src="user.profile_image" aspect-ratio="1"></v-img>
            </v-avatar>
            <v-avatar color="#AEAEAE" v-else size="40">
              <span style="color: #F3F3F3">{{ user.name.substr(0, 1) }}</span>
            </v-avatar>
            <div class="font-12 ml-3 text-start">
              <span>
                <div>
                  {{ user.name }}
                </div>
                <div style="font-size: .8rem">
                  {{ user.user_id }}
                </div>
              </span>
            </div>
          </div>            
          </div>
          <v-divider class="ma-3" v-if="userProfile.length !== 1"></v-divider>
          <div class="py-1 pointer">
            <p class="font-12" style="color: #707070" @click="logout()">
              <span class="mx-3">
                <v-icon size="20">icon-log-out_icon</v-icon>
              </span>
              <span class="font-12">Log out</span>
            </p>
          </div>
        </v-card>
      </v-menu>
      <!-- End section sign out -->
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: "NavBar",
  props: ["currentRoute"],
  data() {
    return {
      isOpenNavBar: false,
      drawer: null,
      menus: [
        {
          icon: "icon-person_icon",
          text: "Client",
          path: "/user-list",
          children: [
            "/edit-user",
            "/import-data",
            "/import-report",
            "/user-report",
          ],
        },
        {
          icon: "icon-add-user",
          text: "Add Client",
          path: "/add-user",
          children: [],
        },
        {
          icon: "icon-result_icon",
          text: "Information",
          active: false,
          children: [
            "/information/importInformation",
            "/information/character1-information",
            "/information/character2-information",
            "/information/conceptual-characteristics",
            "/information/recommendation-of-habit",
            "/information/overall-motivation",
            "/information/awareness-channel",
            "/information/potential",
            "/information/activities-by-potential",
          ],
          sub_menu: [
            {
              text: "Import / Export<br>Information",
              path: "/information/importInformation",
            },
            {
              text: "ลักษณะนิสัย 1",
              path: "/information/character1-information",
            },
            {
              text: "ลักษณะนิสัย 2",
              path: "/information/character2-information",
            },
            {
              text: "ลักษณะทางความคิด",
              path: "/information/conceptual-characteristics",
            },
            {
              text: "คำแนะนำตามลักษณะนิสัย",
              path: "/information/recommendation-of-habit",
            },
            {
              text: "แรงจูงใจในภาพรวม",
              path: "/information/overall-motivation",
            },
            {
              text: "ช่องทางการรับข้อมูล",
              path: "/information/awareness-channel",
            },
            {
              text: "กราฟค่าศักยภาพและ<br/>ศักยภาพ 10 ด้าน",
              path: "/information/potential",
            },
            {
              text: "กิจกรรมตามค่าศักยภาพ",
              path: "/information/activities-by-potential",
            },
          ],
        },
      ],
      users: [],
      // currentUser: null,
    };
  },
  computed: {
    pathEditUser() {
      return this.$route.params.clientId;
    },
    userReportId() {
      return this.$route.params.userReportId;
    },
    currentUser () {
      return this.$store.state.currentUser
    },
    userProfile () {
      return this.$store.state.userProfile
    },
    role () {
      return this.$store.state.currentUser.role
    },
    isOnline () {
      return this.$store.state.isOnline
    },
    currentRouteName () {
      return this.$route.path
    }
  },
  watch: {
    currentRoute: {
      immediate: true,
      handler(newValue, oldValue) {
        if (
          !(
            newValue === "SignIn" ||
            newValue === "ForgetPassword" ||
            newValue === "ChangePassword"
          )
        ) {
          this.isOpenNavBar = true;
        } else {
          this.isOpenNavBar = false;
        }
      },
    }
  },
  created() {
    this.checkGroupPath();
  },
  methods: {
    setCurrentUser (user) {
      this.$store.dispatch('storeCurrentUser', user)
    },
    checkActiveMenu(menu, currentPath) {
      if (menu.path === currentPath) {
        return true;
      } else {
        var idx = menu.children.indexOf(currentPath);
        if (idx !== -1) {
          return true;
        } else {
          if (menu.path === "/user-list") {
            if (currentPath === "/edit-user/" + this.pathEditUser) {
              return true;
            } else if (currentPath === "/user/report/" + this.userReportId) {
              return true;
            }
          }
        }
      }
    },
    collapseSubItems() {
      this.menus.map((item) => (item.active = false));
    },
    checkGroupPath() {
      let currentPath = this.$route.path;
      this.menus.forEach((ele) => {
        if (ele.children) {
          if (ele.path) {
            let idx = ele.path.indexOf(currentPath);
            if (idx !== -1) {
              ele.active = true;
            } else {
              let idx = ele.children.indexOf(currentPath);
              if (idx !== -1) {
                ele.active = true;
              }
            }
          } else {
            let idx = ele.children.indexOf(currentPath);
            if (idx !== -1) {
              ele.active = true;
            }
          }
        }
      });
    },
    isDisplayBackToPreviousPage () {
      let hide;
      let currentPath = this.$route.path;

      for (let index = 0; index < this.menus.length; index++) {
        const ele = this.menus[index];
        if (currentPath === ele.path) {
          hide = true
        } else {
          if (ele.children.length !== 0 && ele.text !== 'Client' && ele.text !== 'Add Client') {
            let idx = ele.children.indexOf(currentPath);
            if (idx !== -1) {
              hide = true
            } else {
              hide = false
            }
          }
        }

        if (hide !== undefined) {
          break
        }   
      }
      return hide
    },
    logout() {
      this.$swal({
        title: "<h5>คุณต้องการออกจากระบบหรือไม่ ?</h5>",
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
          this.$store.commit('SET_LOADING', true)
          this.$store.dispatch("logout");
        }
      });
    },
  },
};
</script>
<style scoped>
.v-menu__content {
  top: 50px !important;
}
.text-blue {
  color: #0062ab !important
}
.text-grey {
  color: #707070 !important;
}
.text-black {
  color: #000000 !important;
}
</style>
