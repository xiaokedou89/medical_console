import request from '@/utils/request.js'

// 查询所有工单
export function getAllWorks(params) {
  return request({
    url: '/work',
    method: 'get',
    params
  })
}

// 获取工单分配策略
export function getWorkStrategy() {
  return request({
    url: '/work/strategy',
    method: 'get'
  })
}

// 修改工单分配策略
export function setWorkStrategy(params) {
  return request({
    url: '/work/strategy',
    method: 'put',
    params
  })
}

// 获取当前工单分配策略
export function getWorkStrategyCurrent() {
  return request({
    url: '/work/strategy/current',
    method: 'get'
  })
}

// 重新分配工单
export function distributeWork(params) {
  return request({
    url: `/work/distribution/${params.workId}/${params.adminId}`,
    method: 'put'
  })
}
