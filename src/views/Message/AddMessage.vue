<template>
  <div class="message-container">
    <el-card class="form-container">
      <el-form
        ref="messageForm"
        class="message-form"
        :model="messageObj"
        :rules="rules"
        label-width="150px"
        size="small"
      >
        <el-form-item prop="title" :label="$t('message.title')">
          <el-input v-model.trim="messageObj.title" :placeholder="$t('message.titlePlace')"></el-input>
        </el-form-item>
        <el-form-item prop="content" :label="$t('message.content')">
          <el-input type="textarea" :rows="10" resize="vertical" v-model="messageObj.content" :placeholder="$t('message.contentPlace')"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" :loading="loading" @click="addMessage">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="resetMessage">{{ $t('cancelBtn') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as rule from '@/utils/rules.js'
import * as api from '@/api/Message/message.js'
const defaultMessage = {
  id: null,
  createTime: null,
  title: '',
  content: '',
  tmeplateKey: null
}

const rules = {
  title: rule.areaRules,
  content: rule.areaRules
}

export default {
  name: 'Message',
  data() {
    return {
      rules,
      addFlag: false,
      loading: false,
      messageObj: Object.assign({}, defaultMessage)
    }
  },
  methods: {
    addMessage() {
      if (this.addFlag) {
        return
      }
      this.addFlag = true
      this.$refs.messageForm.validate(valid => {
        if (valid) {
          this.loading = true
          api.addMessage(this.messageObj)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.addFlag = false
                this.$message({
                  message: this.$t('message.addMesSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.loading = false
                this.messageObj = Object.assign({}, defaultMessage)
                this.$router.back(-1)
              } else {
                this.addFlag = false
                this.$message({
                  message: this.$t('message.addMesFail'),
                  type: 'error',
                  duration: 1500
                })
                this.loading = false
              }
            })
            .catch(err => {
              this.loading = false
              this.addFlag = false
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
            })
        } else {
          this.addFlag = false
          this.$message({
            message: this.$t('validFailMes'),
            type: 'warning',
            duration: 1500
          })
        }
      })
    },
    resetMessage() {
      this.$router.back(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
.message-container {
  padding: 30px;
  .form-container {
    margin: 10px auto;
    width: 70%;
  }
}
</style>
