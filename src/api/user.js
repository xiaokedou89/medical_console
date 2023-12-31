import request from '@/utils/request'


export function login(data) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  })
}


export function getInfo() {
  return request({
    url: '/admin/current',
    method: 'get'
  })
}



export function logout() {
  return request({
    url: '/admin',
    method: 'put'
  })
}
