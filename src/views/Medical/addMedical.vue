<template>
  <div class="add-medical">
    <!-- 体检中心信息 -->
    <el-card class="form-container">
      <el-form
        ref="medicalForm"
        :model="medicalObj"
        :rules="rules"
        class="medical-form"
        label-width="150px"
        size="small"
      >
        <el-form-item prop="username" :label="$t('medical.addMedical.username') + ':'">
          <el-input v-model.trim="medicalObj.username" :placeholder="$t('medical.addMedical.usernamePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="password" :label="$t('medical.addMedical.password') + ':'">
          <el-input v-model.trim="medicalObj.password" :placeholder="$t('medical.addMedical.passwordPlace')" class="input-width" :clearable="true" show-password/>
        </el-form-item>
        <el-form-item prop="repeatPassword" :label="$t('medical.addMedical.repeatPassword') + ':'">
          <el-input v-model.trim="medicalObj.repeatPassword" :placeholder="$t('medical.addMedical.repeatPasswordPlace')" class="input-width" :clearable="true" show-password/>
        </el-form-item>
        <el-form-item prop="name" :label="$t('medical.addMedical.name') + ':'">
          <el-input v-model.trim="medicalObj.name" :placeholder="$t('medical.addMedical.namePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="organization" :label="$t('medical.addMedical.organization') + ':'">
          <el-input v-model.trim="medicalObj.organization" :placeholder="$t('medical.addMedical.organizationPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="phone" :label="$t('medical.addMedical.phone') + ':'">
          <el-input v-model.trim="medicalObj.phone" :placeholder="$t('medical.addMedical.phonePlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item prop="email" :label="$t('medical.addMedical.email') + ':'">
          <el-input v-model.trim="medicalObj.email" :placeholder="$t('medical.addMedical.emailPlace')" class="input-width" :clearable="true" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" :loading="loading" @click="handleAdd">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAdd">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as api from '@/api/Medical/medical'
import * as rule from '@/utils/rules'

const defaultMedical = {
  id: null,
  name: '',
  organization: '',
  phone: undefined,
  status: 0,
  username: '',
  password: '',
  repeatPassword: '',
  email: ''
}

const rules = {
  username: rule.medicalUsernameRules,
  password: rule.passwordRules,
  repeatPassword: rule.passwordRules,
  name: rule.nameRules,
  organization: rule.organizationRules,
  phone: rule.freephoneRules,
  email: rule.emailRules
}

export default {
  name: 'addMedical',
  data() {
    return {
      rules,
      loading: false,
      addFlag: false,
      // 表单绑定对象
      medicalObj: Object.assign({}, defaultMedical)
    }
  },
  methods: {
    handleAdd() {
      if (this.addFlag) {
        return
      }
      if (this.medicalObj.password != this.medicalObj.repeatPassword) {
        this.$message({
          message: this.$t('medical.addMedical.repeatFail'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      this.addFlag = true
      this.$refs.medicalForm.validate(valid => {
        if (valid) {
          this.loading = true
          api.addMedical(this.medicalObj)
            .then(res => {
              if (res.code === 20000) {
                this.addFlag = false
                this.$message({
                  type: 'success',
                  message: this.$t('medical.addMedical.addSucMes'),
                  duration: 1500
                })
                this.loading = false
                this.$router.back()
              }
            })
            .catch(err => {
              this.loading = false
              this.addFlag = false
              this.$message({
                type: 'error',
                message: err,
                duration: 1500
              })
            })
        } else {
          this.addFlag = false
          this.$message({
            type: 'error',
            message: this.$t('validFailMes'),
            duration: 1500
          })
        }
      })
    },
    cancelAdd() {
      this.$router.back()
    }
  }
}
</script>
<style lang="scss" scoped>
.add-medical {
  padding: 30px;
  .form-container {
    margin: 10px auto;
    padding-left: 80px;
    width: 70%;
    .input-width {
      width: 60%;
    }
  }
}
</style>
