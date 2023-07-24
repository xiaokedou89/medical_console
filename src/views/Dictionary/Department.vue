<template>
  <div class="department">
    <!--筛选框-->
    <el-card class="filter-container" shadow="never">
      <div style="margin-top: 30px">
        <el-form :inline="true" size="small">
          <el-form-item label="名称筛选:">
            <el-input
              v-model="sysuserCondition"
              type="primary"
              size="small"
              placeholder="请输入医院名称"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!--功能列表-->
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets" />
      <span>{{ initHospitalObj.name }} - 科室列表</span>
      <el-button style="float: right; margin: 0px 5px" size="small" type="danger">删除</el-button>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="toAddDepartment(initHospitalObj, initDepartmentArr)">添加</el-button>
    </el-card>
    <!--主列表-->
    <el-row class="table-containter">
      <el-col :span="24">
        <el-table :data="initDepartmentArr" style="width: 100%" border>
          <el-table-column align="center" type="selection" />
          <el-table-column align="center" prop="name" label="名称">
            <template slot-scope="scope">
              <el-button type="text" @click="showSetDialog(scope.$index)">{{ scope.row.name }}</el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="description" label="描述">
            <template slot-scope="scope">
              <span>{{ scope.row.description }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!--编辑医院弹框-->
    <el-dialog :visible.sync="showSetDepartment" title="编辑" width="50%">
      <el-form :model="initDepartmentArr[setDepartmentIndex]" :rules="rules" label-width="100px" label-position="right">
        <el-form-item label="名称：" prop="name">
          <el-input v-model.trim="initDepartmentArr[setDepartmentIndex].name" placeholder="请输入科室名称" style="width: 60%" />
        </el-form-item>
        <el-form-item label="描述：" prop="description">
          <el-input v-model.trim="initDepartmentArr[setDepartmentIndex].description" placeholder="请输入科室描述" style="width: 60%" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="showSetDepartment = false">确 定</el-button>
          <el-button size="small" @click="showSetDepartment = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
const rules = {
  name: rule.rolenameRules,
  description: rule.descriptionRules
}
export default {
  name: 'Department',
  data() {
    return {
      rules,
      setDepartmentIndex: 0,
      showSetDepartment: false,
      sysuserCondition: '',
      initHospitalObj: null,
      initDepartmentArr: []
    }
  },
  created() {
    this.initHospitalObj = this.$store.state.department.obj
    this.initDepartmentArr = this.$store.state.department.arr
  },
  methods: {
    showSetDialog(index) {
      this.showSetDepartment = true
      this.setDepartmentIndex = index
    },
    toAddDepartment(obj, arr) {
      this.$router.push({
        path: '/dictionary/adddepartment'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.department {
  padding: 30px;
}
.operate-container {
  margin-top: 20px;
}
.table-containter {
  margin-top: 20px;
}
</style>
