import request from '@/utils/request'

// 查询所有角色
// export function getRoles(params) {
//   return request({
//     url: `/role/list/${params.userType}`,
//     method: 'get',
//     params
//   })
// }

export function getRoles(userId, params) {
  return request({
    url: `/role/list/${params.userType}/${userId}`,
    method: 'get',
    params
  });
}

// 添加角色
export function addRoles(data) {
  return request({
    url: '/role',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除角色
export function delRoles(roleId) {
  return request({
    url: `/role/${roleId}`,
    method: 'delete'
  })
}

// 编辑角色
export function setRoles(data) {
  return request({
    url: `/role/${data.id}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 添加用户角色映射
export function addRole(data) {
  return request({
    url: '/role/user',
    method: 'put',
    data
  })
}

// 根据用户类型拉取对应角色(代理商是4，子账号是6)
export function getRolesByUserType(userType, params) {
  return request({
    url: `/role/list/${userType}`,
    method: 'get',
    params
  })
}
