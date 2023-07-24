<template>
  <div class="order-container">
    <!-- 筛选框 -->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="params" size="small">
          <el-form-item :label="$t('timeFilter') + '：'">
            <el-date-picker
              v-model="params.startTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeBegPlace') + '：'"
              @change="beginChange"
            />
            -
            <el-date-picker
              v-model="params.endTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeEndPlace') + '：'"
              @change="endChange"
            />
          </el-form-item>
          <el-form-item :label="$t('statusFilter') + '：'">
            <el-select v-model="params.status" class="input-width" :placeholder="$t('all')" clearable @change="statusChange">
              <el-option
                v-for="item in orderStatusArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('medical.medicalOrders.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        ref="orderTable"
        v-loading="loading"
        :data="list"
        style="width: 100%;"
        :empty-text="$t('noData')"
        border
      >
        <el-table-column align="center" prop="diagnoseReportNo" :label="$t('medical.medicalOrders.diagnoseReportNo')" width="180">
          <template slot-scope="scope">
            <el-button type="text" @click="showDetail(scope.row)">
              {{ scope.row.diagnoseReportNo }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('medical.medicalOrders.medicalName')">
          <template slot-scope="scope">
            {{ scope.row.medical | filterMedical }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="name" :label="$t('medical.medicalOrders.orderName')" />
        <el-table-column align="center" prop="patientName" :label="$t('medical.medicalOrders.patientName')" />
        <el-table-column align="center" :label="$t('medical.medicalOrders.orderStatus')">
          <template slot-scope="scope">
            {{ getOrderStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="模型">
          <template slot-scope="scope">
            <el-button type="text" :disabled="modelBtnDisabled(scope.row.status)" @click="linkToModel(scope.row)">
              {{ getModelBtn(scope.row.status) }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('feed')">
          <template slot-scope="scope">
            <el-button type="text" @click="linkToFeed(scope.row)">
              {{ $t('checkout') }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" width="200" :label="$t('action')">
          <template slot-scope="scope">
            <el-button :loading="scope.row.downloading" type="text" @click="download(scope.row)">{{ $t('downloadBtn')}}</el-button>
            <el-button type="text" :disabled="submitFlag" @click="showModelDataDialog(scope.row)">{{ $t('submitBtn')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!-- 订单详情弹出框 -->
    <el-dialog :title="$t('medical.medicalOrders.detailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="120px" label-position="right">
        <el-form-item :label="$t('medical.medicalOrders.diagnoseReportNo') + '：'">
          <span>{{ detailObj.diagnoseReportNo }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.medicalOrders.medicalName') + '：'">
          <span>{{ detailObj.medical | filterMedical }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.medicalOrders.orderName') + '：'">
          <span>{{ detailObj.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.medicalOrders.patientName') + '：'">
          <span>{{ detailObj.patientName }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.medicalOrders.orderStatus') + '：'">
          <span>{{ getOrderStatus(detailObj.status) }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.medicalOrders.price') + '：'">
          <span>{{ getPrice(detailObj.price) }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.medicalOrders.createTime') + '：'">
          <span>{{ getTime(detailObj.createTime) }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 上传提交模型处理结果弹框 -->
    <el-dialog :title="$t('medical.medicalOrders.modelDataDialogTitle')" :visible.sync="modelDataFlag"  width="40%">
      <el-form ref="modelDataForm" :model="modelDataObj" label-width="120px" label-position="right" @submit.native.prevent>
        <el-form-item :label="$t('medical.medicalOrders.modelDataDialogLabel') + '：'">
          <div class="upload-container">
            <el-upload
              ref="uploadForm"
              :headers="headers"
              :action="getUploadUrl('model')"
              accept=".zip"
              :before-upload="beforeUpload"
              :on-progress="fileProgress"
              :on-success="fileUploadSuc"
              :on-error="fileUploadFail"
              :on-remove="progressRemove"
              :show-file-list="modelDataObj.fileListFlag"
              :disabled="modelDataObj.fileUploadDisabled"
            >
              <div class="upload-group">
                <span class="upload-file-box" @click="handleRemove">{{ modelDataObj.showFilename }}</span>
                <button class="upload-btn" @click="handleRemove">{{ getUploadBtnText }}</button>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <!-- 上传报告 -->
        <el-form-item :label="$t('medical.medicalOrders.reportLabel') + '：'">
          <div class="upload-container">
            <el-upload
              ref="reportForm"
              :headers="headers"
              :action="getUploadUrl('common')"
              accept=".pdf"
              :before-upload="beforeReportUpload"
              :on-progress="reportProgress"
              :on-success="reportUploadSuc"
              :on-error="reportUploadFail"
              :on-remove="reportProgressRemove"
              :show-file-list="modelDataObj.reportListFlag"
              :disabled="modelDataObj.reportDisabled"
            >
              <div class="upload-group">
                <span class="upload-file-box" @click="handleReportRemove">{{ modelDataObj.reportShowFilename }}</span>
                <button class="upload-btn" @click="handleReportRemove">{{ getReportBtnText }}</button>
              </div>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as status from '@/utils/status'
import * as api from '@/api/Medical/medical'
import Vue from 'vue'
import store from '@/store'
import pagination from '@/components/common/pagination/pagination.vue'
import { getToken } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n'
const defaultParams = {
  startTime: '',
  endTime: '',
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1,
  timeColumn: 'createTime'
}

const modelTag = {
  name: '',
  light: 1,
  show: false,
  Describe: '',
  flag: false,
  Meshes: []
}

export default {
  name: 'medical-orders',
  components: {
    pagination
  },
  data() {
    return {
      baseUrl: status.network.baseURL,
      fileUploadUrl: status.network.fileUploadURL,
      headers: {},
      saveShowFilename: '',
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 列表加载开关
      loading: false,
      // 主列表数据
      list: [],
      // 拉取列表数据参数
      params: Object.assign({}, defaultParams),
      // 筛选框起始时间开关
      beginFlag: false,
      // 筛选框结束时间开关
      endFlag: false,
      // 筛选框状态开关
      statusFlag: false,
      // 分页防抖开关
      flag: false,
      // 详情弹框开关
      detailFlag: false,
      // 提交按钮禁用开关
      submitFlag: false,
      // 详情弹框绑定对象
      detailObj: {},
      // 提交模型数据弹框开关
      modelDataFlag: false,
      // 上传模型弹框绑定对象
      modelDataObj: {},
      modelDataSaveNode: {},
      orderStatusArr: status.orderStatusArr
    }
  },
  created() {
    this.initList(this.params)
    this.getToken()
  },
  computed: {
    getOrderStatus() {
      return status.orderStatus
    },
    getPrice() {
      return function (price) {
        return `￥${price}`
      }
    },
    getTime() {
      const _this = this
      return function(time) {
        return _this.$moment(time).format('YYYY/MM/D  HH:mm')
      }
    },
    getUploadUrl() {
      const _this = this
      return function (type) {
        return _this.baseUrl + '/backend/file/upload/' + type
      }
    },
    getUploadBtnText() {
      return this.modelDataObj.fileUploadDisabled ? i18n.t('medical.medicalOrders.uploadBtnChange') : i18n.t('medical.medicalOrders.uploadBtn')
    },
    getReportBtnText() {
      return this.modelDataObj.reportDisabled ? i18n.t('medical.medicalOrders.uploadBtnChange') : i18n.t('medical.medicalOrders.uploadBtn')
    },
    getModelBtn() {
      return function (status) {
        return status > 30 ? i18n.t('checkout') : i18n.t('orders.model.noModel')
      }
    },
    modelBtnDisabled() {
      return function (status) {
        return status > 30 ? false : true
      }
    }
  },
  filters: {
    filterMedical(medical) {
      let name = medical === null ? i18n.t('medical.medicalOrders.filterMedical') : medical.organization
      return name
    }
  },
  watch: {
    modelDataFlag(flag) {
      const that = this
      if (flag) {
        setTimeout(() => {
          that.$refs.uploadForm.clearFiles()
          that.$refs.reportForm.clearFiles()
        }, 0)
      }
    }
  },
  methods: {
    getToken() {
      store.getters.token && (this.headers['authorization'] = getToken())
    },
    initList(params) {
      this.loading = true
      api.getMedicalOrders(params)
        .then(res => {
          const list = []
          if (res.code === 20000) {
            this.beginFlag = false
            this.endFlag = false
            this.statusFlag = false
            for (let [index, item] of res.data.entries()) {
              Vue.set(item, 'fileListFlag', true)
              Vue.set(item, 'reportListFlag', true)
              Vue.set(item, 'fileUploadDisabled', false)
              Vue.set(item, 'reportDisabled', false)
              Vue.set(item, 'uploadProgressFlag', false)
              Vue.set(item, 'reportProgressFlag', false)
              Vue.set(item, 'upModelData', null)
              Vue.set(item, 'upReport', null)
              Vue.set(item, 'showFilename', '')
              Vue.set(item, 'reportShowFilename', '')
              Vue.set(item, 'saveZipName', '')
              Vue.set(item, 'downloading', false)
              const promiseItem = new Promise((resolve, reject) => {
                api.getMedical(item.examinationUserId)
                  .then(res => {
                    if (res.code === 20000) {
                      Vue.set(item, 'medical', res.data)
                      resolve(item)
                    } else if (res.code === 20004) {
                      Vue.set(item, 'medical', null)
                      resolve(item)
                    }
                  })
                  .catch(err => {
                    reject(err)
                  })
              })
              list.push(promiseItem)
            }
            Promise.all(list)
              .then(result => {
                this.list = result
                console.log(this.list)
                this.loading = false
                this.sortList()
                this.flag = false
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            if (this.beginFlag || this.endFlag || this.statusFlag) {
              this.list = []
            }
            this.flag = false
            this.loading = false
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--;
            } else {
              this.pageCount !== 1 && this.pageCount++;
            }
          }
        })
        .catch(err => {
          this.loading = false
          this.flag = false
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--;
          } else {
            this.pageCount !== 1 && this.pageCount++;
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 分页组件点击上一页事件
    prevPage() {
      if (this.pageCount <= 1) {
        return
      } else {
        if (!this.flag) {
          this.flag = true
          this.pageCount--
          this.params.sortMode = 'ASC'
          this.params.pkId = this.maxId
          this.initList(this.params)
        } else {
          return
        }
      }
    },
    // 分页组件点击下一页事件
    nextPage() {
      if (!this.flag) {
        this.flag = true
        this.pageCount++
        this.params.sortMode = 'DESC'
        this.params.pkId = this.minId
        this.initList(this.params)
      } else {
        return
      }
    },
    // 分页组件选择每页条数触发事件
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.params.pkId = 0
      this.pageCount = 1
      this.initList(this.params)
    },
    // 排序列表数组保存当前数组最大最小id
    sortList() {
      this.list.sort((a, b) => {
        if (a.id > b.id) {
          return -1
        } else if (a.id < b.id) {
          return 1
        } else {
          return 0
        }
      })
      this.maxId = this.list[0].id
      this.minId = this.list[this.list.length - 1].id
    },
    // 筛选框起始时间改变
    beginChange(value) {
      this.beginFlag = true
      if (value !== null) {
        Vue.set(this.params, 'begin', value)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      } else {
        Vue.delete(this.params, 'begin')
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      }
    },
    // 筛选框结束时间改变
    endChange(value) {
      this.endFlag = true
      if (value !== null) {
        Vue.set(this.params, 'end', value)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      } else {
        Vue.delete(this.params, 'end')
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      }
    },
    // 筛选框状态改变
    statusChange(value) {
      this.statusFlag = true
      if (typeof value === 'number') {
        Vue.set(this.params, 'status', value)
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      } else {
        this.params.status = -1
        this.params.pkId = 0
        this.params.sortMode = 'DESC'
        this.pageCount = 1
        this.initList(this.params)
      }
    },
    // 点击报告单号打开细节弹框
    showDetail(item) {
      this.detailObj = Object.assign({}, item)
      this.detailFlag = true
    },
    // 点击下载
    download(item) {
      const that = this
      if (item.modelSource === null || !item.modelSource) {
        this.$message({
          message: this.$t('medical.medicalOrders.downloadFailMes'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      item.downloading = true
      this.$message({
        message: that.$t('medical.medicalOrders.downloadSucMes'),
        type: 'success',
        duration: 1500
      })
      let url = status.network.baseURL + status.network.getFiles('common') + item.modelSource,
          xhr = new XMLHttpRequest()
      xhr.open('get', url, true)
      xhr.setRequestHeader('authorization', getToken())
      xhr.responseType = 'blob'
      xhr.onload = function () {
        let blob,
            a,
            fileURL;
        if (this.status >= 200 && this.status < 300 || this.status == 304) {
          blob = this.response
          a = document.createElement('a')
          fileURL = window.URL.createObjectURL(blob)
          a.href = fileURL
          a.download = item.modelSource
          a.click()
          item.downloading = false
        } else {
          item.downloading = false
          that.$message({
            message: that.$t('medical.medicalOrders.downRequestFail'),
            type: 'error',
            duration: 1500
          })
        }
      }
      xhr.send()
    },
    // 点击提交按钮弹出提交模型数据弹框
    showModelDataDialog(item) {
      this.modelDataSaveNode = item
      this.modelDataObj = Object.assign({}, item)
      this.modelDataFlag = true
    },
    // 上传报告前检查格式文件大小
    beforeReportUpload(file) {
      if (this.modelDataObj.reportProgressFlag) {
        this.$message({
          message: this.$t('medical.medicalOrders.uploadingWarn'),
          type: 'warning',
          duration: 1500
        })
        return !this.modelDataObj.reportProgressFlag
      }
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1),
          size = file.size,
          extensionFlag = extension === 'pdf' && size <= 500 * 1024 * 1024 && !this.modelDataObj.reportProgressFlag ? true : false
      if (!extensionFlag) {
        this.$message({
          message: this.$t('medical.medicalOrders.extensionWarn'),
          type: 'warning',
          duration: 1500
        })
      }
      return extensionFlag
    },
    // 上传报告时回调
    reportProgress() {
      this.modelDataObj.reportProgressFlag = true
      this.submitFlag = true
    },
    // 报告上传成功回调
    reportUploadSuc(e) {
      this.modelDataObj.reportProgressFlag = false
      this.submitFlag = false
      if (e.code === 20000) {
        this.modelDataObj.reportShowFilename = e.data.oldFilename
        this.modelDataObj.reportDisabled = true
        this.modelDataObj.reportListFlag = false
        this.modelDataObj.upReport = e.data.filename
        this.modelDataSaveNode = Object.assign(this.modelDataSaveNode, this.modelDataObj)
      } else {
        this.$refs.reportForm.clearFiles()
        this.$message({
          message: e.message || this.$t('medical.medicalOrders.uploadFailMes'),
          type: 'error',
          duration: 1500
        })
      }
    },
    reportUploadFail(e) {
      this.modelDataObj.reportProgressFlag = false
      this.submitFlag = false
      this.$message({
        message: e.message || this.$t('medical.medicalOrders.uploadFailMes'),
        type: 'error',
        duration: 1500
      })
    },
    // 移除取消上传回调
    reportProgressRemove() {
      this.modelDataObj.reportProgressFlag = false
      this.submitFlag = false
    },
    handleReportRemove() {
      if (!this.modelDataObj.reportDisabled) {
        return
      }
      api.delFile('common', {
        filename: this.modelDataObj.upReport
      })
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('medical.medicalOrders.delFileSuc'),
              type: 'success',
              duration: 1500
            })
            this.$refs.reportForm.clearFiles()
            this.modelDataObj.reportListFlag = true
            this.modelDataObj.reportDisabled = false
            this.modelDataObj.reportShowFilename = ''
            this.modelDataObj.upReport = null
            this.modelDataSaveNode = Object.assign(this.modelDataSaveNode, this.modelDataObj)
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 上传前检查回调
    beforeUpload(file) {
      if (this.modelDataObj.uploadProgressFlag) {
        this.$message({
          message: this.$t('medical.medicalOrders.uploadingWarn'),
          type: 'warning',
          duration: 1500
        })
        return !this.modelDataObj.uploadProgressFlag
      }
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1),
          size = file.size,
          extensionFlag = extension === 'zip' && size <= 500 * 1024 * 1024 && !this.modelDataObj.uploadProgressFlag ? true : false
      if (!extensionFlag) {
        this.$message({
          message: this.$t('medical.medicalOrders.extensionWarn'),
          type: 'warning',
          duration: 1500
        })
      } else {
        this.saveShowFilename = file.name
      }
      return extensionFlag
    },
    // 上传文件时回调
    fileProgress() {
      this.modelDataObj.uploadProgressFlag = true
      this.submitFlag = true
    },
    // 上传成功回调
    fileUploadSuc(e) {
      this.modelDataObj.uploadProgressFlag = false
      this.submitFlag = false
      if (e.code === 20000) {
        this.modelDataObj.showFilename = this.saveShowFilename
        this.modelDataObj.fileUploadDisabled = true
        this.modelDataObj.fileListFlag = false
        this.modelDataObj.saveZipName = e.data.zipName
        this.modelDataObj.upModelData = JSON.stringify(e.data)
        this.modelDataSaveNode = Object.assign(this.modelDataSaveNode, this.modelDataObj)
      } else {
        this.$refs.uploadForm.clearFiles()
        this.$message({
          message: e.message || this.$t('medical.medicalOrders.uploadFailMes'),
          type: 'error',
          duration: 1500
        })
      }
    },
    // 上传失败回调
    fileUploadFail(e) {
      this.modelDataObj.uploadProgressFlag = false
      this.$message({
        message: e.message || this.$t('medical.medicalOrders.uploadFailMes'),
        type: 'error',
        duration: 1500
      })
    },
    // 移除取消上传回调
    progressRemove() {
      this.modelDataObj.uploadProgressFlag = false
    },
    // 上传后删除已上传的文件
    handleRemove() {
      if (!this.modelDataObj.fileUploadDisabled) {
        return
      }
      api.delFile('model', {
        filename: this.modelDataObj.saveZipName
      })
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('medical.medicalOrders.delFileSuc'),
              type: 'success',
              duration: 1500
            })
            this.$refs.uploadForm.clearFiles()
            this.modelDataObj.fileListFlag = true
            this.modelDataObj.fileUploadDisabled = false
            this.modelDataObj.showFilename = ''
            this.modelDataObj.upModelData = null
            this.modelDataSaveNode = Object.assign(this.modelDataSaveNode, this.modelDataObj)
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 上传弹框点击确定
    handleSet() {
      if (this.modelDataObj.upModelData === null || this.modelDataObj.upReport === null) {
        this.$message({
          message: this.$t('medical.medicalOrders.noCommitWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.modelDataObj.modelData = this.modelDataObj.upModelData
      this.modelDataObj.report = this.modelDataObj.upReport
      this.modelDataObj.modelTag = JSON.stringify(modelTag)
      api.handleMedicalOrder(this.modelDataObj)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('medical.medicalOrders.handleOrderSuc'),
              type: 'success',
              duration: 1500
            })
            if (this.modelDataSaveNode.modelData === null && this.modelDataSaveNode.report === null) {
              this.modelDataFlag = false
              this.initList(this.params)
            } else {
              let list = []
              this.modelDataSaveNode.modelData !== null && (list.push(new Promise((resolve,reject) => {
                let filename = JSON.parse(this.modelDataSaveNode.modelData).zipName
                api.delFile('model', {
                  filename
                })
                  .then(res => {
                    if (res.code === 20000) {
                      resolve(res)
                    } else (
                      reject(res.message)
                    )
                  })
                  .catch(err => {
                    reject(err)
                  })
              })))
              this.modelDataSaveNode.report !== null && (list.push(new Promise((resolve,reject) => {
                api.delFile('common', {
                  filename: this.modelDataSaveNode.report
                })
                  .then(res => {
                    if (res.code === 20000) {
                      resolve(res)
                    } else {
                      reject(res.message)
                    }
                  })
                  .catch(err => {
                    reject(err)
                  })
              })))
              Promise.allSettled(list)
                .then(res => {
                  this.modelDataFlag = false
                  this.initList(this.params)
                })
            }
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 上传弹框点击取消
    cancelSet() {
      this.modelDataFlag = false
    },
    // 点击反馈查看跳转到订单反馈页面
    linkToFeed(item) {
      this.$router.push({
        path: '/mec/medicalfeed',
        query: {
          orderId: item.id
        }
      })
    },
    // 点击查看模型跳转到模型页面
    linkToModel(item) {
      this.$router.push({
        path: '/mec/medicalmodel',
        query: {
          id: item.id
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.order-container {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.table-container {
  margin-top: 20px;
}
.pagination-container {
  float: right;
}
.upload-container::v-deep .el-upload {
  width: 100%;
  display: block;
  // el-upload里自己的盒子
  .upload-group {
    width: 100%;
    position: relative;
    // 模拟输入框
    .upload-file-box {
      text-align: left;
      display: inline-block;
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      line-height: 32px;
      padding-left: 11px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    // 选择文件按钮
    .upload-btn {
      position: absolute;
      right: -1px;
      top: 0;
      height: 32px;
      background: #1890ff;
      color: #fff;
      border: 0;
      border-radius: 2px;
      cursor: pointer;
    }
    // 鼠标悬浮上传框样式
    .upload-group:hover .upload-file-box {
      box-shadow: 0 0 0 1px #a8abb2 inset;
      border: 0;
    }
    // 鼠标点击上传框样式
    .upload-group:active .upload-file-box {
      box-shadow: 0 0 0 1px #4943F7 inset;
      border: 0;
    }
  }
}
</style>
