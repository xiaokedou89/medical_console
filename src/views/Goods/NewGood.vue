<template>
<div class="add-category">
    <el-card class="container">
      <el-form ref="addForm" :model="addGoodsObj" :rules="rules" size="small" label-width="80px">
        <el-form-item :label="$t('name') + '：'" prop="name">
          <el-input v-model.trim="addGoodsObj.name" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('category') + '：'" prop="category.id">
          <el-select v-model="addGoodsObj.category.id" :placeholder="$t('rules.goodsCategory')" size="small" @change="selectChange">
            <el-option
              v-for="item in categoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('description') + '：'" prop="introduce">
          <el-input
            v-model.trim="addGoodsObj.introduce"
            maxlength="100"
            rows="5"
            show-word-limit
            type="textarea"
            style="width: 60%"
          />
        </el-form-item>
        <el-form-item :label="$t('image') + '：'">
          <div class="photo-container">
            <div class="photo-empty" v-if="!addGoodsObj.photo">
              <i class="photo-empty-icon el-icon-upload"></i>
              <span class="photo-empty-text">{{ $t('goods.index.uploadPhoto')}}</span>
            </div>
            <img ref="img" :class="{imageWidth: uploadStyle, imageHeight: !uploadStyle}"  :src="getImageUrl(addGoodsObj.photo)" v-else/>
          </div>
          <el-upload
            ref="photoForm"
            class="photo-upload"
            accept="image/png, image/jpg, image/jpeg"
            :limit="1"
            :action="getUploadUrl('common')"
            :headers="headers"
            :before-upload="beforeUpload"
            :on-progress="uploadProgress"
            :on-success="uploadSuc"
            :on-error="uploadFail"
            :on-remove="uploadRemove"
            :disabled="addGoodsObj.uploadDisabled"
            :show-file-list="addGoodsObj.showListFlag"
          >
            <div class="upload-group">
              <span class="upload-file-box" @click="handleUploadRemove">{{addGoodsObj.showPhotoName}}</span>
              <button type="button" class="upload-btn" @click="handleUploadRemove">{{ getUploadBtn }}</button>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('status') + '：'" prop="status">
          <el-tooltip effect="dark" placement="top" :content="getStatus(addGoodsObj.status)">
            <el-switch
              v-model="addGoodsObj.status"
              :active-value="1"
              :inactive-value="0"
            />
          </el-tooltip>
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleAddGoods">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="backToAddGoods">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
</div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Goods/goods.js'
import * as fileApi from '@/api/Medical/medical'
import * as status from '@/utils/status'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n'
const rules = {
    goodsNo: rule.rolenameRules,
    name: rule.rolenameRules,
    photo: rule.areaRules,
    "category.id": rule.areaRules
}
//
export default {
  name: 'NewGood',
  data() {
    return {
      uploadStyle: false,
      baseUrl: status.network.baseURL,
      fileUploadUrl: status.network.fileUploadURL,
      headers: {},
      // 商品分类列表
      categoryList: [],
      rules,
      addGoodsObj: {
          uploadProgressFlag: false,
          uploadDisabled: false,
          showListFlag: true,
          showPhotoName: '',
          id: null,
          name: '',
          introduce: '',
          status: 0,
          photo: '',
          category: {
            id: null,
            name: '',
            description: '',
            sort: 0
          }
      }
    }
  },
  created() {
    this.getToken()
    this.initCategoryList()
  },
  updated() {
    const _this = this
    let img = null
    if (this.$refs.img) {
      img = this.$refs.img
      img.onload = function () {
        _this.uploadStyle = img.naturalWidth > img.naturalHeight ? true : false
      }
    }
  },
  computed: {
    // 根据状态回显文字
    getStatus() {
      return status.goodStatus
    },
    getUploadUrl() {
      const that = this
      return function (type) {
        return that.baseUrl + that.fileUploadUrl + type
      }
    },
    getImageUrl() {
      return function (filename) {
        return status.network.baseURL + status.network.getFiles('common') + filename
      }
    },
    getUploadBtn() {
      return this.addGoodsObj.uploadDisabled ? i18n.t('delBtn') : i18n.t('goods.index.upload')
    }
  },
  methods: {
    getToken() {
      store.getters.token && (this.headers['authorization'] = getToken())
    },
    // 初始化商品分类列表
    initCategoryList() {
      api.getAllGoodsCategory()
      .then(res => {
        if (res.code === 20000) {
          this.categoryList = res.data
        }
      })
      .catch(err => {
        this.$message({
          message: this.$t('goods.newGoods.initCategoryFail'),
          type: 'error',
          duration: 1500
        })
      })
    },
    // 分类下拉选择值改变事件
    selectChange(e) {
      this.addGoodsObj.category.name = this.getItem(e).name
      this.addGoodsObj.category.description = this.getItem(e).description
      this.addGoodsObj.category.sort = this.getItem(e).sort
    },
    // 根据分类下拉框选中值获取索引值
    getItem(id) {
      for (let [index, item] of this.categoryList.entries()) {
        if (item.id === id) {
          return item
        }
      }
    },
    // 上传图片前回调
    beforeUpload(file) {
      if (this.addGoodsObj.uploadProgressFlag) {
        this.$message({
          message: this.$t('medical.medicalOrders.uploadingWarn'),
          type: 'warning',
          duration: 1500
        })
        return !this.addGoodsObj.uploadProgressFlag
      }
      let extension = file.name.substring(file.name.lastIndexOf('.') + 1),
          size = file.size,
          extensionFlag = (extension === 'jpg' || extension === 'png' || extension === 'jpeg') && size <= 20 * 1024 * 1024 ? true : false
      if (!extensionFlag) {
        this.$message({
          message: this.$t('goods.index.fileTypeWarn'),
          type: 'warning',
          duration: 1500
        })
      }
      return extensionFlag
    },
    // 上传中回调
    uploadProgress() {
      this.addGoodsObj.uploadProgressFlag = true
    },
    // 上传成功回调
    uploadSuc(e) {
      this.addGoodsObj.uploadProgressFlag = false
      if (e.code === 20000) {
        this.addGoodsObj.showPhotoName = e.data.oldFilename
        this.addGoodsObj.uploadDisabled = true
        this.addGoodsObj.showListFlag = false
        this.addGoodsObj.photo = e.data.filename
      } else {
        this.$refs.photoForm.clearFiles()
        this.$message({
          message: e.message || this.$t('goods.index.uploadFail'),
          type: 'error',
          duration: 1500
        })
      }
    },
    // 上传失败回调
    uploadFail(e) {
      this.addGoodsObj.uploadProgressFlag = false
      this.$message({
        message: e.message || this.$t('goods.index.uploadFail'),
        type: 'error',
        duration: 1500
      })
    },
    // 上传中移除文件
    uploadRemove() {
      this.addGoodsObj.uploadProgressFlag = false
    },
    handleUploadRemove() {
      if (!this.addGoodsObj.uploadDisabled) {
        return
      }
      fileApi.delFile('common',{
        filename: this.addGoodsObj.photo
      })
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message:  this.$t('goods.index.delPhotoSuc'),
              type: 'success',
              duration: 1500
            })
            this.$refs.photoForm.clearFiles()
            this.addGoodsObj.showListFlag = true
            this.addGoodsObj.uploadDisabled = false
            this.addGoodsObj.showPhotoName = ''
            this.addGoodsObj.photo = ''
          }
        })
        .catch(err => {
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          })
        })
    },
    // 点击确定事件
    handleAddGoods() {
      this.$refs.addForm.validate(valid => {
        if (valid) {
          api.addGoods(this.addGoodsObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.$router.push('/goods/addgoods')
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
            type: 'error',
            duration: 1500
          })
        }
      })
    },
    // 点击取消事件
    backToAddGoods() {
      this.$router.push('/goods/addgoods')
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
.photo-container {
  width: 200px;
  height: 150px;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  .imageWidth {
    width: 200px;
    height: auto;
    max-height: 150px;
  }
  .imageHeight {
    height: 150px;
    width: auto;
    max-width: 200px;
  }
  .photo-empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #ccc;
    .photo-empty-icon {
      font-size: 50px;
    }
  }
}
.photo-upload {
  margin-top: 10px;
  .upload-group {
    width: 200px;
    position: relative;
    .upload-file-box {
      text-align: left;
      display: inline-block;
      box-sizing: border-box;
      width: 100%;
      height: 32px;
      line-height: 32px;
      padding-left: 11px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .upload-btn {
      position: absolute;
      right: -1px;
      top: 0;
      width: 50px;
      height: 32px;
      background: #1890ff;
      color: #fff;
      border: 0;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
</style>
