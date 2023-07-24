<template>
  <div class="app-container">
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('works.index.operateTitle')}}</span>
      <el-button
        :disabled="setStrategyDisabled"
        style="float: right; margin: 0px 5px" size="small"
        @click="showSetStrategy"
      >{{$t('works.index.setStrategyBtn')}}</el-button>
    </el-card>
    <!-- 主列表数据 -->
    <div class="table-container">
      <el-table
        ref="workTable"
        v-loading="loading"
        :data="list"
        style="width: 100%;"
        :empty-text="$t('noData')"
        border
      >
        <el-table-column align="center" prop="id" :label="$t('orderNo')" />
        <el-table-column align="center" :label="$t('works.index.worker')">
          <template slot-scope="scope">{{ scope.row.worker | filterWorker }}</template>
        </el-table-column>
        <el-table-column align="center" prop="createTime" :label="$t('orderTime')" >
          <template slot-scope="scope">{{ getTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column align="center" prop="diagnoseReportNo" :label="$t('diagnoseReportNo')"/>
        <el-table-column align="center" prop="medicalRecordNo" :label="$t('medicalRecordNo')"  />
        <el-table-column align="center" :label="$t('hospital')">
          <template slot-scope="scope">{{ scope.row.hospital | filterHospital }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('status')" prop="status" width="100">
          <template slot-scope="scope">{{ getWorkStatus(scope.row.status) }}</template>
        </el-table-column>
        <el-table-column align="center" :label="$t('order')">
          <template slot-scope="scope">
            <el-button type="text" @click="showOrderDetail(scope.row.order)">{{ $t('checkout') }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" fixed="right" :label="$t('action')">
          <template slot-scope="scope">
            <el-button :disabled="distributionDisabled || (scope.row.status > 20)" size="small" type="primary" @click="showDistribution(scope.row)">{{ $t('works.index.distribution')}}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!-- 订单详情弹框 -->
    <el-dialog :title="$t('routerTitle.ordersDetail')" :visible.sync="orderFlag" v-if="orderFlag" width="30%">
      <el-form
        :model="orderObj"
        label-width="100px"
        label-position="right"
      >
        <el-form-item :label="$t('works.index.orderName') + '：'">
          <span>
            {{ orderObj.name | filterInfo }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.goodsName') + '：'">
          <span>
            {{ orderObj.goodsName | filterInfo }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.price') + '：'">
          <span>
            {{ getPrice(orderObj.price)  }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.orderNo') + '：'">
          <span>
            {{ orderObj.orderNo | filterInfo }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.patientName') + '：'">
          <span>
            {{ orderObj.patientName | filterInfo }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.orderTime') + '：'">
          <span>
            {{ getTime(orderObj.orderTime) }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.payTime') + '：'">
          <span>
            {{ getTime(orderObj.payTime) }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('works.index.orderStatus') + '：'">
          <span>
            {{ getOrderStatus(orderObj.status) }}
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 设置工单分配策略弹框 -->
    <el-dialog :title="$t('works.index.setStrategyTitle')" :visible.sync="strategyFlag" v-if="strategyFlag" width="40%">
      <el-form ref="setStrateForm" :model="strategyObj" size="small" label-width="100px" label-position="right">
        <el-form-item  :label="$t('works.index.setStrategyLabel') + '：'">
          <el-select class="strate-select" v-model="strategyObj.strategy">
            <el-option v-for="(item, index) in strategys" :label="item.name" :value="item.value" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 分配工单弹框 -->
    <el-dialog :title="$t('works.index.distributionTitle')" :visible.sync="distributionFlag" v-if="distributionFlag" width="30%">
      <el-form ref="distributionForm" :model="distributionObj" size="small" label-width="100px" label-position="right">
        <el-form-item  :label="$t('works.index.distributionLabel') + '：'">
          <el-select v-model="distributionObj.adminId" :placeholder="$t('works.index.distriPlace')" @change="selectAdmin">
            <el-option v-for="(item, index) in admins" :label="item.name" :value="item.id" :key="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleDistribution">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelDistribution">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <div class="pagination-container">
      <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
    </div>
  </div>
</template>
<script>
import * as api from '@/api/Works/works.js'
import * as adminApi from '@/api/Admin/admin'
import * as status from '@/utils/status.js'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'
import { i18n } from '@/assets/languages/i18n'

const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: -1
}

const defaultStrategy = {
  strategy: null
}

const defaultDistribution = {
  workId: null,
  adminId: null
}

export default {
  name: 'Works',
  components: {
    pagination
  },
  data() {
    return {
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      // 设置工单分配策略按钮禁用
      setStrategyDisabled: false,
      // 工单分配按钮禁用
      distributionDisabled: false,
      // 工单分配策略数组
      strategys: [],
      // 弹框开关
      strategyFlag: false,
      // 防抖
      setStrategyFlag: false,
      // 修改分配策略绑定对象
      strategyObj: Object.assign({}, defaultStrategy),
      // 工单分配弹框
      distributionFlag: false,
      // 工单分配管理员数组
      admins: [],
      // 工单分配弹框绑定对象
      distributionObj: Object.assign({}, defaultDistribution),
      distributionSaveNode: null,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 主列表数据
      list: [],
      // 订单弹框绑定对象
      orderObj: {},
      // 订单弹框开关
      orderFlag: false
    }
  },
  computed: {
    getTime() {
      const that = this
      return function(time) {
        return time == null ? i18n.t('noInfo') : that.$moment(time).format('YYYY/MM/D  HH:mm')
      }
    },
    getWorkStatus() {
      return status.workStatus
    },
    getOrderStatus() {
      return status.orderStatus
    },
    getPrice() {
      return function (val) {
        return typeof val == 'number' ? `￥${(Math.round(val) * Math.pow(10, -2)).toFixed(2)}` : i18n.t('noData')
      }
    }
  },
  filters: {
    filterHospital(hospital) {
      return hospital === null ? i18n.t('noInfo') : hospital.name
    },
    filterWorker(worker) {
      return worker === null ? i18n.t('noInfo') : worker.name
    },
    filterInfo(info) {
      return info === null || info == '' ? i18n.t('noInfo') : info
    }
  },
  created() {
    this.initList(this.params)
    this.initStrategys()
    this.initAdmin()
  },
  methods: {
    // 初始化工单分配的管理员
    initAdmin() {
      adminApi.getAdminList({
        pkId: 0,
        sortMode: 'DESC',
        status: -1,
        size: 5000
      })
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.admins = res.data
            this.distributionDisabled = false
          } else {
            this.$message({
              message: this.$t('works.index.initAdminFail'),
              type: 'error',
              duration: 1500
            })
            this.distributionDisabled = true
          }
        })
        .catch(() => {
          this.$message({
            message: this.$t('works.index.initAdminFail'),
            type: 'error',
            duration: 1500
          })
          this.distributionDisabled = true
        })
    },
    // 初始化工单分配策略
    initStrategys() {
      this.initCurrentStrategy()
      api.getWorkStrategy()
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.strategys = res.data
            this.setStrategyDisabled = false
          } else {
            this.strategys = []
            this.setStrategyDisabled = true
          }
        })
        .catch(() => {
          this.strategys = []
          this.setStrategyDisabled = true
        })
    },
    // 获取当前工单分配策略
    initCurrentStrategy() {
      api.getWorkStrategyCurrent()
        .then(res => {
          if(res.code === 20000) {
            defaultStrategy.strategy = res.data.value
            this.strategyObj.strategy = res.data.value
          } else {
            this.$message({
              message: this.$t('works.index.initCurrentStrateFail'),
              type: 'error',
              duration: 1500
            })
          }
        })
        .catch(() => {
          this.$message({
              message: this.$t('works.index.initCurrentStrateFail'),
              type: 'error',
              duration: 1500
            })
        })
    },
    // 初始化列表数据
    initList(params) {
      this.loading = true
      api.getAllWorks(params)
        .then(res => {
          console.log(res.data)
          this.loading = false
          this.flag = false
          if (res.code === 20000) {
            this.list = res.data
            this.sortList()
            for(const item of this.list) {
              Vue.set(item, 'distributionFlag', false)
            }
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            })
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
    // 下一页
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
    // 上一页
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
    // 切换每页条数
    pageSizeChange(e) {
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 查看订单
    showOrderDetail(item) {
      this.orderObj = Object.assign({}, item)
      this.orderFlag = true
    },
    // 点击打开工单分配策略弹框
    showSetStrategy() {
      this.initCurrentStrategy()
      this.strategyFlag = true
    },
    handleSet() {
      if (this.strategyObj.strategy == defaultStrategy.strategy) {
        this.$message({
          message: this.$t('works.index.repeatStrategy'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      if (this.setStrategyFlag) {
        return
      }
      this.setStrategyFlag = true
      api.setWorkStrategy(this.strategyObj)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('works.index.setStrategySuc'),
              type: 'success',
              duration: 1500
            })
            this.strategyFlag = false
            this.initCurrentStrategy()
          } else {
            this.$message({
              message: this.$t('works.index.setStrategyFail'),
              type: 'success',
              duration: 1500
            })
          }
          this.setStrategyFlag = false
        })
        .catch(() => {
          this.$message({
            message: this.$t('works.index.setStrategyFail'),
            type: 'success',
            duration: 1500
          })
          this.setStrategyFlag = false
        })
    },
    cancelSet() {
      this.initCurrentStrategy()
      this.strategyFlag = false
    },
    // 点击分配打开分配弹框
    showDistribution(item) {
      this.distributionObj.workId = item.id
      this.distributionObj.adminId = item.worker.id
      this.distributionSaveNode = item
      this.distributionFlag = true
    },
    // 分配工单弹框选择管理员
    selectAdmin(e) {
      this.distributionObj.adminId = e
    },
    // 分配工单弹框确定
    handleDistribution() {
      if (this.distributionSaveNode.distributionFlag) {
        return
      }
      this.distributionSaveNode.distributionFlag = true
      api.distributeWork(this.distributionObj)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('works.index.distributionSuc'),
              type: 'success',
              duration: 1500
            })
            this.distributionSaveNode.distributionFlag = false
            this.distributionSaveNode = null
            this.initList(this.params)
            this.distributionFlag = false
          } else {
            this.$message({
              message: this.$t('works.index.distributionFail'),
              type: 'error',
              duration: 1500
            })
            this.distributionSaveNode.distributionFlag = false
          }
        })
        .catch(() => {
          this.$message({
            message: this.$t('works.index.distributionFail'),
            type: 'error',
            duration: 1500
          })
          this.distributionSaveNode.distributionFlag = false
        })
    },
    // 分配工单弹框取消
    cancelDistribution() {
      this.distributionSaveNode = null
      this.distributionFlag = false
    }
  }
}
</script>
<style lang="scss" scoped>
.operate-container {
  margin-top: 20px;
}

.table-container {
  margin-top: 20px;
}

.pagination-container {
  float: right;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.strate-select {
  width: 300px;
}
</style>
