<template>
  <div class="advice-container">
    <!--筛选框-->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="listQuery" size="small">
          <el-form-item :label="$t('timeFilter') + '：'">
            <el-date-picker
              v-model="listQuery.startTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeBegPlace') + '：'"
              @change="beginChange"
            />
            -
            <el-date-picker
              v-model="listQuery.endTime"
              class="input-width"
              value-format="yyyy-MM-dd"
              type="date"
              :placeholder="$t('timeEndPlace') + '：'"
              @change="endChange"
            />
          </el-form-item>
          <el-form-item :label="$t('statusFilter') + '：'">
            <el-select v-model="listQuery.status" class="input-width" :placeholder="$t('all')" clearable @change="statusChange">
              <el-option
                v-for="item in adviceStatusArr"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('orders.modelFeed.operateTitle')}}</span>
        <el-button style="float: right; margin: 0px 5px" size="small" @click="resetWork">{{$t('orders.modelFeed.resetWorker')}}</el-button>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        ref="adviceTable"
        v-loading="loading"
        :data="list"
        style="width: 100%;"
        :empty-text="$t('noData')"
        border
      >
        <el-table-column align="center" prop="orderId" :label="$t('works.index.orderNo')" />
        <el-table-column align="center" :label="$t('orderTime')">
          <template slot-scope="scope">{{ getTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('orders.modelFeed.advice')">
          <template slot-scope="scope">
            <el-button type="text" @click="showAdvice(scope.row)">{{ $t('checkout') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('orders.modelFeed.answer')">
          <template slot-scope="scope">
            <el-button v-if="scope.row.answer" type="text" @click="openAnswer(scope.row)">{{ $t('checkout')}}</el-button>
            <span v-else>{{ $t('orders.modelFeed.noAnswer') }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('status')">
          <template slot-scope="scope">
            {{ getStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" width="200" :label="$t('action')">
          <template slot-scope="scope">
            <el-button :disabled="scope.row.status == 1" size="mini" type="primary" @click="showAnswer(scope.row)">{{ $t('orders.modelFeed.commitAnswer') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!-- 模型建议弹出框 -->
    <el-dialog :title="$t('orders.modelFeed.advice')" v-if="adviceFlag" :visible.sync="adviceFlag" width="40%">
      <p>{{ adviceObj.advice }}</p>
    </el-dialog>
    <el-dialog :title="$t('orders.modelFeed.answer')" v-if="checkAnswer" :visible.sync="checkAnswer" width="40%">
      <p>{{ checkAnswerObj.answer}}</p>
    </el-dialog>
    <!-- 回复建议弹框 -->
    <el-dialog :title="$t('orders.modelFeed.commitAnswer')" v-if="answerFlag" :before-close="answerClosing" :visible.sync="answerFlag" width="40%">
      <el-form ref="answerForm" :model="answerObj" :rules="rules" size="small" class="sysuserFormRef" label-width="100px">
        <el-form-item :label="$t('orders.modelFeed.answer') + '：'" prop="answer">
          <el-input
            v-model="answerObj.answer"
            type="textarea"
            :rows="10"
            resize="vertical"
            :placeholder="$t('orders.modelFeed.answerPlace')"
          />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{ $t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{ $t('cancelBtn') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Orders/orders.js';
import * as status from '@/utils/status.js';
import * as rule from '@/utils/rules.js';
import Vue from 'vue';
import pagination from '@/components/common/pagination/pagination.vue';

const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1,
  timeColumn: 'createTime'
}

const defaultSet = {
  id: null,
  advice: '',
  answer: '',
  createTime: '',
  orderId: null,
  status: null
}

const rules = {
  answer: rule.areaRules
}

export default {
  name: 'ModelFeed',
  data() {
    return {
      rules,
      orderId: null,
      minId: 0,
      maxId: 0,
      pageCount: 1,
      flag: false,
      beginFlag: false,
      endFlag: false,
      statusFlag: false,
      adviceFlag: false,
      adviceObj: {},
      checkAnswer: false,
      checkAnswerObj: {},
      resetFlag: false,
      answerFlag: false,
      answerObj: Object.assign({}, defaultSet),
      answerSaveNode: null,
      params: Object.assign({}, defaultParams),
      loading: false,
      list: [],
      listQuery: {
        startTime: '',
        endTime: '',
        status: ''
      },
      adviceStatusArr: status.adviceStatusArr
    }
  },
  components: {
    pagination
  },
  created() {
    console.log(this.adviceStatusArr)
    if (this.$route.query.id) {
      this.orderId = this.$route.query.id
      this.initList(this.params)
    } else {
      this.$message({
        message: this.$t('orders.modelFeed.initFail'),
        type: 'error',
        duration: 1500
      })
      this.$router.back(-1)
    }
  },
  computed: {
    getTime() {
      const that = this
      return function (time) {
        return that.$moment(time).format('YYYY/MM/D  HH:mm')
      }
    },
    getStatus() {
      return status.adviceStatus
    }
  },
  methods: {
    initList(params) {
      this.loading = true
      api.getAdvices(this.orderId, params)
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.beginFlag = false
            this.endFlag = false
            this.statusFlag = false
            this.list = res.data
            this.sortList()
            for (const item of this.list) {
              Vue.set(item, 'setFlag', false)
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
            if (this.beginFlag || this.endFlag || this.statusFlag) {
              this.list = []
            }
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--
            } else {
              this.pageCount !== 1 && this.pageCount++
            }
          }
          this.loading = false
          this.flag = false
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
      this.params.size = e
      this.params.pkId = 0
      this.pageCount = 1
      this.initList(this.params)
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
    showAdvice(item) {
      this.adviceObj = Object.assign({}, item)
      this.adviceFlag = true
    },
    showAnswer(item) {
      this.answerObj = Object.assign({}, item)
      this.answerSaveNode = item
      this.answerFlag = true
    },
    handleSet() {
      if (this.answerSaveNode.setFlag) {
        return
      }
      this.answerSaveNode.setFlag = true
      this.$refs.answerForm.validate(valid => {
        if (valid) {
          api.setAdvice(this.answerObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('orders.modelFeed.answerSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.answerSaveNode.setFlag = false
                this.answerSaveNode.answer = this.answerObj.answer
                this.answerSaveNode = null
                this.answerObj = Object.assign({}, defaultSet)
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
              this.answerSaveNode.setFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.answerSaveNode.setFlag = false
        }
      })
    },
    cancelSet() {
      this.answerSaveNode = null
      this.answerObj = Object.assign({}, defaultSet)
      this.answerFlag = false
    },
    openAnswer(item) {
      this.checkAnswerObj = Object.assign({}, item)
      this.checkAnswer = true
    },
    resetWork() {
      this.$confirm(this.$t('orders.modelFeed.resetTitle'), this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          if (this.resetFlag) {
            resolve()
          }
          this.resetFlag = true
          api.resetWork(this.orderId)
            .then(res => {
              console.log(res);
              this.resetFlag = false
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('orders.modelFeed.resetSuc'),
                  type: 'success',
                  duration: 1500
                })
              } else {
                this.$message({
                  message: this.$t('orders.modelFeed.resetFail'),
                  type: 'error',
                  duration: 1500
                })
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.resetFlag = false
            })
        })
        .catch(() => {
          this.$message({
            message: this.$t('orders.modelFeed.resetCancel'),
            type: 'warning',
            duration: 1500
          })
        })
    },
    answerClosing(done) {
      this.$refs.answerForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
.advice-container {
  padding: 20px;
}
.operate-container {
  margin-top: 30px;
}
.table-container {
  margin-top: 20px;
}
.pagination-container {
  float: right;
}
</style>
