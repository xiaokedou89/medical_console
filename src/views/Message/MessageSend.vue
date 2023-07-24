<template>
  <div class="send-container">
    <!-- 功能列表 -->
    <el-card class="operate-container">
      <i class="el-icon-tickets"></i>
      <span>{{ $t('message.sendOperate') }}</span>
      <el-button type="primary" style="float: right; margin: 0px 5px" size="small" @click="send">{{ $t('message.submit') }}</el-button>
    </el-card>
    <!-- 主列表 -->
    <div class="table-container">
      <el-table
        ref="sendTable"
        v-loading="loading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="tableSelect"
      >
        <el-table-column align="center" type="selection" />
        <el-table-column align="center" :label="$t('username')">
          <template slot-scope="scope">
            <el-button type="text" @click="showPatientDetail(scope.row)">{{ scope.row.username }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="name" :label="$t('name')" />
        <el-table-column align="center" :label="$t('sex')">
          <template slot-scope="scope">
            {{ getSex(scope.row.sex) }}
          </template>
        </el-table-column>
        <el-table-column align="center" prop="age" :label="$t('age')" />
      </el-table>
      <!--分页-->
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!--详情弹出框-->
    <el-dialog :title="$t('patients.index.patientDetail')" :visible.sync="detailFlag" v-if="detailFlag" width="30%">
      <el-form
        :model="detailObj"
        label-width="100px"
        label-position="right"
      >
        <el-form-item :label="$t('username') + '：'">
          <span>
            {{ detailObj.username }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('name') + '：'">
          <span>
            {{ detailObj.name }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('nickName') + '：'">
          <span>
            {{ detailObj.nickName }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('age') + '：'">
          <span>
            {{ detailObj.age }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('sex') + '：'">
          <span>
            {{ getSex(detailObj.sex) }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('status') + '：'">
          <span>
            {{ getStatus(detailObj.status) }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('email') + '：'">
          <span>
            {{ detailObj.email }}
          </span>
        </el-form-item>
        <el-form-item :label="$t('phone') + '：'">
          <span>
            {{ detailObj.phone }}
          </span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as status from '@/utils/status.js'
import * as mesApi from '@/api/Message/message.js'
import * as PatientApi from '@/api/Patient/patient.js'
import pagination from '@/components/common/pagination/pagination.vue'
const defaultParams = {
  pkId: 0,
  sortMode: 'DESC',
  size: status.size,
  status: -1
}

export default {
  name: 'Message-send',
  components: {
    pagination
  },
  data() {
    return {
      messageId: null,
      loading: false,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      sendFlag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 详情弹框绑定对象
      detailObj: {},
      // 详情弹框开关
      detailFlag: false,
      // 主列表数据
      list: [],
      // 列表勾选项的数组
      tableSelections: []
    }
  },
  created() {
    if (this.$route.query.messageId != null && this.$route.query.messageId != undefined) {
      this.messageId = +this.$route.query.messageId
    } else {
      this.$message({
        message: this.$t('message.initMesFail'),
        type: 'error',
        duration: 1500
      })
      this.$router.back(-1)
    }
    this.initList(this.params)
  },
  computed: {
    getSex() {
      return status.sex
    },
    getStatus() {
      return status.patientStatus
    }
  },
  methods: {
    initList(params) {
      this.loading = true
      PatientApi.getAllPatient(params)
        .then(res => {
          if (res.code === 20000) {
            this.list = res.data
            this.loading = false
            this.sortList()
            this.flag = false
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
    showPatientDetail(item) {
      this.detailObj = Object.assign({}, item)
      this.detailFlag = true
    },
    tableSelect(e) {
      let list = []
      if (e.length > 0) {
        for (const item of e) {
          let { id, userType } = item
          list.push({
            userId: id,
            userType,
            messageId: this.messageId
          })
        }
      }
      this.tableSelections = list
    },
    send() {
      if (this.tableSelections.length == 0) {
        this.$message({
          message: this.$t('message.sendWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      if (this.sendFlag) {
        return
      }
      this.sendFlag = true
      mesApi.sendMessage(this.tableSelections)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('message.sendSuc'),
              type: 'success',
              duration: 1500
            })
            this.sendFlag = false
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          this.sendFlag = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.send-container {
  padding: 30px;
}
.table-container {
  margin-top: 30px;
  width: 100%;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
</style>
