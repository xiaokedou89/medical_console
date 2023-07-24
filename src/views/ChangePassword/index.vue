<template>
  <div class="personal">
    <el-card class="container">
      <el-form ref="resetForm" :model="passwordObj" :rules="rules" label-width="120px" label-position="right">
        <el-form-item prop="oldPassword" :label="$t('oldPassword') + ':'">
          <el-input v-model.trim="passwordObj.oldPassword" :placeholder="$t('oldPassPlace')" class="input-width" :clearable="true" show-password />
        </el-form-item>
        <el-form-item prop="newPassword" :label="$t('newPassword') + ':'">
          <el-input v-model.trim="passwordObj.newPassword" :placeholder="$t('newPassPlace')" class="input-width" :clearable="true" show-password />
        </el-form-item>
        <el-form-item prop="repeatPassword" :label="$t('medical.addMedical.repeatPassword') + ':'">
          <el-input v-model.trim="passwordObj.repeatPassword" :placeholder="$t('medical.addMedical.repeatPasswordPlace')" class="input-width" :clearable="true" show-password />
        </el-form-item>
        <el-form-item class="reset-btn-group">
          <el-button type="primary" size="small" @click="handleReset">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="back">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
// resetPassword
import * as rule from '@/utils/rules'
import * as api from '@/api/Admin/admin'
import { getUserId } from '@/utils/auth'
const rules = {
  oldPassword: rule.unpasswordRules,
  newPassword: rule.passwordRules,
  repeatPassword: rule.passwordRules
}
export default {
  name: 'Personal',
  data() {
    return {
      flag: false,
      userId: '',
      rules,
      passwordObj: {
        oldPassword: '',
        newPassword: ''
      }
    }
  },
  created() {
    if (typeof this.$store.state.user.userId === 'number') {
      this.userId = this.$store.state.user.userId
    } else {
      this.userId = +getUserId()
    }
  },
  methods: {
    handleReset() {
      if (this.flag) {
        return
      }
      if (this.passwordObj.newPassword != this.passwordObj.repeatPassword) {
        this.$message({
          message: this.$t('medical.addMedical.repeatFail'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.flag = true
      this.$refs.resetForm.validate(valid => {
        if (valid) {
          api.resetPassword(this.userId, this.passwordObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('resetPasswordSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.flag = false
                this.$router.back(-1)
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.flag = false
            })
        } else {
          this.$message({
            message: this.$t('resetPasswordFail'),
            type: 'warning',
            duration: 1500
          })
          this.flag = false
        }
      })
    },
    back() {
      this.$router.go(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
.personal {
  padding: 30px;
}
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
