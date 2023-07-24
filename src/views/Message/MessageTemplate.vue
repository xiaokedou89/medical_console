<template>
  <div class="template-container">
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets"></i>
      <span>{{ $t('message.templateOperate') }}</span>
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
        <el-table-column align="center" :label="$t('message.keyword')" width="180">
          <template slot-scope="scope">
            <el-button @click="showSetTemplate(scope.row)" type="text">
              {{ scope.row.keyword }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('description')" prop="description" />
        <el-table-column align="center" :label="$t('message.contentTemplate')" prop="contentTemplate">
          <template slot-scope="scope">
            <p class="content-template">{{ scope.row.contentTemplate }}</p>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('message.titleTemplate')" prop="titleTemplate" />
        <el-table-column align="center" :label="$t('action')" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button @click="delTemplate(scope.row)" size="small" type="danger">{{ $t('delBtn') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!-- 模板编辑弹框 -->
    <el-dialog :title="$t('set')" :before-close="setClosing" v-if="setFlag" :visible.sync="setFlag" width="40%">
      <el-form ref="setForm" :model="setObj" :rules="rules" size="small" label-width="110px" label-position="right">
        <el-form-item prop="titleTemplate" :label="$t('message.titleTemplate') + '：'">
          <el-input v-model="setObj.titleTemplate" :placeholder="$t('message.titleTemplatePlace')" />
        </el-form-item>
        <el-form-item prop="description" :label="$t('description') + '：'" >
          <el-input v-model="setObj.description" :placeholder="$t('descriptionPlace')" />
        </el-form-item>
        <el-form-item :label="$t('message.keyword') + '：'" prop="keyword">
          <el-input v-model="setObj.keyword" :placeholder="$t('message.keywordPlace')" />
        </el-form-item>
        <el-form-item prop="contentTemplate" :label="$t('message.contentTemplate') + '：'">
          <el-input
            v-model="setObj.contentTemplate"
            type="textarea"
            :rows="10"
            resize="vertical"
            :placeholder="$t('message.contentTemplatePlace')"
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
import * as api from '@/api/Message/message.js'
import * as status from '@/utils/status.js'
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
  description: '',
  titleTemplate: '',
  keyword: '',
  contentTemplate: ''
}

const rules = {
  titleTemplate: rule.areaRules,
  keyword: rule.areaRules,
  contentTemplate: rule.areaRules
}

export default {
  name: 'MessageTemplate',
  components: {
    pagination
  },
  data() {
    return {
      // wheelClick: undefined,
      // wheelFlag1: true,
      // wheelFlag2: false,
      rules,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      // 编辑弹框开关
      setFlag: false,
      // 删除消息模板后拉取数据开关
      removeFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 列表选择项数组
      tableSelections: [],
      // 主列表数据
      list: [],
      // 列表勾选项的数组
      tableSelections: [],
      // 编辑弹框绑定对象
      setObj: Object.assign({}, defaultSet),
      // 编辑弹框保存对象
      saveSetNode: null
    }
  },
  created() {
    // document.onmousewheel = this.mouseWheel; // 非火狐
    // document.addEventListener('DOMMouseScroll', this.mouseWheel, false) // 火狐
    this.initList(this.params)
  },
  methods: {
    // stopWheel() {
    //   if (this.wheelFlag2) {
    //     console.log('停止了')
    //     this.wheelFlag1 = true
    //     this.wheelFlag2 = false
    //   }
    // },
    // mouseWheel(event) {
    //   let eventObj = event || window.event
    //   if (eventObj.wheelDelta) { // 非火狐
    //     // 事件对象
    //     console.log(eventObj)
    //     // 滚动距离
    //     console.log(eventObj.wheelDelta)
    //     if (this.wheelFlag1) {
    //       if (eventObj.wheelDelta > 0) {
    //         console.log('向上滚动')
    //       } else {
    //         console.log('向下滚动')
    //       }
    //       this.wheelFlag1 = false
    //       this.wheelFlag2 = true
    //       this.wheelClick = setTimeout(this.stopWheel, 200)
    //     } else {
    //       clearTimeout(this.wheelClick)
    //       this.wheelClick = setTimeout(this.stopWheel, 150)
    //     }

    //   } else if (eventObj.detail) {
    //      // 事件对象
    //     console.log(eventObj)
    //     // 滚动距离
    //     console.log(eventObj.detail)
    //     if (this.wheelFlag1) {
    //       if (eventObj.detail > 0) {
    //         console.log('向上滚动')
    //       } else {
    //         console.log('向下滚动')
    //       }
    //       this.wheelFlag1 = false
    //       this.wheelFlag2 = true
    //       this.wheelClick = setTimeout(this.stopWheel, 200)
    //     } else {
    //       clearTimeout(this.wheelClick)
    //       this.wheelClick = setTimeout(this.stopWheel, 150)
    //     }

    //   }
    // },
    initList(params) {
      this.loading = true
      api.getAllTemplates(params)
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
    // 点击分页上一页
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
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    tableSelect(e) {
      this.tableSelections = e
    },
    // 点击key的文本按钮打开编辑弹框
    showSetTemplate(item) {
      this.saveSetNode = item
      this.setObj = JSON.parse(JSON.stringify(item))
      this.setFlag = true
    },
    // 编辑弹框点击确认
    handleSet() {
      if (this.saveSetNode.setFlag) {
        return
      }
      this.saveSetNode.setFlag = true
      this.$refs.setForm.validate(valid => {
        if (valid) {
          api.setTemplate(this.setObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('message.setTemSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.saveSetNode.setFlag = false
                this.saveSetNode.keyword = this.setObj.keyword
                this.saveSetNode.titleTemplate = this.setObj.titleTemplate
                this.saveSetNode.contentTemplate = this.setObj.contentTemplate
                this.saveSetNode.description = this.setObj.description
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
    // 编辑弹框点击取消
    cancelSet() {
      this.saveSetNode = null
      this.setObj = Object.assign({}, defaultSet)
      this.setFlag = false
    },
    remove() {
      if (this.tableSelections.length === 0) {
        this.$message({
          message: this.$t('message.removeTemWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.$confirm(this.$t('message.removeTemTitle'), this.$t('warning'), {
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
              api.delTemplate(item.id)
                .then(res => {
                  console.log(res)
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
                  console.log('debugger')
                  console.log(err)
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
              this.params.sortMode = 'DESC'
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
    delTemplate(item) {
      this.$confirm(this.$t('message.delTemTitle'), this.$t('warning'), {
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
          api.delTemplate(item.id)
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
    // 跳转至添加模板
    linkToAdd() {
      this.$router.push({
        path: '/message/addTemplate'
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
.template-container {
  padding: 30px;
}
.table-container {
  margin-top: 30px;
  width: 100%;
  .content-template {
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
