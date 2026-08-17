import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router/index'
import axios from 'axios'
import { apiUrl } from '../utils/url'
import { Promise } from 'core-js'
import { storage  } from '../utils/firebase'
import uuid from 'uuid'
import dayjs from 'dayjs'

const STORAGE_REF = storage.ref()
const DB_NAME = 'mindbooster';
const DB_VERSION = 1;

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userProfile: [],
    currentUser: null,
    status: 'Created',
    loading: false,
    userInfo: null,
    isSaveUserInfo: false,
    isSaveFingerPrintInfo: false,
    uuid: uuid.v4(),
    saveFromAddUserPage: false,
    isOnline: window.navigator.onLine,
    isLocalData: false
  },
  mutations: {
    SET_USERS_DATA (state, payload) {
      if (payload.length !== 0) {
        payload.forEach(user => {
          let fIdx = state.userProfile.findIndex(item => {
            return item.user_id === user.user_id
          })
          if (fIdx !== -1) {
            state.userProfile[fIdx] = user
          } else {
            state.userProfile.push(user)
          }
        })
      } else {
        state.userProfile = []
      }
    },
    SET_CURRENT_USER (state, payload) {
      state.currentUser = payload
    },
    setStatus (state, status) {
      state.status = status
    },
    SET_LOADING (state, payload) {
      state.loading = payload
    },
    SET_HAS_IMAGE (state, payload) {
      state.hasImage = payload
    },
    SET_SAVE_FROM_ADD_USER_PAGE (state, payload) {
      state.saveFromAddUserPage = payload
    },
    SET_IS_SAVE_USER_INFO (state, payload) {
      state.isSaveUserInfo = payload
    },
    SET_USER_INFO (state, payload) {
      state.userInfo = payload
    },
    SET_IS_SAVE_FINGERPRINT (state, payload) {
      state.isSaveFingerPrintInfo = payload
    },
    SET_IS_ONLINE (state, payload) {
      state.isOnline = payload
    },
    SET_IS_LOCAL_DATA (state, payload) {
      state.isLocalData = payload
    }
  },
  actions: {
    checkInternet({commit}) {
      let isOnline = window.navigator.onLine
      commit('SET_IS_ONLINE' , isOnline)
    },
    async getUserProfile ({state , commit, dispatch}) {
      // Rest API get user profile
      let users = JSON.parse(window.localStorage.getItem("users"))
      if (users.length !== 0) {
        let result = []
        if (state.isOnline) {
          for (const user of users) {
            let config = { params: {check_sum: user.check_sum }}
            try { 
              const userResponse = await axios.get(apiUrl + "/auth/" + user.user_id , config)
              result.push(userResponse.data.result)
            } catch (error) {
              let errorMessage = error.response.data.message_error
              if (errorMessage === 'Access token expired') {
               await dispatch('refreshToken')
               dispatch('getUserProfile')
              } else {
                dispatch('logout')
              }
            }
          }
        } else {
          result = JSON.parse(JSON.stringify(users))
        }
        commit('SET_USERS_DATA' , result)
        await dispatch('getCurrentUser')
      }
    },
    getCurrentUser({state, commit}) {
      let cuurent_user = JSON.parse(window.localStorage.getItem("current_user"))
      let currentUser = state.userProfile.find(item => {
        if(cuurent_user.user_id === item.user_id) return true 
      })
      commit('SET_CURRENT_USER', currentUser)
    },
    storeUsersToLocalStorage({dispatch}, payload) {
      let users = []
      for (let idx = 0; idx < payload.length; idx++) {
        delete payload[idx].access_token
        delete payload[idx].refresh_token
        users.push(payload[idx])
      }
      window.localStorage.setItem('users', JSON.stringify(users))
      dispatch('storeCurrentUser', payload[0])
    },
    storeCurrentUser({commit}, payload) {
      commit('SET_CURRENT_USER', payload)
      let res = Object.assign({}, payload) 

      delete res.access_token
      delete res.refresh_token

      window.localStorage.setItem('current_user', JSON.stringify(res))
    },
    async checkImageExisting({dispatch}, payload) {
      var hasImage;
      for (const user of payload) {
        var fingerprint = await dispatch('getFingerPrint', user)
        var resultList = await dispatch('checkImage', fingerprint)
        resultList.includes(true)
        if (!resultList.includes(true)) {
          hasImage = false
          break
        } else {
          hasImage= true
        }
      }
      return hasImage
    },
    async getFingerPrint ({state, dispatch}, user_id) {
        let header = { 'access_token': state.currentUser.access_token }
        return axios.get(apiUrl + "/users/"+user_id+"/fingerprint", { headers: header })
            .then((response) => {
                if (response.data.status === 'success') {
                    return response.data.result
                }
            })
            .catch( async (error) => {
              let errorMessage = error.response.data.message_error
              if (errorMessage === 'Access token expired') {
               await dispatch('refreshToken')
               dispatch('getFingerPrint', user_id)
              } else {
                dispatch('logout')
              }
            })
    },
    checkImage ({}, payload) {
      return new Promise(function(resolve, reject) {
        var hasImage = false
        var resultList = []
        var hands = ['left', 'right']
        for (let hIdx = 0; hIdx < hands.length; hIdx++) {
          if (hasImage) {
            break
          }
          var hand = hands[hIdx]
          var fingers = ['thumb', 'index', 'middle', 'ring', 'pinkie']
          for (let fIdx = 0; fIdx < fingers.length; fIdx++) {
            if (hasImage) {
              break
            }
            var finger = fingers[fIdx]
            for (let aIdx = 1; aIdx <= 7; aIdx++) {
              var angle_ = 'angle_'+aIdx
              var existingImage = payload['fingerprint'][hand][finger]['angle'][angle_]['image']
              
              if (existingImage !== '') {
                hasImage = true
                resultList.push(true)
                break
              } else {
                resultList.push(false)
              }
            }
          }
        }
        resolve(resultList)
       })      
    },
    async createUserInfo ({ state, dispatch }, payload) {
      let header = { 'access_token': state.currentUser.access_token }
      return axios
      .post(apiUrl + "/users", payload, { headers: header })
      .then((response) => {
        let data = response.data
        if (data.status == "success") {
          return data.result.user_info
        }
      })
      .catch((error) => {
        let errorMessage = error.response.data.message_error
        return errorMessage
      })
    },
    async updateFingerprint ({ state, dispatch }, payload) {
      let header = { 'access_token': state.currentUser.access_token }
      return axios
          .put(apiUrl + "/users/"+payload.user_id+'/fingerprint', payload.fingerprint, { headers: header })
          .then((response) => {
              let data = response.data
              if (data.status === 'success') {
                  return data.status
              }
          })
          .catch( async (error) => {
            let errorMessage = error.response.data.message_error
            if (errorMessage === 'Access token expired') {
             await dispatch('refreshToken')
             dispatch('updateFingerprint', payload)
            } else {
              dispatch('logout')
            }
          })
      },
      async uploadProfileImageToStorage({ state }, profileImage) {
        // let self = this
        return new Promise(function(resolve, reject) {
          var storagePath = 'users/profile-image'
          var imageName = state.uuid+'.jpg'
          let imageRef = STORAGE_REF.child(storagePath).child(imageName)
          let uploadTask = imageRef.putString(profileImage, 'data_url', { contentType: 'image/jpeg' })

          uploadTask.on('state_changed',
            (snapshot) => {
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // console.log('Upload is ' + progress + '% done')
            },
            function error(err) {
              reject()
            },
            function complete() {
              uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                resolve(downloadURL)
              })
            }
          )
        })
      },
      async uploadInformationImageToStorage({}, data) {
        return new Promise(function(resolve, reject) {
          var storagePath = data.mode === 'icon' ? 'image-information/icon' : 'image-information/image'
          var imageName = `${data.mb_code}-${data.mode}${data.mode === 'icon' ? '.png' : '.jpg'}`
          let imageRef = STORAGE_REF.child(storagePath).child(imageName)
          let uploadTask = imageRef.putString(data.file, 'data_url', { contentType: data.mode === 'icon' ? 'image/png' : 'image/jpeg' })

          uploadTask.on('state_changed',
            (snapshot) => {
              var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              // console.log('Upload is ' + progress + '% done')
            },
            function error(err) {
              reject()
            },
            function complete() {
              uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                resolve(downloadURL)
              })
            }
          )
        })
      },
      async refreshToken ({state, commit, dispatch }) {
        try {
          // Refersh token just current user
          let data = { 
            check_sum: state.currentUser.check_sum,
            refresh_token: state.currentUser.refresh_token 
          }
          
          let res = await axios.post(apiUrl + "/auth/token", data) 

          let user = []
          user.push(res.data.result)

          commit('SET_USERS_DATA' , user)
          commit('SET_CURRENT_USER', res.data.result)
        } catch (error) {
          dispatch('logout')
        }
      },
      deleteIconFromStorage ({}, payload) {
        let mbCodes = payload.split(',')
        for (const mbCode of mbCodes) {
          let path = `/image-information/icon/${mbCode}-icon.png`

          let deleteRef = STORAGE_REF.child(path)

          // Delete the file
          deleteRef.delete().then(() => {
            // File deleted successfully
          }).catch((error) => {
            // Uh-oh, an error occurred!
          })
        }
      },
      deleteImageFromStorage ({}, payload) {
        let mbCodes = payload.split(',')
        for (const mbCode of mbCodes) {
          let path = `/image-information/image/${mbCode}-image.jpg`
          let deleteRef = STORAGE_REF.child(path)

          // Delete the file
          deleteRef.delete().then(() => {
            // File deleted successfully
          }).catch((error) => {
            // Uh-oh, an error occurred!
          })
        }
      },
      logout ({ commit }) {
        let user = JSON.parse(window.localStorage.getItem("current_user"))
        axios
        .post(apiUrl + "/auth/logout", { check_sum: user.check_sum })
        .then((response) => {
          let data = response.data
          if (data.status == "success") {
            window.localStorage.removeItem('users')
            window.localStorage.removeItem('current_user')
            location.reload()
            router.replace('/')
          }
        })
        .catch((error) => {
          window.localStorage.removeItem('users')
          window.localStorage.removeItem('current_user')
          location.reload()
          router.replace('/')
        })
      },
      async getLocalDB({}) {
        return new Promise((resolve, reject) => {

          let request = window.indexedDB.open(DB_NAME, DB_VERSION);
          
          request.onerror = e => {
            console.log('Error opening db', e);
            reject('Error');
          };
    
          request.onsuccess = e => {
            resolve(e.target.result);
          };
          
          request.onupgradeneeded = e => {
            let db = e.target.result;
            if (!db.objectStoreNames.contains('tb_users')) {
              db.createObjectStore("tb_users", { autoIncrement: true, keyPath:'id' })
            }
            if (!db.objectStoreNames.contains('tb_fingerprints')) {
              db.createObjectStore("tb_fingerprints", { autoIncrement: true, keyPath:'id' })
            }
            if (!db.objectStoreNames.contains('tb_officer')) {
              db.createObjectStore("tb_officer", { autoIncrement: true, keyPath:'id' })
            }
          }
        });
      },
      async getOfficerFromLocalDB({dispatch}, payload) {
        return new Promise( async (resolve, reject) => {
            let localDB = await dispatch('getLocalDB')
            let trans = localDB.transaction(['tb_officer'],'readonly')
            trans.oncomplete = e => {
                resolve(user);
            };
            
            let store = trans.objectStore('tb_officer');
            let request = store.get(payload)
            let user = null
            
            request.onerror = function(e) {
                console.log("Error", e.target.error.name);
            }
            request.onsuccess = function(e) {
                user = e.target.result;
            }
        })
      },
      async getUserFromLocalDB({dispatch}, payload) {
        return new Promise( async (resolve, reject) => {

            let localDB = await dispatch('getLocalDB')
            let trans = localDB.transaction(['tb_users'],'readonly')
            trans.oncomplete = e => {
                resolve(user);
            };
            
            let store = trans.objectStore('tb_users');
            let request = store.get(payload)
            let user = null
            
            request.onerror = function(e) {
                console.log("Error", e.target.error.name);
            }
            request.onsuccess = function(e) {
                user = e.target.result;
            }
        })
    },
    async getFingerprintFromLocalDB({dispatch}, payload) {
        return new Promise( async (resolve, reject) => {

            let localDB = await dispatch('getLocalDB')
            let trans = localDB.transaction(['tb_fingerprints'],'readonly')
            trans.oncomplete = e => {
                resolve(fingerprint);
            };
            
            let store = trans.objectStore('tb_fingerprints');
            let request = store.get(payload)
            let fingerprint = null
            
            request.onerror = function(e) {
                console.log("Error", e.target.error.name);
            }
            request.onsuccess = function(e) {
                fingerprint = e.target.result;
            }
        })
    },
    async updateFingerprintTolocalDB ({ dispatch }, payload) {
      return new Promise(async (resolve, reject) => {

        let localDB = await dispatch('getLocalDB')
        let trans = localDB.transaction(['tb_fingerprints'],'readwrite')
        trans.oncomplete = e => {
            resolve(payload)
        }

        let store = trans.objectStore('tb_fingerprints')
            store.put(payload)
        })
    },
    async updateUserInfoTolocalDB ({ dispatch }, payload) {
      return new Promise(async (resolve, reject) => {

        let localDB = await dispatch('getLocalDB')
        let trans = localDB.transaction(['tb_users'],'readwrite')
        trans.oncomplete = e => {
            resolve(payload)
        }

        let store = trans.objectStore('tb_users')
            store.put(payload)
        })
    },
    async removeUserInOfficerStore ({state, dispatch}, payload) {
      return new Promise(async (resolve, reject) => {
        let officer = await dispatch('getOfficerFromLocalDB', state.currentUser.user_id)

        let localDB = await dispatch('getLocalDB')
        let trans = localDB.transaction(['tb_officer'],'readwrite')

        trans.oncomplete = e => {
          resolve()
        }

        let data = {
            id: state.currentUser.user_id,
            clients: []
        }

        if (officer !== undefined) {
          if (officer.clients.length !== 0) {
            data.clients = Array.from(officer.clients)
          }
          let idx = data.clients.indexOf(payload)
          if (idx !== -1) {
            data.clients.splice(idx, 1)
          } 

          let store = trans.objectStore('tb_officer')
            store.put(data)
        } 
       })
    },
    removeUserInLocalDB ({ dispatch }, payload) {
      return new Promise(async (resolve, reject) => {

        let localDB = await dispatch('getLocalDB')
        let trans = localDB.transaction(['tb_users'],'readwrite')
        trans.oncomplete = e => {
            resolve()
        }

        let request = trans.objectStore('tb_users')
            request.delete(payload)
        })
    },
    removeFingerprintInLocalDB ({ dispatch }, payload) {
      return new Promise(async (resolve, reject) => {

        let localDB = await dispatch('getLocalDB')
        let trans = localDB.transaction(['tb_fingerprints'],'readwrite')
        trans.oncomplete = e => {
            resolve()
        }

        let request = trans.objectStore('tb_fingerprints')
            request.delete(payload)
        })
    }
  },
  modules: {
  }
})
