import request from '@/utils/request.js'

// 查询所有病人
export function getAllPatient(params) {
  return request({
    url: '/patient/list',
    method: 'get',
    params
  })
}

// 查询单个病人
export function getSinglePatient(patientId) {
  return request({
    url: `/patient/${patientId}`,
    method: 'get'
  })
}

// 改变病人状态
export function changeStatus(patientId, status) {
  return request({
    url: `/patient/${patientId}/status/${status}`,
    method: 'put'
  })
}

