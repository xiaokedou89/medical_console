<template>
  <div class="add-department">
    <div class="container">
      <el-form :model="addDepartmentObj" :rules="rules" label-width="100px" label-position="right">
        <el-form-item label="名称：" prop="name">
          <el-input v-model.trim="addDepartmentObj.name" placeholder="请输入科室名称" style="width: 60%" />
        </el-form-item>
        <el-form-item label="描述：" prop="description">
          <el-input v-model.trim="addDepartmentObj.description" placeholder="请输入科室描述" style="width: 60%" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleBack()">确 定</el-button>
          <el-button size="small" @click="handleBack()">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
const rules = {
  name: rule.rolenameRules,
  description: rule.descriptionRules,
  address: rule.addressRules
}
export default {
  name: 'AddDepartment',
  data() {
    return {
      rules,
      addDepartmentObj: {
        name: '',
        description: ''
      }
    }
  },
  created() {
    this.initHospitalObj = this.$route.query.obj
    this.initDepartmentArr = this.$route.query.arr
  },
  methods: {
    handleBack(obj, arr) {
      this.$router.push({
        path: '/dictionary/department'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  border: 1px solid #e6ebf5;
  border-radius: 5px;
  padding: 30px 20px;
  width: 50%;
  margin: 20px auto;
}
.input-width {
  width: 60%;
}
</style>
