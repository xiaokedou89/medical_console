<template>
  <div class="add-role">
    <el-card class="container">
      <el-form ref="roleForm" :model="addRole" label-position="right" :rules="rules" size="small" class="sysuserFormRef" label-width="100px">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="addRole.name" :placeholder="$t('manage.roles.rolesPlace')" style="width: 70%" />
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="notes">
          <el-input v-model.trim="addRole.notes" :placeholder="$t('manage.roles.descriptionPlace')" style="width: 70%" />
        </el-form-item>
        <!-- <el-form-item :label="$t('userType') + '：'" prop="userType">
          <el-select v-model="addRole.userType" clearable :placeholder="$t('userTypePlace')" @change="selectChange">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item> -->
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="deal">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancel">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Roles/roles'
import * as status from '@/utils/status'
const rules = {
  name: rule.rolenameRules,
  notes: rule.rolenameRules,
  userType: rule.areaRules
}
const defaultRole = {
  id: null,
  name: '',
  notes: '',
  userType: 6
}
export default {
  name: 'AddRole',
  data() {
    return {
      rules,
      // 用户类型下拉选择框绑定数组
      options: status.userTypeArr,
      // 点击确定添加防抖开关
      addFlag: false,
      addRole: Object.assign({}, defaultRole)
    }
  },
  methods: {
    selectChange(e) {
      console.log(e)
      console.log(this.addRole.userType)
    },
    cancel() {
      this.$router.push('/manage/roles')
    },
    deal() {
      if (this.addFlag) {
        return
      }
      this.addFlag = true
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          api.addRoles(this.addRole)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.addFlag = false
                this.$router.push('/manage/roles')
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.addFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.addFlag = false
        }
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
