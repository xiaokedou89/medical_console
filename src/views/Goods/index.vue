<template>
  <div class="goods-container">
    <!--筛选框-->
    <el-card class="filter-container">
      <div style="margin-top: 30px">
        <el-form :inline="true" :model="queryPage" size="small">
          <el-form-item :label="$t('categoryFilter')">
            <el-select v-model="queryPage.categoryId" :placeholder="$t('categoryFilterPlace')" @change="categorySelect" clearable>
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('goods.index.operateTitle')}}</span>
    </el-card>
    <!--主列表-->
    <div class="table-container">
      <el-table
        v-loading="loading"
        ref="brandTable"
        :data="list"
        style="width: 100%"
        border
      >
        <!-- <el-table-column type="selection" width="60" /> -->
        <el-table-column align="center" prop="id" :label="$t('orderNo')" width="180">
          <template slot-scope="scope">
            <el-button
              type="text"
              class="table-btn-font table-btn-color"
              @click="showDetail(scope.row)"
            >{{ scope.row.id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="name"
          :label="$t('name')"
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('image')">
          <template slot-scope="scope">
            <!-- <el-button @click="showPhoto(scope.row)">
              <span v-if="!scope.row.photo">{{ $t('goods.index.uploadPhoto')}}</span>
              <el-image
                v-else
                style="height: 80px"
                :src="getImageUrl(scope.row.photo)"
              >
              </el-image>
            </el-button> -->
            <span v-if="!scope.row.photo">{{ $t('goods.index.noPhoto')}}</span>
            <el-image
              v-else
              style="height: 80px"
              :src="getImageUrl(scope.row.photo)"
            >
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="status" align="center" :label="$t('status')" width="100">
          <template slot-scope="scope">
            <span>{{ getStatus(scope.row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="category.name"
          :label="$t('category')"
        >
          <template slot-scope="scope">
            {{ getMessage(scope.row.category, 'name') }}
          </template>
        </el-table-column>
        <el-table-column align="center" :label="$t('price')+$t('yuan')" width="100">
          <template slot-scope="scope">
            <el-button type="text" @click="showPriced(scope.row)">
              {{ scope.row.priceObj | filterPrice }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <pagination :page-count="pageCount" @next="nextPage" @prev="prevPage" @selectchange="pageSizeChange" />
      </div>
    </div>
    <!-- 商品价格弹框 -->
    <el-dialog :title="$t('goodsPrice')" :visible.sync="pricedFlag" v-if="pricedFlag" width="40%">
      <el-form ref="priceForm" :model="pricedObj" :rules="rules" label-width="120px" label-position="right">
        <el-form-item :label="$t('price') + $t('yuan') +'：'" prop="price">
          <el-input-number v-model="pricedObj.price" :precision="2" :step="1" :min="0" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--商品详情弹框-->
    <el-dialog :title="$t('goodsDetail')" :visible.sync="detailFlag" v-if="detailFlag" width="40%">
      <el-form :model="detailObj" label-width="120px" label-position="right">
        <el-form-item :label="$t('orderNo') + '：'">
          <span>{{ detailObj.id }}</span>
        </el-form-item>
        <el-form-item :label="$t('name') + '：'">
          <span>{{ detailObj.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('description') + '：'">
          <span>{{ detailObj.introduce }}</span>
        </el-form-item>
        <el-form-item :label="$t('category') + '：'">
          <span>{{ getMessage(detailObj.category, 'name') }}</span>
        </el-form-item>
        <el-form-item :label="$t('image') + '：'">
          <img style="height: 80px;width: auto;" :src="getImageUrl(detailObj.photo)">
        </el-form-item>
        <el-form-item :label="$t('status') + '：'">
          <span>{{ getStatus(detailObj.status) }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 商品上传图片弹框 -->
    <el-dialog :title="$t('goods.index.goodsPhoto')"
      :visible.sync="photoFlag"
      v-if="photoFlag"
      width="40%"
      :before-close="photoDialogClose"
    >
      <div class="photo-dialog-container">
        <div class="photo-show">
          <div class="photo-empty" v-if="!photoObj.photo">
            <i class="photo-empty-icon el-icon-upload"></i>
            <span class="photo-empty-text">{{ $t('goods.index.uploadPhoto') }}</span>
          </div>
          <img ref="img" :class="{imageWidth: uploadStyle, imageHeight: !uploadStyle}" :src="getImageUrl(photoObj.photo)" v-else />
        </div>
        <el-upload
          class="photo-upload"
          ref="photoForm"
          accept="image/png, image/jpg, image/jpeg"
          :limit="1"
          :action="getUploadUrl('common')"
          :headers="headers"
          :before-upload="beforePhotoUpload"
          :on-progress="fileProgress"
          :on-success="uploadSuc"
          :on-error="uploadFail"
          :on-remove="uploadRemove"
          :disabled="photoObj.uploadDisabled"
          :show-file-list="photoObj.showListFlag"
        >
          <div class="upload-group">
            <span class="upload-file-box" @click="handleUploadRemove">{{ photoObj.showPhotoName }}</span>
            <button class="upload-btn" @click="handleUploadRemove">{{ getUploadBtn }}</button>
          </div>
        </el-upload>
        <div class="btn-group">
          <div class="btn-group-position">
            <el-button size="small" type="primary" @click="handleUpload">{{$t('confirmBtn')}}</el-button>
            <el-button size="small" @click="cancelUpload">{{$t('cancelBtn')}}</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import * as api from '@/api/Goods/goods.js'
import * as fileApi from '@/api/Medical/medical'
import * as status from '@/utils/status'
import * as rule from '@/utils/rules'
import pagination from '@/components/common/pagination/pagination.vue'
import Vue from 'vue';
import store from '@/store'
import { getToken } from '@/utils/auth'
import { i18n } from '@/assets/languages/i18n'

const rules = {
  price: rule.areaRules
};

// 默认查询条件
const defaultListQuery = {
  categoryId: null
}

// 默认请求列表数据传参
const defaultParams = {
  size: status.size,
  pkId: 0,
  categoryId: null,
  sortMode: 'DESC'
}

const defaultPriced = {
  agentId: 0,
  goodsId: null,
  price: null
};

export default {
  name: 'Goods',
  data() {
    return {
      uploadStyle: false,
      baseUrl: status.network.baseURL,
      fileUploadUrl: status.network.fileUploadURL,
      headers: {},
      userId: 0,
      // 主列表保存最小id
      minId: 0,
      // 主列表保存最大id
      maxId: 0,
      // 分页组件传入的显示页数
      pageCount: 1,
      // 分页防抖开关
      flag: false,
      // 拉取列表数据sortMode参数
      params: Object.assign({}, defaultParams),
      // 列表加载开关
      loading: false,
      // 增加的分类筛选框拉取数据的开关
      categoryFlag: false,
      // 商品定价弹框开关
      pricedFlag: false,
      detailFlag: false,
      photoFlag: false,
      photoObj: null,
      photoSaveNode: null,
      // 查询条件
      queryPage: Object.assign({}, defaultListQuery),
      // 商品分类筛选框绑定数组
      categoryList: [],
      // 查询到的商品情况
      list: [],
      // 商品详情
      detailObj: {},
      // 商品价格绑定对象
      pricedObj: null,
      // 商品价格修改保存节点
      priceSaveNode: null,
      rules
    }
  },
  computed: {
    getStatus() {
      const that = this
      return function (id) {
        let label = null
        switch (id) {
          case 0:
            label = that.$t('unsale')
            break
          case 1:
            label = that.$t('sale')
            break
          case 2:
            label = that.$t('delete')
            break
        }
        return label
      }
    },
    getImageUrl() {
      return function (filename) {
        return status.network.baseURL + status.network.getFiles('common') + filename
      }
    },
    getUploadUrl() {
      const that = this
      return function (type) {
        return that.baseUrl + that.fileUploadUrl + type
      }
    },
    getUploadBtn() {
      return this.photoObj.uploadDisabled ? i18n.t('goods.index.delBtn') : i18n.t('goods.index.upload')
    },
    getMessage() {
      return function (obj, key) {
        return obj ? obj[key] : i18n.t('noData')
      }
    }
  },
  components: {
    pagination
  },
  created() {
    this.getToken()
    this.pricedObj = Object.assign({}, defaultPriced);
    this.initCategoryList()
    this.initList(this.params)
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
  filters: {
    filterPrice(priceObj) {
      let text = priceObj === null ? i18n.t('priced') : `￥${(Math.round(priceObj.price) * Math.pow(10, -2)).toFixed(2)}`;
      return text;
    }
  },
  methods: {
    getToken() {
      store.getters.token && (this.headers['authorization'] = getToken())
    },
    // 初始化商品分类列表数据
    initCategoryList() {
      api.getAllGoodsCategory()
        .then(res => {
          if (res.code === 20000 && res.data !== null) {
            this.categoryList = res.data
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('goods.index.initCateFail'),
              type: 'warning',
              duration: 1500
            })
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
    initList(params) {
      this.loading = true;
      let apiFn = null;
      if (typeof params.categoryId === 'number') {
        apiFn = api.getAllGoodsByCategory;
      } else {
        apiFn = api.getAllGoods;
      }
      apiFn(params)
        .then(res => {
          console.log(res)
          const list = [];
          if (res.code === 20000) {
            this.categoryFlag = false;
            for (const [index, item] of res.data.entries()) {
              const promiseItem = new Promise((resolve, reject) => {
                api.getSingleGoodsPrice(this.userId, item.id)
                .then(res => {
                  Vue.set(item, 'pricedFlag', false);
                  Vue.set(item, 'uploadProgressFlag', false)
                  Vue.set(item, 'uploadDisabled', false)
                  Vue.set(item, 'showListFlag', true)
                  Vue.set(item, 'showPhotoName', item.photo)
                  if (res.code === 20000) {
                    Vue.set(item, 'priceObj', res.data);
                    resolve(item);
                  } else if (res.code === 20004) {
                    Vue.set(item, 'priceObj', null);
                    resolve(item);
                  }
                })
                .catch(err => {
                  reject(err);
                })
              });
              list.push(promiseItem);
            }
            Promise.all(list)
              .then(result => {
                this.list = result;
                this.loading = false;
                this.sortList();
                this.flag = false;
              })
              .catch(err => {
                this.loading = false;
                this.flag = false;
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                });
              })
          } else if (res.code === 20004) {
            this.$message({
              message: this.$t('noMoreMes'),
              type: 'warning',
              duration: 1500
            });
            this.flag = false;
            this.loading = false;
            if (this.categoryFlag) {
              this.list = [];
            }
            if (this.params.sortMode === 'DESC') {
              this.pageCount !== 1 && this.pageCount--;
            } else {
              this.pageCount !== 1 && this.pageCount++;
            }
          }
        })
        .catch(err => {
          this.loading = false;
          this.flag = false;
          this.categoryFlag = false;
          if (this.params.sortMode === 'DESC') {
            this.pageCount !== 1 && this.pageCount--;
          } else {
            this.pageCount !== 1 && this.pageCount++;
          }
          this.$message({
            message: err,
            type: 'error',
            duration: 1500
          });
        });
    },
    // 分页组件点击上一页事件
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
    // 分页组件点击下一页事件
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
    // 分页组件选择每页条数触发事件
    pageSizeChange(e) {
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.size = e
      this.pageCount = 1
      this.initList(this.params)
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
    // 筛选分类下拉选择框值改变事件
    categorySelect(e) {
      // 当分类筛选框值改变时打开开关,只有拉到数据时才关闭，借此判断20004的情况给list赋值空数组
      this.categoryFlag = true
      this.params.sortMode = 'DESC'
      this.params.pkId = 0
      this.params.categoryId = e
      this.pageCount = 1
      this.initList(this.params)
    },
    // 点击编号打开详情弹框
    showDetail(item) {
      this.detailObj = Object.assign({}, item)
      this.detailFlag = true
    },
    // 点击价格或定价打开价格编辑弹框
    showPriced(item) {
      this.priceSaveNode = item;
      if (this.priceSaveNode.priceObj === null) {
        this.pricedObj = Object.assign({}, defaultPriced);
        this.pricedObj.goodsId = item.id
      } else {
        this.pricedObj = Object.assign({}, this.priceSaveNode.priceObj);
        // this.pricedObj.price = this.pricedObj.price / 100
        this.pricedObj.price = (Math.round(this.pricedObj.price) * Math.pow(10, -2)).toFixed(2)
      }
      this.pricedFlag = true;
    },
    handleSet() {
      if (this.priceSaveNode.pricedFlag) {
        return
      }
      this.priceSaveNode.pricedFlag = true;
      this.$refs.priceForm.validate(valid => {
        if (valid) {
          let { agentId, goodsId, price } = this.pricedObj;
          api.setGoodsPrice({
            agentId,
            goodsId,
            price: Math.round(price * 100)
          })
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('setSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.priceSaveNode.pricedFlag = false;
                this.priceSaveNode.priceObj = {
                  agentId,
                  goodsId,
                  price: Math.round(price * 100)
                }
                this.priceSaveNode = null;
                this.pricedObj = Object.assign({}, defaultPriced);
                this.pricedFlag = false;
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.priceSaveNode.pricedFlag = false;
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.priceSaveNode.pricedFlag = false;
        }
      })
    },
    cancelSet() {
      this.priceSaveNode = null;
      this.pricedObj = Object({}, defaultPriced);
      this.pricedFlag = false;
    },
    // 图片上传弹框关闭前回调
    photoDialogClose(done) {
      if (this.photoObj.uploadDisabled) {
        this.$message({
          message: this.$t('goods.index.dialogCloseWarn'),
          type: 'warning',
          duration: 1500
        })
      } else {
        done()
      }
    },
    // 点击图片打开商品图片弹框
    showPhoto(item) {
      this.photoSaveNode = item
      this.photoObj = Object.assign({}, item)
      this.photoFlag = true
    },
    // 上传图片前检查图片大小及格式
    beforePhotoUpload(file) {
      if (this.photoObj.uploadProgressFlag) {
        this.$message({
          message: this.$t('medical.medicalOrders.uploadingWarn'),
          type: 'warning',
          duration: 1500
        })
        return !this.photoObj.uploadProgressFlag
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
    // 上传文件回调
    fileProgress() {
      this.photoObj.uploadProgressFlag = true
    },
    // 上传成功回调
    uploadSuc(e) {
      this.photoObj.uploadProgressFlag = false
      if (e.code === 20000) {
        this.photoObj.showPhotoName = e.data.oldFilename
        this.photoObj.uploadDisabled = true
        this.photoObj.showListFlag = false
        this.photoObj.photo = e.data.filename
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
      this.photoObj.uploadProgressFlag = false
      this.$message({
        message: e.message || this.$t('goods.index.uploadFail'),
        type: 'error',
        duration: 1500
      })
    },
    // 上传中移除文件
    uploadRemove() {
      this.photoObj.uploadProgressFlag = false
    },
    // 点击删除图片回调
    handleUploadRemove() {
      if (!this.photoObj.uploadDisabled) {
        return
      }
      fileApi.delFile('common', {
        filename: this.photoObj.photo
      })
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('goods.index.delPhotoSuc'),
              type: 'success',
              duration: 1500
            })
            this.$refs.photoForm.clearFiles()
            this.photoObj.showListFlag = true
            this.photoObj.uploadDisabled = false
            this.photoObj.showPhotoName = this.photoSaveNode.photo
            this.photoObj.photo = this.photoSaveNode.photo
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
    // 点击上传图片确定
    handleUpload() {
      if (this.photoSaveNode.photo === this.photoObj.photo) {
        this.$message({
          message: this.$t('goods.index.photoRepeatWarn'),
          type: 'warning',
          duration: 1500
        })
        return
      }
      api.setGoods(this.photoObj)
        .then(res => {
          if (res.code === 20000) {
            this.$message({
              message: this.$t('goods.index.setPhotoSuc'),
              type: 'success',
              duration: 1500
            })

            if (this.photoSaveNode.photo) {
              fileApi.delFile('common', {
                filename: this.photoSaveNode.photo
              })
              .then(res => {
                if (res.code === 20000) {
                  // 两个对象的photo一致才可关闭弹框
                  this.photoSaveNode.photo = this.photoObj.photo
                  this.photoFlag = false
                  this.initList(this.params)
                }
              })
              .catch(err => {
                console.log(err)
              })
            } else {
              this.photoSaveNode.photo = this.photoObj.photo
              this.photoFlag = false
              this.initList(this.params)
            }
          }
        })
    },
    cancelUpload() {
      if (this.photoObj.photo !== this.photoSaveNode.photo) {
        this.$message({
          message: this.$t('goods.index.dialogCloseWarn'),
          type: 'warning',
          duration: 1500
        })
      } else {
        this.photoFlag = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.goods-container {
  padding: 20px;
}

.table-container {
  margin-top: 30px;
  width: 100%;
}

.filter-container {
  height: 90%;
}

.el-pagination {
  float: right;
  margin-top: 20px;
}

.operate-container {
  margin-top: 20px;
}
.el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.pagination-container {
  float: right;
  margin-top: 10px;
}
.photo-dialog-container {
  width: 100%;

  .photo-show {
    display: flex;
    width: 300px;
    height: 200px;
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
    margin: 0 auto;
    justify-content: center;
    align-items: center;
    .imageWidth {
      width: 300px;
      height: auto;
      max-height: 200px;
    }
    .imageHeight {
      width: auto;
      height: 200px;
      max-width: 300px;
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
  .btn-group {
    margin-top: 10px;
    height: 50px;
    position: relative;
    .btn-group-position {
      position: absolute;
      right: 0;
      bottom: 0;
    }
  }
}
.photo-dialog-container::v-deep .el-upload {
  width: 100%;
  display: block;
  margin-top: 10px;
  .upload-group {
    width: 95%;
    margin: 0 auto;
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
      width: 80px;
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
