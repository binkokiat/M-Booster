import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '*',
      redirect: '/sign-in'
    },
    {
      path: '/sign-in',
      name: 'SignIn',
      component: () => import('../views/authentication/SignIn.vue'),
    },
    {
      path: '/sign-in/:email',
      name: 'SignIn',
      props: true,
      component: () => import('../views/authentication/SignIn.vue'),
    },
    {
      path: '/forget-password',
      name: 'ForgetPassword',
      component: () => import('../views/authentication/ForgetPassword.vue'),
    },
    {
      path: '/change-password/:email/:recoveryCode',
      name: 'ChangePassword',
      props: true,
      component: () => import('../views/authentication/ChangePassword.vue'),
    },
    {
      path: '/user-list',
      name: 'UserList',
      component: () => import('../views/user-list/UserList.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/add-user',
      name: 'AddUser',
      component: () => import('../views/user-list/AddUser.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/edit-user/:clientId',
      name: 'EditUser',
      component: () => import('../views/user-list/EditUser.vue'),
      props: true,
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/user/report/:userReportId',
      name: 'UserReport',
      component: () => import('../views/user-list/Report.vue'),
      props: true,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/import-data',
      name: 'ImportData',
      component: () => import('../views/import-data/ImportData.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/import-report',
      name: 'ImportReport',
      component: () => import('../views/import-report/ImportReport.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/importInformation',
      name: 'ImportInformation',
      component: () => import('../views/information/ImportInformation.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/character1-information',
      name: 'Character1Information',
      component: () => import('../views/information/Character1Information.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/character2-information',
      name: 'Character2Information',
      component: () => import('../views/information/Character2Information.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/conceptual-characteristics',
      name: 'ConceptualCharacteristics',
      component: () => import('../views/information/ConceptualCharacteristics.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/recommendation-of-habit',
      name: 'RecommendationOfHabit',
      component: () => import('../views/information/RecommendationOfHabit.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/overall-motivation',
      name: 'OverallMotivation',
      component: () => import('../views/information/OverallMotivation.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/awareness-channel',
      name: 'AwarenessChannel',
      component: () => import('../views/information/AwarenessChannel.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/potential',
      name: 'Potential',
      component: () => import('../views/information/Potential.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
    {
      path: '/information/activities-by-potential',
      name: 'ActivitiesByPotential',
      component: () => import('../views/information/ActivitiesByPotential.vue'),
      meta: {
        requiresAuthAdmin: true
      }
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  let currentUser = JSON.parse(window.localStorage.getItem('current_user'))
  
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  let requiresAuthAdmin = to.matched.some(record => record.meta.requiresAuthAdmin)
  
  if ((requiresAuth || requiresAuthAdmin) && currentUser === null ) {
    next('SignIn')
  } else if ((requiresAuth || requiresAuthAdmin)) {
    if (currentUser !== null) {
      switch (currentUser.role) {
        case 'Analyst':
            next()
          break;
        case 'Collector':
            next()
          break;
        case 'User':
            if (requiresAuth) {
              next()
            } else {
              next('/')
            }
          break;
        default:
          next('SignIn')
          break;
      }
    }
  } {
    next()
  }
})

export default router
