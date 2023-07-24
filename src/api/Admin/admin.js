import request from '@/utils/request.js'

// 获取当前登录用户详细信息
export function getCurrentLoginUser() {
  return request({
    url: '/admin/current',
    method: 'get'
  })
}

// 获取管理员列表
export function getAdminList(params) {
  return request({
    url: '/admin',
    method: 'get',
    params
  })
}

// 获取单个管理员详细信息
export function getSingleAdmin(id) {
  return request({
    url: `/admin/${id}`,
    method: 'get'
  })
}

// 创建账号
export function addAdmin(data) {
  return request({
    url: '/admin',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改管理员状态
export function changeStatus(id, status) {
  return request({
    url: `/admin/${id}/status/${status}`,
    method: 'put'
  })
}

// 修改管理员密码
export function resetPassword(id, data) {
  return request({
    url: `/admin/${id}/password`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除管理员
export function delAdmin(id) {
  return request({
    url: `/admin/${id}`,
    method: 'delete'
  })
}

// 查询所有操作日志
export function getLog(params) {
  return request({
    url: '/log/list',
    method: 'get',
    params
  })
}
