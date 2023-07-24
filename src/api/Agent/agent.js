import request from '@/utils/request'

// 获取所有代理商
export function getAllAgents(params) {
  return request({
    url: '/agent/users',
    method: 'get',
    params
  })
}

// 获取代理商用户详细信息
export function getAgentDetail(agentId) {
  return request({
    url: `/agent/${agentId}`,
    method: 'get'
  })
}

// 修改代理商密码
export function setAgentPassword(agentId, data) {
  return request({
    url: `/agent/${agentId}/password`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 修改代理商状态
export function setAgentStatus(agentId, status) {
  return request({
    url: `/agent/${agentId}/status/${status}`,
    method: 'put'
  })
}

// 更换代理商
export function changeAgent(agentId, data) {
  return request({
    url: `/agent/${agentId}/info`,
    method: 'put',
    data
  })
}

// 删除代理商
export function delAgent(agentId) {
  return request({
    url: `/agent/${agentId}`,
    method: 'delete'
  })
}

// 添加代理商
export function addAgent(data) {
  return request({
    url: '/agent',
    method: 'post',
    data
  })
}

// 查询所有代理商与上级的分成收益
export function getUpRevenue(params) {
  return request({
    url: '/revenue/profit/list',
    method: 'get',
    params
  })
}

// 查询所有代理商与下级的分成收益
export function getDownRevenue(params) {
  return request({
    url: '/revenue/list',
    method: 'get',
    params
  })
}

// 查询管理员代理商与下级的分成收益
export function getAdminDownRevenue(params) {
  return request({
    url: '/revenue/admin/list',
    method: 'get',
    params
  })
}

// 根据上级代理商id查询分成记录
export function getDownRevenueByParent(parentId, params) {
  return request({
    url: `/revenue/profit/list/${parentId}`,
    method: 'get',
    params
  })
}

// 代理商结账(向下对账结算功能)
export function settleMent(data) {
  return request({
    url: `/revenue/settlement/${data.id}`,
    method: 'put',
    data
  })
}

// 管理员收益统计
export function getAdminRevenue() {
  return request({
    url: '/revenue/admin/statistics',
    method: 'get'
  })
}

