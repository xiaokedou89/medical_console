import request from '@/utils/request'

// 添加系统消息
export function addMessage(data) {
  return request({
    url: '/message/content',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 查询所有消息
export function getAllMessages(params) {
  return request({
    url: '/message/content/list',
    method: 'get',
    params
  })
}

// 查询单个消息
export function getMessage(messageId) {
  return request({
    url: `/message/content/${messageId}`,
    method: 'get'
  })
}

// 修改消息
export function setMessage(data) {
  return request({
    url: `/message/content/${data.id}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除单个消息
export function delMessage(messageId) {
  return request({
    url: `/message/content/${messageId}`,
    method: 'delete'
  })
}

// 查询所有消息模板
export function getAllTemplates(params) {
  return request({
    url: '/message/template/list',
    method: 'get',
    params
  })
}

// 查询单个消息模板
export function getTemplate(templateId) {
  return request({
    url: `/message/template/${templateId}`,
    method: 'get'
  })
}

// 添加消息模板
export function addTemplate(data) {
  return request({
    url: '/message/template',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 删除单个消息模板
export function delTemplate(templateId) {
  return request({
    url: `/message/template/${templateId}`,
    method: 'delete'
  })
}

// 修改消息模板信息
export function setTemplate(data) {
  return request({
    url: `/message/template/${data.id}`,
    method: 'put',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

// 发送消息
export function sendMessage(data) {
  return request({
    url: '/backend/message/send',
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    data
  })
}

