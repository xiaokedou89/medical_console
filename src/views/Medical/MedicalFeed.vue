<template>
  <div class="feed-container">
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets"></i>
      <span>{{ $t('medical.medicalFeed.operateTitle')}}</span>
    </el-card>
    <!-- 主列表 -->
    <div class="table-container">
      <el-table
        ref="feedTable"
        v-loading="loading"
        :data="list"
        style="width: 100%;"
        :empty-text="$t('noData')"
        border
      >
        <el-table-column align="center" :label="$t('medical.medicalFeed.feedTimeLabel')">
          <template slot-scope="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('medical.medicalFeed.patient')">
          <template slot-scope="scope">
            {{ scope.row.order.patientName }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('medical.medicalFeed.diagLabel')">
          <template slot-scope="scope">
            {{ scope.row.order.diagnoseReportNo}}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('medical.medicalFeed.orderStatus')">
          <template slot-scope="scope">
            {{ getOrderStatus(scope.row.order.status)}}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('medical.medicalFeed.adviceLabel')">
          <template slot-scope="scope">
            <el-button type="text" @click="showFeed(scope.row)">
              {{ $t('checkout')}}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action')" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button type="text" @click="showAnswer(scope.row)">{{ getCompleteTxt(scope.row.answer) }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange"></pagination>
      </div>
    </div>
    <!-- 反馈弹框 -->
    <el-dialog class="feed-dialog" :title="$t('medical.medicalFeed.adviceTitle')" :visible.sync="adviceFlag" width="40%">
      <div class="advice-container" v-html="adviceObj.advice"></div>
    </el-dialog>
    <!-- 完成弹框 -->
    <el-dialog class="answer-dialog" :title="$t('medical.medicalFeed.answerTitle')" :visible.sync="answerFlag" width="40%" @opened="answerOpened">
      <div class="answer-container" v-show="answerSaveNode.answer != null && typeof answerSaveNode.answer == 'string'" v-html="answerObj.answer"></div>
      <div v-show="!answerSaveNode.answer" ref="wangEditor" id="w-editor" class="editor-container" style="text-align: left">
      </div>
      <div class="answer-footer" v-if="!answerSaveNode.answer">
        <el-button size="small" class="footer-cancel" @click="cancelAnswer">{{ $t('cancelBtn')}}</el-button>
        <el-button size="small" class="footer-confirm" type="primary" @click="submitAnswer">{{ $t('submitBtn')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as status from '@/utils/status.js'
import * as api from '@/api/Medical/medical.js'
import Vue from 'vue'
import wangEditor from 'wangeditor'
import pagination from '@/components/common/pagination/pagination.vue'
import { getToken } from '@/utils/auth.js'
import { i18n } from '@/assets/languages/i18n.js'
const defaultParams = {
  pkId: 0,
  sortMode: 'DESC',
  size: status.size
}

const defaultAnswer = {
  answer: ''
}

export default {
  name: 'medical-feed',
  components: {
    pagination
  },
  data() {
    return {
      orderId: null,
      order: null,
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
      // 请求参数
      params: Object.assign({}, defaultParams),
      // 分页防抖开关
      flag: false,
      // 反馈弹框开关
      adviceFlag: false,
      // 反馈弹框绑定对象
      adviceObj: {},
      // 完成弹框开关
      answerFlag: false,
      answerObj: Object.assign({}, defaultAnswer),
      answerSaveNode: Object.assign({}, defaultAnswer),
      // 富文本编辑器实例对象
      editor: null
    }
  },
  created() {
    this.orderId =  + this.$route.query.orderId
    this.initOrder()
      .then(() => {
        this.initList(this.params)
      })
      .catch(() => {
        this.$message({
          message: this.$t('medical.medicalFeed.initOrderFail'),
          type: 'error',
          duration: 1500
        })
        this.$router.go(-1)
      })
  },
  computed: {
    getTime() {
      return function(time) {
        return this.$moment(time).format('YYYY/MM/D  HH:mm')
      }
    },
    getOrderStatus() {
      return status.orderStatus
    },
    getCompleteTxt() {
      return function (answer) {
        let flag = typeof answer == 'string' && answer !== ''
        return flag ? i18n.t('medical.medicalFeed.done') : i18n.t('medical.medicalFeed.doneWithAnswer')
      }
    }
  },
  methods: {
    // 初始化订单数据
    initOrder() {
      return new Promise((resolve, reject) => {
        api.getMedicalOrder(this.orderId)
        .then(res => {
          if (res.code === 20000) {
            this.order = res.data
            resolve()
          } else if (res.code === 20004) {
            reject()
          }
        })
        .catch(err => {
          reject(err)
        })
      })
    },
    // 初始化列表数据
    initList(params) {
      this.loading = true
      api.getFeeds(this.orderId, params)
        .then(res => {
          if (res.code === 20000) {
            this.list = res.data
            for (const [index, item] of res.data.entries()) {
              Vue.set(item, 'order', this.order)
            }
            this.sortList()
            this.flag = false
            this.loading = false
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--
            } else {
              this.pageCount !== 1 && this.pageCount++
            }
          }
        })
        .catch(err => {
          this.loading = false
          this.flag = false
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--
          } else {
            this.pageCount !== 1 && this.pageCount++
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 分页点击上一页
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
    // 分页点击下一页
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
    // 分页页个数改变
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
    // 点击查看打开反馈弹框
    showFeed(item) {
      this.adviceObj = Object.assign({}, item)
      this.adviceFlag = true
    },
    // 点击完成打开完成弹框
    showAnswer(item) {
      this.answerSaveNode = item
      this.answerObj = Object.assign({}, item)
      this.answerFlag = true
    },
    // 完成弹框打开后回调
    answerOpened() {
      this.initEditor()
    },
    initEditor() {
      if (this.answerSaveNode.answer) {
        return
      }
      const that = this
      let uploadHooks,
          menus,
          editorConfig;
      if (this.editor === null) {
        // 上传图片和视频钩子
        uploadHooks = {
          customInsert(insert, result) {
            let url = status.network.baseURL +'/file/common/?filename=' + result.data.filename,
                xhr = new XMLHttpRequest()
            xhr.open('get', url, true)
            xhr.setRequestHeader('authorization', getToken())
            xhr.send()
            xhr.onload = function () {
              console.log(this.response)
            }
            insert(url)
          }
        }
        menus = [
          'head',  // 标题
          'bold',  // 粗体
          'fontSize',  // 字号
          'fontName',  // 字体
          'italic',  // 斜体
          'underline',  // 下划线
          'strikeThrough',  // 删除线
          'foreColor',  // 文字颜色
          'backColor',  // 背景颜色
          'link',  // 插入链接
          'list',  // 列表
          'justify',  // 对齐方式
          'quote',  // 引用
          'emoticon',  // 表情
          'image',  // 插入图片
          'video',  // 插入视频
          'table',  // 表格
          'code',  // 插入代码
          'undo',  // 撤销
          'redo', // 重复
          'indent',//分割线
          'lineHeight',//行高
          'splitLine',//全屏
        ]
        // 编辑器配置对象
        editorConfig = {
          height: 350,
          menus,
          onchangeTimeout: 1000,
          // uploadImgServer: status.network.uploadFileURL('common'),
          uploadImgServer: status.network.baseURL + '/file/upload/common',
          uploadImgHeaders: {
            'authorization': getToken()
          },
          uploadFileName: 'file',
          showLinkImg: false,
          uploadImgMaxLength: 1,
          uploadImgMaxSize: status.network.staticMaxSize,
          uploadImgTimeout: status.network.staticTimeout,
          uploadVideoServer: status.network.baseURL + '/file/upload/common',
          uploadVideoMaxSize: status.network.staticMaxSize,
          uploadVideoName: 'file',
          uploadVideoHeaders: {
            'authorization': getToken()
          },
          uploadVideoTimeout: status.network.staticTimeout,
          onchange: that.editorChange,
          uploadImgHooks: uploadHooks,
          uploadVideoHooks: uploadHooks
        }
        this.editor = new wangEditor(this.$refs.wangEditor)
        this.editor.config = {...this.editor.config, ...editorConfig}
        this.editor.create()
        this.editor.txt.html('')
      } else {
        this.editor.txt.html('')
      }

    },
    // 富文本
    editorChange() {
      this.answerObj.answer = this.editor.txt.html()
    },
    // 完成弹框点击确定
    submitAnswer() {
      if (!this.answerObj.answer) {
        this.$message({
          message: this.$t('medical.medicalFeed.answerInvalid'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      api.submitAnswer(this.answerObj)
        .then(res => {
          if (res.code === 20000) {
            this.answerObj = Object.assign({}, defaultAnswer)
            this.answerSaveNode = Object.assign({}, defaultAnswer)
            this.answerFlag = false
            this.initList(this.params)
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
    // 完成弹框点击取消
    cancelAnswer() {
      this.answerFlag = false
    }
  }
}
</script>
<style lang="scss" scoped>
.feed-container {
  padding: 30px;
  // 功能列表
  .operate-container {
    margin-top: 20px;
  }
  // 主列表
  .table-container {
    margin-top: 20px;
  }
  .pagination-container {
    float: right;
  }
  // 完成反馈弹框
  .answer-dialog {
    padding-bottom: 20px;
    .answer-container {
      border: 1px solid #ccc;
      padding: 10px;
    }
    .answer-footer {
      padding-top: 10px;
      display: flex;
      justify-content: flex-end;
    }
  }
  // 查看反馈弹框
  .feed-dialog {
    .advice-container {
      border: 1px solid #ccc;
      padding: 10px;
    }
  }
}
</style>
