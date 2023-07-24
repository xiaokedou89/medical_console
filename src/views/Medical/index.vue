<template>
  <div class="mec-container">
    <!-- 筛选功能部分 -->
    <el-card class="filter-container">
      <div class="filter-box" style="margin-top: 20px">
        <el-form :inline="true" size="small">
          <el-form-item :label="$t('medical.index.statusFilterTitle') + ':'">
            <el-select v-model="params.status" :placeholder="$t('agent.index.statusFilterPlace')" @change="statusQueryChange">
              <el-option
                v-for="item in medicalStatusArr"
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
      <span>{{$t('agent.index.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="linkToAdd">{{$t('addBtn')}}</el-button>
    </el-card>
    <!-- 主列表 -->
    <el-row class="table-container">
      <el-col :span="24">
        <el-table ref="multipleTable" v-loading="loading" :data="list" style="width: 100%" border>
          <el-table-column align="center" :label="$t('username')">
            <template slot-scope="scope">
              <el-button type="text" @click="showMedicalDetail(scope.row)">
                {{ scope.row.username }}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('name')">
            <template slot-scope="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column align="center" prop="organization" :label="$t('medical.index.organization')" />
          <el-table-column align="center" :label="$t('status')">
            <template slot-scope="scope">
              <el-tooltip effect="dark" placement="top" :open-delay="400" :content="getStatus(scope.row.status)">
                <el-switch v-model="scope.row.status" :disabled="scope.row.statusFlag" :active-value="1" :inactive-value="0" @change="changeStatus($event, scope.row)" />
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="$t('action')">
            <template slot-scope="scope">
              <el-button type="text" @click="showUserInfo(scope.row)">{{ $t('medical.index.userInfoBtn')}}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-container">
          <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
        </div>
      </el-col>
    </el-row>
    <!-- 详情弹框 -->
    <el-dialog :title="$t('medical.index.medicalDetailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="120px" label-position="right">
        <el-form-item :label="$t('medical.index.detailUsername') + '：'">
          <span>{{ detailObj.username }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.index.detailName') + '：'">
          <span>{{ detailObj.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.index.organization') + '：'">
          <span>{{ detailObj.organization }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.index.detailPhone') + '：'">
          <span>{{ detailObj.phone }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.index.detailEmail') + '：'">
          <span>{{ detailObj.email }}</span>
        </el-form-item>
        <el-form-item :label="$t('status') + '：'">
          <span>{{ getStatus(detailObj.status) }}</span>
        </el-form-item>
        <el-form-item :label="$t('medical.index.detailCreateTime') + '：'">
          <span>{{ getTime(detailObj.createTime) }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 修改用户信息弹框 -->
    <el-dialog :title="$t('medical.index.userInfoTitle')" :before-close="userInfoClosing" :visible.sync="userInfoFlag" v-if="userInfoFlag" width="40%">
      <el-form ref="userInfoForm" :rules="rules" :model="userInfo" label-width="120px" label-position="right">
        <el-form-item prop="name" :label="$t('medical.addMedical.name') + '：'">
          <el-input v-model="userInfo.name" :placeholder="$t('medical.addMedical.namePlace')" />
        </el-form-item>
        <el-form-item prop="organization" :label="$t('medical.addMedical.organization') + '：'">
          <el-input v-model="userInfo.organization" :placeholder="$t('medical.addMedical.organizationPlace')" />
        </el-form-item>
        <el-form-item prop="phone" :label="$t('medical.addMedical.phone') + '：'">
          <el-input v-model="userInfo.phone" :placeholder="$t('medical.addMedical.phonePlace')" />
        </el-form-item>
        <el-form-item prop="email" :label="$t('medical.addMedical.email') + '：'">
          <el-input v-model="userInfo.email" :placeholder="$t('medical.addMedical.emailPlace')" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="userInfoConfirm">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="userInfoCancel">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as status from '@/utils/status'
import * as api from '@/api/Medical/medical'
import * as rule from '@/utils/rules.js'
import * as mesApi from '@/api/Message/message'
import Vue from 'vue'
import pagination from '@/components/common/pagination/pagination.vue'

// 表单验证规则
const rules = {
  name: rule.nameRules,
  organization: rule.organizationRules,
  phone: rule.freephoneRules,
  email: rule.emailRules
}

const defaultParams = {
  size: status.size,
  pkId: 0,
  sortMode: 'DESC',
  status: 1
}

const defaultUserInfo = {
  name: '',
  organization: '',
  phone: '',
  email: ''
}

export default {
  name: 'medical-center',
  components: {
    pagination
  },
  data() {
    return {
      rules,
      // 主列表保存的最小id
      minId: 0,
      // 主列表保存的最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      statusQueryFlag: false,
      // 拉取列表传入的参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 主列表数据
      list: [],
      // 详情弹框开关
      detailFlag: false,
      // 详情弹框绑定对象
      detailObj: {},
      // 用户信息弹框开关
      userInfoFlag: false,
      // 用户信息绑定对象
      userInfo: Object.assign({}, defaultUserInfo),
      // 状态筛选框数组
      medicalStatusArr: status.medicalStatusArr
    }
  },
  computed: {
    getStatus() {
      return status.doctorStatus
    },
    getTime() {
      const that = this
      return function(time) {
        return that.$moment(time).format('YYYY/MM/D  HH:mm')
      }
    }
  },
  created() {
    this.initList(this.params)
    // mesApi

  },
  methods: {
    // 初始化列表数据
    initList(params) {
      this.loading = true
      api.getMedicals(params)
        .then(res => {
          if (res.code === 20000) {
            for (let item of res.data) {
              Vue.set(item, 'statusFlag', false)
              Vue.set(item, 'setPasswordFlag', false)
            }
            this.list = res.data
            console.log(this.list)
            this.loading = false
            this.statusQueryFlag = false
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
            if (this.statusQueryFlag) {
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
          this.statusQueryFlag = false
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
    // 点击下一页
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
    // 点击上一页
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
    // 分页显示个数改变事件
    pageSizeChange(e) {
      this.params.size = e
      this.params.pkId = 0
      this.params.sortMode = 'DESC'
      this.pageCount = 1
      this.initList(this.params)
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
    // 体检中心状态筛选框值改变事件
    statusQueryChange(e) {
      this.statusQueryFlag = true
      if (typeof e === 'number') {
        this.params.status = e
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
    // 点击添加按钮跳转到添加页面
    linkToAdd() {
      this.$router.push('/mec/addmedical')
    },
    // 点击账号显示详情弹框
    showMedicalDetail(item) {
      this.detailObj = Object.assign({}, item)
      this.detailFlag = true
    },
    // 修改账号状态事件
    changeStatus(e, item) {
      if (item.statusFlag) {
        return
      }
      item.statusFlag = true
      api.setMedicalStatus(item.id, e)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('medical.index.setStatusSucMes'),
              type: 'success',
              duration: 1500
            })
            item.statusFlag = false
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
          item.status = e == 0 ? 1 : 0
          item.statusFlag = false
        })
    },
    // 点击修改信息打开弹框
    showUserInfo(item) {
      this.userInfo = Object.assign({}, item)
      this.userInfoFlag = true
    },
    // 修改信息弹框点击确定
    userInfoConfirm() {
      this.$refs.userInfoForm.validate(valid => {
        if (valid) {
          api.setMedical(this.userInfo)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('medical.index.setUserInfoSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.userInfoFlag = false
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
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'warning',
            duration: 1500
          })
        }
      })
    },
    // 修改信息弹框点击取消
    userInfoCancel() {
      this.userInfoFlag = false
    },
    userInfoClosing(done) {
      this.$refs.userInfoForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
.mec-container {
  padding: 30px;
}
.operate-container {
  margin-top: 30px;
}
.table-container {
  margin-top: 30px;
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
</style>
