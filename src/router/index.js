import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
/**
 * Note: sub-menu only appear when route children.length >= 1
 *
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
import {i18n } from "@/assets/languages/i18n"
export const constantRoutes = [
  {
    path: '/clientmodel',
    name: 'client-model',
    component: () => import('@/views/ClientModel/ClientModel.vue')
  },
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: i18n.t('routerTitle.dashboard'), icon: 'dashboard', affix: true }
    }]
  },
  {
    path: '/bbb',
    component: Layout,
    hidden: true,
    redirect: '/bbb/password',
    children: [{
      path: 'password',
      name: 'Password',
      component: () => import('@/views/ChangePassword/index'),
      meta: { title: i18n.t('routerTitle.changeWord'), icon: 'dashboard', affix: true }
    }]
  },
  // 代理商管理
  {
    path: '/agents',
    component: Layout,
    redirect: '/agents/index',
    name: 'Agents',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.agents'), icon: 'agents', roles: ['admin-test']  },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Agents/index'),
        name: 'AgentsIndex',
        meta: { title: i18n.t('routerTitle.agentsIndex'), icon: 'list', affix: true}
      },
      {
        path: 'model',
        component: () => import('@/views/Agents/AgentModel.vue'),
        name: 'AgentsModel',
        meta: { title: i18n.t('routerTitle.agentsModel'), icon: 'tree', affix: true }
      },
      {
        path: 'search',
        component: () => import('@/views/Agents/AgentSearch.vue'),
        name: 'AgentsSearch',
        meta: { title: i18n.t('routerTitle.agentsSearch'), icon: 'search', affix: true }
      },
      // {
      //   path: 'upaccount',
      //   component: () => import('@/views/Agents/AgentsUpAccount.vue'),
      //   name: 'AgentsAccount',
      //   meta: { title: '应付货款', icon: 'clipboard', affix: true }
      // },
      // 对账
      {
        path: 'downaccount',
        component: () => import('@/views/Agents/AgentsDownAccount.vue'),
        name: 'AgentsAccount',
        meta: { title: i18n.t('routerTitle.agentsAccount'), icon: 'clipboard', affix: true }
      },
      {
        path: 'searchOrders',
        component: () => import('@/views/Agents/AgentSearchOrders.vue'),
        name: 'AgentsOrders',
        hidden: true,
        meta: { title: i18n.t('routerTitle.agentsOrders'), icon: 'dashboard', affix: true }
      },
      {
        path: 'addAgent',
        component: () => import('@/views/Agents/AddAgent.vue'),
        name: 'AgentsAdd',
        meta: { title: i18n.t('routerTitle.agentsAdd'), icon: 'dashboard', affix: true },
        hidden: true
      },
      {
        path: 'addModel',
        component: () => import('@/views/Agents/AddModel.vue'),
        name: 'AgentsModelAdd',
        meta: { title: i18n.t('routerTitle.agentsSetModel'), icon: 'dashboard', affix: true },
        hidden: true
      }
    ]
  },
  // 医生管理
  {
    path: '/doctors',
    component: Layout,
    redirect: '/doctors/index',
    name: 'Doctors',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.doctors'), icon: 'doctor' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Doctors/index'),
        name: 'DoctorsIndex',
        meta: { title: i18n.t('routerTitle.doctorsIndex'), icon: 'list', affix: true }
      },
      {
        path: 'addDoctor',
        component: () => import('@/views/Doctors/AddDoctor.vue'),
        name: 'DoctorsAdd',
        meta: { title: i18n.t('routerTitle.doctorsAdd'), icon: 'dashboard', affix: true },
        hidden: true
      },
      {
        path: 'order',
        component: () => import('@/views/Doctors/DoctorOrder.vue'),
        name: 'DoctorsOrder',
        meta: { title: i18n.t('routerTitle.doctorsOrders'), icon: 'search', affix: true }
      },
      // 对账
      {
        path: 'accountList',
        component: () => import('@/views/Doctors/DoctorsAccountList.vue'),
        name: 'DoctorsAccountList',
        meta: { title: i18n.t('routerTitle.doctorsAccount'), icon: 'clipboard', affix: true }
      },
      {
        path: 'account',
        component: () => import('@/views/Doctors/DoctorsAccount.vue'),
        name: 'DoctorsAccount',
        meta: { title: i18n.t('routerTitle.doctorsAccountList'), icon: 'clipboard', affix: true },
        hidden: true
      },
      {
        path: 'searchOrders',
        component: () => import('@/views/Doctors/DoctorSearchOrders.vue'),
        name: 'DoctorsOrderSearch',
        hidden: true,
        meta: { title: i18n.t('routerTitle.doctorsOrderSearch'), icon: 'dashboard', affix: true }
      }
    ]
  },
  // 病人管理
  {
    path: '/zzz',
    component: Layout,
    redirect: '/patient',
    children: [
      {
        path: 'patient',
        name: 'Patient',
        component: () => import('@/views/Patient/index'),
        meta: { title: i18n.t('routerTitle.patient'), icon: 'people', affix: true }
      },
      {
        path: 'searchOrders',
        component: () => import('@/views/Patient/PatientSearchOrders.vue'),
        name: 'PatientOrderSearch',
        hidden: true,
        meta: { title: i18n.t('routerTitle.patientSearchOrders'), icon: 'dashboard', affix: true }
      }
    ]
  },
  // 商品中心
  {
    path: '/goods',
    component: Layout,
    redirect: '/goods/index',
    name: 'Goods',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.goods'), icon: 'shopping' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Goods/index'),
        name: 'GoodsIndex',
        meta: { title: i18n.t('routerTitle.goodsIndex'), icon: 'list', affix: true }
      },
      {
        path: 'category',
        component: () => import('@/views/Goods/GoodsCategory.vue'),
        name: 'GoodsCategory',
        meta: { title: i18n.t('routerTitle.goodsCategory'), icon: 'nested', affix: true }
      },
      {
        path: 'addcategory',
        component: () => import('@/views/Goods/AddCategory.vue'),
        hidden: true,
        name: 'add-category',
        meta: { title: i18n.t('routerTitle.goodsAddCategory'), icon: 'dashboard', affix: true }
      },
      {
        path: 'newgood',
        component: () => import('@/views/Goods/NewGood.vue'),
        hidden: true,
        name: 'new-good',
        meta: { title: i18n.t('routerTitle.goodsAdd'), icon: 'dashboard', affix: true }
      },
      {
        path: 'addgoods',
        component: () => import('@/views/Goods/AddGoods.vue'),
        name: 'GoodsAdd',
        meta: { title: i18n.t('routerTitle.goodsSet'), icon: 'edit  ', affix: true }
      },
      {
        path: 'goodpriced',
        component: () => import('@/views/Goods/GoodPriced.vue'),
        hidden: true,
        name: 'GoodsPriced',
        meta: { title: i18n.t('routerTitle.goodsPrice'), icon: 'money', affix: true }
      }
    ]
  },
  // 订单管理
  {
    path: '/orders',
    component: Layout,
    redirect: '/orders/index',
    name: 'Orders',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.orders'), icon: 'documentation' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Orders/index'),
        name: 'OrdersIndex',
        meta: { title: i18n.t('routerTitle.ordersIndex'), icon: 'list', affix: true }
      },
      {
        path: 'orderDetail',
        component: () => import('@/views/Orders/OrderDetail.vue'),
        hidden: true,
        name: 'OrdersDetail',
        meta: { title: i18n.t('routerTitle.ordersDetail'), icon: 'dashboard', affix: true }
      },
      {
        path: 'model',
        component: () => import('@/views/Orders/Model.vue'),
        hidden: true,
        name: 'Model',
        meta: { title: i18n.t('routerTitle.model'), icon: 'dashboard', affix: true}
      },
      {
        path: 'feed',
        component: () => import('@/views/Orders/ModelFeed.vue'),
        hidden: true,
        name: 'ModelFeed',
        meta: { title: i18n.t('modelFeed'), icon: 'dashboard', affix: true}
      }
    ]
  },
  // 工单管理
  {
    path: '/works',
    component: Layout,
    redirect: '/works/index',
    name: 'Works',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.works'), icon: 'edit' },
    children: [
      {
        path: 'index',
        component: () => import('@/views/Work/index'),
        name: 'WorksIndex',
        meta: { title: i18n.t('routerTitle.worksIndex'), icon: 'list', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  // 体检机构
  {
    path: '/mec',
    component: Layout,
    redirect: '/medicalcenter',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.medicalCenter'), icon: 'example'},
    children: [
      {
        path: 'medicalcenter',
        name: 'medicalCenter',
        component: () => import('@/views/Medical/index.vue'),
        meta: { title: i18n.t('routerTitle.medicalList'), icon: 'list', affix: true}
      },
      {
        path: 'addmedical',
        name: 'add-medical',
        component: () => import('@/views/Medical/addMedical.vue'),
        meta: { title: i18n.t('routerTitle.addMedical'), icon: 'component', affix: true},
        hidden: true
      },
      {
        path: 'medicalorders',
        name: 'medicalOrders',
        component: () => import('@/views/Medical/MedicalOrders.vue'),
        meta: { title: i18n.t('routerTitle.medicalOrders'), icon: 'component', affix: true}
      },
      {
        path: 'medicalfeed',
        name: 'medicalFeed',
        component: () => import('@/views/Medical/MedicalFeed.vue'),
        meta: { title: i18n.t('routerTitle.medicalFeed'), icon: 'component', affix: true},
        hidden: true
      },
      {
        path: 'medicalmodel',
        name: 'medicalModel',
        component: () => import ('@/views/Medical/MedicalModel.vue'),
        meta: { title: i18n.t('routerTitle.medicalModel'), icon: 'component', affix: true},
        hidden: true
      }
    ]
  },
  // 客户端管理
  // {
  //   path: '/aaa',
  //   component: Layout,
  //   redirect: '/client',
  //   alwaysShow: true,
  //   meta: { title: i18n.t('routerTitle.client'), icon: 'component' },
  //   children: [
  //     {
  //       path: 'client',
  //       name: 'Client',
  //       component: () => import('@/views/Client/index'),
  //       hidden: true,
  //       meta: { title: i18n.t('routerTitle.clientIndex'), icon: 'list', affix: true }
  //     },
  //     // 支付渠道
  //     {
  //       path: 'application',
  //       component: () => import('@/views/Applications/index'),
  //       name: 'Applications-index',
  //       meta: { title: i18n.t('routerTitle.application'), icon: 'nested', affix: true }
  //     },
  //     // 添加支付渠道
  //     {
  //       path: 'addChannel',
  //       component: () => import('@/views/Applications/AddChannel.vue'),
  //       name: 'Add-channel',
  //       meta: { title: i18n.t('routerTitle.addChannel'), icon: 'nested', affix: true},
  //       hidden: true
  //     },
  //     {
  //       path: 'appdetail',
  //       component: () => import('@/views/Applications/AppDetail.vue'),
  //       name: 'Applications-detail',
  //       hidden: true,
  //       meta: { title: i18n.t('routerTitle.appDetail'), icon: 'dashboard', affix: true }
  //     },
  //     {
  //       path: 'addclient',
  //       name: 'Add-client',
  //       component: () => import('@/views/Client/AddClient.vue'),
  //       hidden: true,
  //       meta: { title: i18n.t('routerTitle.clientAdd'), icon: 'dashboard', affix: true }
  //     }
  //   ]
  // },
  // 管理配置
  {
    path: '/manage',
    component: Layout,
    redirect: '/manage/index',
    name: 'Manage',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.manage'), icon: 'peoples', affix: true },
    children: [
      // {
      //   path: 'permission',
      //   component: () => import('@/views/Manage/Permission.vue'),
      //   name: 'Manage-permission',
      //   meta: { title: '权限列表', icon: 'list', affix: true }
      // },
      {
        path: 'roles',
        component: () => import('@/views/Manage/Roles.vue'),
        name: 'ManageRoles',
        meta: { title: i18n.t('routerTitle.manageRole'), icon: 'user', affix: true }
      },
      {
        path: 'index',
        component: () => import('@/views/Manage/index'),
        name: 'ManageIndex',
        meta: { title: i18n.t('routerTitle.manageIndex'), icon: 'peoples', affix: true }
      },
      {
        path: 'addmanager',
        component: () => import('@/views/Manage/AddManager.vue'),
        name: 'AddManage',
        hidden: true,
        meta: { title: i18n.t('routerTitle.manageAdd'), icon: 'dashboard', affix: true }
      },
      {
        path: 'addrole',
        component: () => import('@/views/Manage/AddRole.vue'),
        name: 'AddRole',
        hidden: true,
        meta: { title: i18n.t('routerTitle.manageRoleAdd'), icon: 'dashboard', affix: true }
      }
      // 日志
      // {
      //   path: 'log',
      //   component: () => import('@/views/Manage/Log.vue'),
      //   name: 'ManageLog',
      //   meta: { title: i18n.t('routerTitle.manageLog'), icon: 'dashboard', affix: true }
      // }
    ]
  },
  // 字典
  {
    path: '/dictionary',
    component: Layout,
    redirect: '/dictionary/hospital',
    name: 'Dictionary',
    alwaysShow: true,
    meta: { title: i18n.t('routerTitle.dictionary'), icon: 'dic', affix: true },
    children: [
      {
        path: 'hospital',
        name: 'DictionaryHospital',
        component: () => import('@/views/Dictionary/Hospital.vue'),
        meta: { title: i18n.t('routerTitle.dictionaryHospital'), icon: 'list', affix: true }
      },
      {
        path: 'area',
        name: 'DictionaryArea',
        component: () => import('@/views/Dictionary/Area.vue'),
        meta: { title: i18n.t('routerTitle.dictionaryArea'), icon: 'international', affix: true }
      }
    ]
  },
  // 消息中心
  {
    path: '/message',
    component: Layout,
    redirect: '/message/index',
    name: 'Message',
    alwaysShow: true,
    meta: { title: '消息中心', icon: 'message', affix: true},
    children: [
      {
        path: 'index',
        name: 'MessageIndex',
        component: () => import('@/views/Message/index.vue'),
        meta: { title: i18n.t('routerTitle.message'), icon: 'education', affix: true }
      },
      {
        path: 'addMessage',
        name: 'MessageAdd',
        component: () => import('@/views/Message/AddMessage.vue'),
        meta: { title: i18n.t('routerTitle.addMessage'), icon: 'education', affix: true },
        hidden: true
      },
      {
        path: 'template',
        name: 'MessageTemplate',
        component: () => import('@/views/Message/MessageTemplate.vue'),
        meta: { title: i18n.t('routerTitle.messageTemplate'), icon: 'theme', affix: true}
      },
      {
        path: 'addTemplate',
        name: 'MessageAddTemplate',
        component: () => import('@/views/Message/AddTemplate.vue'),
        meta: { title: i18n.t('routerTitle.addTemplate'), icon: 'theme', affix: true},
        hidden: true
      },
      {
        path: 'messageSend',
        name: 'MessageSend',
        component: () => import('@/views/Message/MessageSend.vue'),
        meta: { title: i18n.t('routerTitle.sendMessage'), icon: 'theme', affix: true},
        hidden: true
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
