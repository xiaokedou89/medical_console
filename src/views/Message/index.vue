<template>
  <div class="message-container">
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets"></i>
      <span>{{ $t('message.indexOperate')}}</span>
      <el-button style="float: right; margin: 0px 5px;" type="danger" size="small" @click="remove">{{$t('delBtn')}}</el-button>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="linkToAdd">{{$t('addBtn')}}</el-button>
    </el-card>
    <!-- 主列表 -->
    <div class="table-container">
      <el-table
        ref="messageTable"
        v-loading="loading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="tableSelect"
      >
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" :label="$t('message.title')">
          <template slot-scope="scope">
            <el-button @click="showSetMessage(scope.row)" type="text">
              <p class="text-overflow">
                {{ scope.row.title }}
              </p>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('message.content')">
          <template slot-scope="scope">
            <p class="text-overflow">
              {{ scope.row.content }}
            </p>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('createTime')" prop="createTime">
          <template slot-scope="scope">
            {{ getTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('action')" width="200" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="linkToSub(scope.row)">{{ $t('message.submit')}}</el-button>
            <el-button type="danger" size="small" @click="delMessage(scope.row)">{{ $t('delBtn') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!-- 消息编辑弹框 -->
    <el-dialog :title="$t('set')" :before-close="setClosing" v-if="setFlag" :visible.sync="setFlag" width="40%">
      <el-form ref="setForm" :model="setObj" :rules="rules" size="small" label-width="110px" label-position="right">
        <el-form-item prop="title" :label="$t('message.title') + '：'">
          <el-input v-model="setObj.title" :placeholder="$t('message.titlePlace')" />
        </el-form-item>
        <el-form-item prop="content" :label="$t('message.content') + '：'">
          <el-input
            v-model="setObj.content"
            type="textarea"
            :rows="10"
            resize="vertical"
            :placeholder="$t('message.contentPlace')"
          />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{ $t('confirmBtn') }}</el-button>
          <el-button size="small" @click="cancelSet">{{ $t('cancelBtn') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as status from '@/utils/status.js'
import * as api from '@/api/Message/message.js'
import * as rule from '@/utils/rules.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'

const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC'
}

const defaultSet = {
  id: null,
  title: '',
  content: '',
  createTime: null,
  templateKey: null
}

const rules = {
  title: rule.areaRules,
  content: rule.areaRules
}

export default {
  name: 'MessageList',
  components: {
    pagination
  },
  data() {
    return {
      rules,
      loading: false,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      // 删除消息模板后拉取数据开关
      removeFlag: false,
      // 编辑弹框开关
      setFlag: false,
      // 编辑弹框绑定对象
      setObj: Object.assign({}, defaultSet),
      saveSetNode: null,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 主列表数据
      list: [],
      // 列表勾选项的数组
      tableSelections: []
    }
  },
  computed: {
    getTime() {
      const _this = this
      return function (time) {
        return  time === null || time === '' || time === undefined ? _this.$t('noData') : _this.$moment(time).format('YYYY/MM/D  HH:mm')
      }
    }
  },
  created() {
    this.initList(this.params)
  },
  methods: {
    initList(params) {
      this.loading = true
      api.getAllMessages(params)
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.list = res.data
            this.loading = false
            this.sortList()
            this.flag = false
            for (const item of this.list) {
              Vue.set(item, 'setFlag', false)
              Vue.set(item, 'removeFlag', false)
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            this.flag = false
            this.loading = false
            if (this.removeFlag) {
              this.list = []
            }
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
          this.removeFlag = false
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
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    tableSelect(e) {
      console.log(e)
      this.tableSelections = e
    },
    // 点击消息标题显示编辑弹框
    showSetMessage(item) {
      this.saveSetNode = item
      this.setObj = JSON.parse(JSON.stringify(item))
      this.setFlag = true
    },
    // 点击编辑弹框确定
    handleSet() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setMessage(this.setObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('message.setMesSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
                this.saveSetNode.title = this.setObj.title
                this.saveSetNode.content = this.setObj.content
                this.saveSetNode = null
                this.setObj = Object.assign({}, defaultSet)
                this.setFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.saveSetNode.setFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.saveSetNode.setFlag = false
        }
      })
    },
    cancelSet() {
      this.saveSetNode = null
      this.setObj = Object.assign({}, defaultSet)
      this.setFlag = false
    },
    // 点击列表中删除按钮
    delMessage(item) {
      this.$confirm(this.$t('message.delMesTitle'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          if (item.removeFlag) {
            resolve()
          }
          this.removeFlag = true
          item.removeFlag = true
          api.delMessage(item.id)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('delSucMes'),
                  type: 'success',
                  duration: 1500
                })
                item.removeFlag = false
                this.params.pkId = this.maxId + 1
                this.params.sortMode = 'DESC'
                this.initList(this.params)
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              item.removeFlag = false
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    // 点击总的删除按钮
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('message.removeMesWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('message.removeMesTitle'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          this.removeFlag = true
          const list = []
          for (const item of this.tableSelections) {
            if (item.removeFlag) {
              continue
            }
            item.removeFlag = true
            const promiseItem = new Promise((resolve, reject) => {
              api.delMessage(item.id)
                .then(res => {
                  if (res.code === 20000) {
                    this.$message({
                      message: this.$t('delSucMes'),
                      type: 'success',
                      duration: 1500
                    })
                    item.removeFlag = true
                    resolve(res.data)
                  }
                })
                .catch(err => {
                  this.$message({
                    message: err,
                    type: 'error',
                    duration: 1500
                  })
                  item.removeFlag = false
                  reject(err)
                })
            })
            list.push(promiseItem)
          }
          Promise.allSettled(list)
            .then(() => {
              this.params.pkId = this.maxId + 1
              this.params.sortMode ='DESC'
              this.initList(this.params)
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    linkToAdd() {
      this.$router.push({
        path: '/message/addMessage'
      })
    },
    linkToSub(item) {
      this.$router.push({
        path: '/message/messageSend',
        query: {
          messageId: item.id
        }
      })
    },
    setClosing(done) {
      this.$refs.setForm.clearValidate()
      done()
    }
  }

}
</script>
<style lang="scss" scoped>
.message-container {
  padding: 30px;
}
.table-container {
  margin-top: 30px;
  width: 100%;
  .text-overflow {
    max-height: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
</style>
