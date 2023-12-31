import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken, setToken } from '@/utils/auth' // get token from cookie
import { ROLES } from '@/utils/status.js'
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

// 拦截所有路由跳转
router.beforeEach(async(to, from, next) => {
  // 判断路径是否是小程序请求的路径
  if (to.query.token) {
    setToken(to.query.token)
    next()
    return
  }
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // 从Cookie获取token
  const hasToken = getToken()
  // 判断token是否存在
  if (hasToken) {
    // token存在，判断路由是否登录页面
    if (to.path === '/login') {
      // 如果是登录页面,直接跳转到首页
      next({ path: '/' })
      NProgress.done()
    } else {
      // 如果不是登录页面，拉取用户的角色表
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      // console.log('有token 路径不是login 判断roles')
      // console.log(hasRoles)
      // 判断是否有角色表
      if (hasRoles) {
        // 有角色表直接跳转
        next()
      } else {
        // 没有存储角色表
        try {
          // console.log('有token 路径不是login 没有roles 发送getInfo请求获取登录用户信息')
          // 通过Vuex发送异步请求获取用户信息getInfo
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          // 获取用户信息中的角色表
          let { roles } = await store.dispatch('user/getInfo')
          roles = typeof roles === 'undefined' || roles == null ? [ {name: ROLES.admin}] : roles
          // generate accessible routes map based on roles
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
