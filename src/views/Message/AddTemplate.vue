<template>
  <div class="add-template">
    <el-card class="form-container">
      <el-form
        ref="templateForm"
        class="template-form"
        label-width="150px"
        size="small"
        :model="templateObj"
        :rules="rules"
      >
        <el-form-item prop="titleTemplate" :label="$t('message.titleTemplate') + '：'">
          <el-input v-model="templateObj.titleTemplate" :placeholder="$t('message.titleTemplatePlace')" />
        </el-form-item>
        <el-form-item prop="description" :label="$t('description') + '：'">
          <el-input v-model="templateObj.description" :placeholder="$t('descriptionPlace')" />
        </el-form-item>
        <el-form-item prop="keyword" :label="$t('message.keyword') + '：'">
          <el-input v-model="templateObj.keyword" :placeholder="$t('message.keywordPlace')" />
        </el-form-item>
        <el-form-item prop="contentTemplate" :label="$t('message.contentTemplate') + '：'">
          <el-input type="textarea" :row="10" resize="vertical" v-model="templateObj.contentTemplate" :placeholder="$t('message.contentTemplatePlace')" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" :loading="loading" @click="addTemplate">{{ $t('confirmBtn') }}</el-button>
          <el-button size="small" @click="cancel">{{ $t('cancelBtn') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
import * as rule from '@/utils/rules.js'
import * as api from '@/api/Message/message.js'
const rules = {
  titleTemplate: rule.areaRules,
  keyword: rule.areaRules,
  contentTemplate: rule.areaRules
}

const defaultTemplate = {
  id: null,
  contentTemplate: '',
  description: '',
  keyword: '',
  titleTemplate: ''
}

export default {
  name: 'add-template',
  data() {
    return {
      rules,
      addFlag: false,
      loading: false,
      templateObj: Object.assign({}, defaultTemplate)
    }
  },
  methods: {
    addTemplate() {
      if (this.addFlag) {
        return
      }
      this.addFlag = true
      this.$refs.templateForm.validate(valid => {
        if (valid) {
          this.loading = true
          api.addTemplate(this.templateObj)
            .then(res => {
              console.log(res)
              if (res.code === 20000) {
                this.addFlag = false
                this.$message({
                  message: this.$t('message.addTemSuc'),
                  type: 'success',
                  duration: 1500
                })
                this.loading = false
                this.$router.back(-1)
              } else {
                this.addFlag = false
                this.$message({
                  message: this.$t('message.addTemFail'),
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
    cancel() {
      this.$router.back(-1)
    }
  }
}
</script>
<style lang="scss" scoped>
.add-template {
  padding: 30px;
  .form-container {
    border: 1px solid #e6ebf5;
    border-radius: 5px;
    padding: 30px 20px;
    width: 50%;
    margin: 20px auto;
  }
}
</style>
