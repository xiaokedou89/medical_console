import { i18n } from '@/assets/languages/i18n'
// 默认拉取数据及列表显示size个数
export let size = 5
export let network = {
  baseUrl: 'http://192.168.1.104:8888',
  // baseURL: '/api/',
  baseURL: process.env.VUE_APP_BASE_API,
  fileUploadURL: '/backend/file/upload/',
  // 图片和视频的上传限制大小
  staticMaxSize: 500 * 1024 * 1024,
  // 静态资源超时设定
  staticTimeout: 2 * 60 * 1000,
  // 获取资源文件拼接路径
  getFile(type) {
    return `/backend/file/${type}/?filename=`
  },
  getFiles(type) {
    return `backend/file/${type}/?filename=`
  },
  // 静态上传资源拼接路径
  uploadFileURL(type) {
    return `/api/backend/file/upload/${type}`
  }
}
// 路由匹配角色
export const ROLES = {
  admin: 'admin',
  normal: 'normal'
}

// 支付渠道状态选择数组
export const channelStatusArr = [
  {
    value: 0,
    label: i18n.t('close')
  },
  {
    value: 1,
    label: i18n.t('open')
  }
]
export const adviceStatusArr = [
  {
    value: -1,
    label: i18n.t('global.all')
  },
  {
    value: 0,
    label: i18n.t('global.unSet')
  },
  {
    value: 1,
    label: i18n.t('global.seted')
  }
]
// 订单状态筛选框数组
export const orderStatusArr = [
  {
    value: -1,
    label: i18n.t('global.allOrder')
  },
  {
    value: 10,
    label: i18n.t('global.invalidOrder')
  },
  {
    value: 20,
    label: i18n.t('global.payingOrder')
  },
  {
    value: 30,
    label: i18n.t('global.makingOrder')
  },
  {
    value: 40,
    label: i18n.t('global.finishedOrder')
  },
  {
    value: 50,
    label: i18n.t('global.refundedOrder')
  },
  {
    value: 60,
    label: i18n.t('global.closedOrder')
  }
]

export const orderStatusSelectArr = [
  {
    value: -1,
    label: i18n.t('global.allOrder')
  },
  {
    value: 10,
    label: i18n.t('global.invalidOrder')
  },
  {
    value: 20,
    label: i18n.t('global.payingOrder')
  },
  {
    value: 30,
    label: i18n.t('global.makingOrder')
  },
  {
    value: 40,
    label: i18n.t('global.finishedOrder')
  },
  {
    value: 50,
    label: i18n.t('global.refundedOrder')
  },
  {
    value: 60,
    label: i18n.t('global.closedOrder')
  }
]

// 对账状态筛选框数组
export const accountStatusArr = [
  {
    value: 0,
    label: i18n.t('global.paying')
  },
  {
    value: 1,
    label: i18n.t('global.payed')
  }
]

// 病人状态筛选框数组
export const patientStatusArr = [
  {
    value: -1,
    label: i18n.t('global.all')
  },
  {
    value: 0,
    label: i18n.t('global.activing')
  },
  {
    value: 1,
    label: i18n.t('global.actived')
  }
]

// 体检中心状态筛选框数组
export const medicalStatusArr = [
  {
    value: 0,
    label: i18n.t('global.activing')
  },
  {
    value: 1,
    label: i18n.t('global.actived')
  }
]

// 代理商合作模式选择框数组
export const settleModeArr = [
  {
    value: 0,
    label: i18n.t('global.focus')
  },
  {
    value: 1,
    label: i18n.t('global.count')
  },
  {
    value: 2,
    label: i18n.t('global.prepay')
  },
  {
    value: 3,
    label: i18n.t('global.postpay')
  }
]

// 角色列表用户类型筛选框数组
export const userArr = [
  {
    value: -1,
    label: i18n.t('global.all')
  },
  {
    value: 3,
    label: i18n.t('global.comManager')
  },
  {
    value: 4,
    label: i18n.t('global.agentManager')
  }
]

// 用户类型筛选框数组
// export const userTypeArr = [
//   {
//     value: 0,
//     label: '管理员'
//   },
//   {
//     value: 1,
//     label: '代理商'
//   },
//   {
//     value: 2,
//     label: '病人'
//   },
//   {
//     value: 3,
//     label: '医生'
//   },
//   {
//     value: 4,
//     label: '子账户'
//   }
// ]
export const userTypeArr = [
  {
    value: 3,
    label: i18n.t('global.comManager')
  },
  {
    value: 4,
    label: i18n.t('global.agentManager')
  }
]
// 用户类型
export function userType(userType) {
  let name = ''
  switch (userType) {
    case 3:
      name = i18n.t('global.comManager')
      break
    case 4:
      name = i18n.t('global.agentManager')
      break
    case 6:
      name = i18n.t('global.agentWorker')
  }
  return name
}
// 支付渠道状态
export function channelStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('close')
      break
    case 1:
      name = i18n.t('open')
      break
  }
  return name
}

// 模型反馈状态
export function adviceStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('global.unSet')
      break
    case 1:
      name = i18n.t('global.seted')
      break
  }
  return name
}
// 订单状态
export function orderStatus(status) {
  let name = ''
  switch (status) {
    case 10:
      name = i18n.t('global.invalidOrder')
      break
    case 20:
      name = i18n.t('global.payingOrder')
      break
    case 30:
      name = i18n.t('global.makingOrder')
      break
    case 40:
      name = i18n.t('global.finishedOrder')
      break
    case 50:
      name = i18n.t('global.refundedOrder')
      break
    case 60:
      name = i18n.t('global.closedOrder')
      break
  }
  return name
}

// 工单状态
export function workStatus(status) {
  let name = ''
  switch (status) {
    case 10:
      name = i18n.t('global.workPending')
      break
    case 20:
      name = i18n.t('global.workMaking')
      break
    case 30:
      name = i18n.t('global.workFinish')
  }
  return name
}

// 订单结算状态
export function accountStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('global.paying')
      break
    case 1:
      name = i18n.t('global.payed')
      break
  }
  return name
}

// 订单类型
export function orderType(type) {
  let name = ''
  switch (type) {
    case 0:
      name = i18n.t('global.modelOrder')
      break
    case 1:
      name = i18n.t('global.serveOrder')
      break
  }
  return name
}

// 订单支付方式
export function orderModeOfPayment(modeOfPayment) {
  let name = ''
  switch (modeOfPayment) {
    case 0:
      name = i18n.t('global.originPay')
      break
  }
  return name
}

// 商品状态
export function goodStatus(status) {
  let name
  switch (status) {
    case 0:
      name = i18n.t('unsale')
      break
    case 1:
      name = i18n.t('sale')
      break
    case 2:
      name = i18n.t('delete')
      break
  }
  return name
}

// 管理员状态
export function adminStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('global.activing')
      break
    case 1:
      name = i18n.t('global.actived')
      break
  }
  return name
}

// 系统日志操作类型
export function logType(operateType) {
  let name = ''
  switch (operateType) {
    case 1:
      name = i18n.t('global.add')
      break
    case 2:
      name = i18n.t('global.del')
      break
    case 4:
      name = i18n.t('global.update')
      break
    case 8:
      name = i18n.t('global.other')
      break
  }
  return name
}

// 病人状态
export function patientStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('global.activing')
      break
    case 1:
      name = i18n.t('global.actived')
      break
  }
  return name
}

// 医生状态
export function doctorStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('global.activing')
      break
    case 1:
      name = i18n.t('global.actived')
      break
  }
  return name
}

// 代理商状态
export function agentStatus(status) {
  let name = ''
  switch (status) {
    case 0:
      name = i18n.t('global.activing')
      break
    case 1:
      name = i18n.t('global.actived')
      break
  }
  return name
}

// 代理商合作模式
export function settleMode(settleMode) {
  let name = ''
  switch (settleMode) {
    case 0:
      name = i18n.t('global.focus')
      break
    case 1:
      name = i18n.t('global.count')
      break
    case 2:
      name = i18n.t('global.prepay')
      break
    case 3:
      name = i18n.t('global.postpay')
      break
  }
  return name
}

// 性别
export function sex(sex) {
  let name = ''
  switch (sex) {
    case 0:
      name = i18n.t('global.man')
      break
    case 1:
      name = i18n.t('global.woman')
      break
    case 2:
      name = i18n.t('global.serc')
      break
  }
  return name
}

// 腾讯云获取模型用
export const modelUrl = 'https://model-1304836373.cos.ap-guangzhou.myqcloud.com/'
export const tencentCloudUrl = 'https://png-1304836373.cos.ap-guangzhou.myqcloud.com/'
// 上传模型
export const fileAddresses = 'https://medical.ll3d.com/prod-api/order/record/upload'
