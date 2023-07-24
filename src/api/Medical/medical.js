import request from '@/utils/request'

// 后台获取体检中心用户列表
export function getMedicals(params) {
  return request({
    url: '/backend/examination/user',
    method: 'get',
    params
  })
}

// 添加体检中心用户
export function addMedical(data) {
  return request({
    url: '/backend/examination/user',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改体检中心用户状态
export function setMedicalStatus(userId, status) {
  return request({
    url: `/backend/examination/user/${userId}/status/${status}`,
    method: 'put'
  })
}

// 查询体检中心用户信息
export function getMedical(userId) {
  return request({
    url: `/backend/examination/user/${userId}`,
    method: 'get'
  })
}

// 修改体检中心用户信息
export function setMedical(data) {
  return request({
    url: `/backend/examination/user/${data.id}/info`,
    method: 'put',
    data
  })
}

// 查询体检中心订单
export function getMedicalOrders(params) {
  return request({
    url: '/backend/examination/order',
    method: 'get',
    params
  })
}

// 查询体检中心单个订单
export function getMedicalOrder(orderId) {
  return request({
    url: `/backend/examination/order/${orderId}`,
    method: 'get'
  })
}

// 后台处理体检中心订单
export function handleMedicalOrder(data) {
  return request({
    url: `/backend/examination/order/handle/${data.id}`,
    method: 'put',
    data
  })
}

// 删除文件
export function delFile(type, params) {
  return request({
    url: `/backend/file/${type}`,
    method: 'delete',
    params
  })
}

// 得到一个文件
export function getFile(type, params) {
  return request({
    url: `/back/end/file/${type}`,
    method: 'get',
    params
  })
}

// 后台获取订单的反馈列表
export function getFeeds(orderId, params) {
  return request({
    url: `/backend/examination/advice/order/${orderId}`,
    method: 'get',
    params
  })
}

// 后台完成反馈
export function submitAnswer(data) {
  return request({
    url: `/backend/examination/advice/complete/${data.id}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}
