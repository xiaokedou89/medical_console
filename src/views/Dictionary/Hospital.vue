<template>
  <div class="dictionary-hospital">
    <!--功能列表-->
    <el-card class="operate-container">
      <i class="el-icon-tickets" />
      <span>{{$t('dictionary.hospital.operateTitle')}}</span>
      <el-button style="float: right; margin: 0px 5px" size="small" @click="showAddHospital = true">{{$t('dictionary.hospital.addBtn')}}</el-button>
    </el-card>
    <!--主列表-->
    <el-card class="table-container">
      <el-tree
        ref="tree"
        :data="hospitalArr"
        :props="hospitalArrProp"
        node-key="id"
        :expand-on-click-node="false"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <span>
            <el-button type="text" @click="openDetial(data)">
              {{ data.name }}
            </el-button>
          </span>
          <span>
            <el-button v-show="data.address !== undefined" type="text" size="mini" @click="openAddDepartment(data)">{{$t('dictionary.hospital.addSonBtn')}}</el-button>
            <el-button type="text" size="mini" @click="openSet(data)">{{$t('dictionary.hospital.setBtn')}}</el-button>
            <el-button type="text" size="mini" @click="remove(node, data)">{{$t('dictionary.hospital.delBtn')}}</el-button>
          </span>
        </span>
      </el-tree>
    </el-card>
    <!--添加医院弹框-->
    <el-dialog :visible.sync="showAddHospital" :before-close="addHospitalClosing" :title="$t('dictionary.hospital.dialogAddHospitalTitle')" width="50%">
      <el-form ref="addHospitalForm" :model="addHospitalObj" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('dictionary.hospital.dialogAHName')" prop="name">
          <el-input v-model.trim="addHospitalObj.name" :placeholder="$t('dictionary.hospital.dialogAHNamePlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('dictionary.hospital.dialogAHDes')" prop="description">
          <el-input v-model.trim="addHospitalObj.description" :placeholder="$t('dictionary.hospital.dialogAHDesPlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('dictionary.hospital.dialogAHAddress')" prop="address">
          <el-input v-model.trim="addHospitalObj.address" :placeholder="$t('dictionary.hospital.dialogAHAddressPlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('dictionary.hospital.dialogAHArea')" prop="area.id">
          <el-cascader clearable v-model="cascaValue" :options="areaObj.children" :props="areaProps" @change="cascaderChange(addHospitalObj, cascaValue)" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleAddHospital">{{$t('dictionary.hospital.confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAddHospital">{{$t('dictionary.hospital.cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--添加科室弹框-->
    <el-dialog :visible.sync="showAddDepartment" :before-close="addDepartClosing" :title="$t('dictionary.hospital.dialogAddDepartmentTitle')" width="50%">
      <el-form ref="addDepartmentForm" :model="addDepartmentObj" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('dictionary.hospital.dialogADName')" prop="name">
          <el-input v-model.trim="addDepartmentObj.name" :placeholder="$t('dictionary.hospital.dialogADNamePlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('dictionary.hospital.dialogADDes')" prop="description">
          <el-input v-model.trim="addDepartmentObj.description" :placeholder="$t('dictionary.hospital.dialogADDesPlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleAddDepartment">{{$t('dictionary.hospital.confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelAddDepartment">{{$t('dictionary.hospital.cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--编辑医院/科室弹框-->
    <el-dialog :visible.sync="showSet" :before-close="setClosing" :title="$t('dictionary.hospital.dialogSetTitle')" width="50%">
      <el-form ref="setForm" :model="setObj" :rules="rules" label-width="100px" label-position="right">
        <el-form-item :label="$t('dictionary.hospital.dialogSetName')" prop="name">
          <el-input v-model.trim="setObj.name" :placeholder="$t('dictionary.hospital.dialogSetNamePlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item :label="$t('dictionary.hospital.dialogSetDes')" prop="description">
          <el-input v-model.trim="setObj.description" :placeholder="$t('dictionary.hospital.dialogSetDesPlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item v-if="isHospital" :label="$t('dictionary.hospital.dialogSetHAddress')" prop="address">
          <el-input v-model.trim="setObj.address" :placeholder="$t('dictionary.hospital.dialogSetHAddressPlace')" style="width: 60%" />
        </el-form-item>
        <el-form-item v-if="isHospital" :label="$t('dictionary.hospital.dialogSetDAddress')" prop="area.id">
          <el-cascader clearable v-model="selectValue" :options="areaObj.children" :props="areaProps" @change="cascaderChange(setObj, selectValue)" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="handleSet">{{$t('dictionary.hospital.confirmBtn')}}</el-button>
          <el-button size="small" @click="cancelSet">{{$t('dictionary.hospital.cancelBtn')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!--显示详情弹框-->
    <el-dialog :title="$t('dictionary.hospital.dialogDetailTitle')" :visible.sync="detailFlag" v-if="detailFlag" width="50%">
      <el-form :model="detailObj" label-width="80px" label-position="right">
        <el-form-item :label="$t('dictionary.hospital.dialogDetailName')" prop="name">
          <span>{{ detailObj.name }}</span>
        </el-form-item>
        <el-form-item :label="$t('dictionary.hospital.dialogDetailDes')" prop="description">
          <span>{{ detailObj.description }}</span>
        </el-form-item>
        <el-form-item v-if="detailIsHospital" :label="$t('dictionary.hospital.dialogDetailAddress')" prop="address">
          <span>{{ detailObj.address }}</span>
        </el-form-item>
        <el-form-item v-if="detailIsHospital" :label="$t('dictionary.hospital.dialogDetailArea')" prop="area.name">
          <span>{{ detailObj.area.name }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
import * as rule from '@/utils/rules'
import * as api from '@/api/Hospital/hospital'
import * as areaApi from '@/api/Area/area'
import Vue from 'vue'
const rules = {
  name: rule.rolenameRules,
  description: rule.descriptionRules,
  address: rule.addressRules,
  "area.id": rule.addressRules
}
// 添加医院绑定对象默认值
const defaultAddHospital = {
  id: null,
  name: '',
  description: '',
  area: {
    id: null,
    name: '',
    parentId: null
  },
  departments: [],
  address: ''
}
// 添加科室绑定对象默认值
const defaultAddDepartment = {
  id: null,
  name: '',
  description: '',
  hospitalId: null
}
// 编辑表单绑定对象默认值
const defaultSet = {
  id: null,
  hospitalId: null,
  name: '',
  description: '',
  address: '',
  area: null
}

export default {
  name: 'DictionaryHospital',
  data() {
    return {
      // 区域下拉选择框绑定对象
      areaObj: {},
      // 验证规则
      rules,
      // 添加医院弹框开关
      showAddHospital: false,
      // 添加医院防抖开关
      addHospitalFlag: false,
      // 详情弹框开关
      detailFlag: false,
      // 编辑医院/部门弹框开关
      showSet: false,
      // 编辑医院/部门防抖开关
      setFlag: false,
      // 判断详情弹框是否为医院
      detailIsHospital: true,
      // 详情弹框绑定数据
      detailObj: {},
      // 下拉选择区域框绑定数组
      selectOptions: [],
      // 编辑医院下拉选择区域框选择绑定值
      selectValue: [],
      //  添加医院下拉选择框选择绑定值
      cascaValue: [],
      // 区域练级框配置对象
      areaProps: {
        label: 'name',
        value: 'id',
        children: 'children',
        checkStrictly: true
      },
      // 添加医院绑定数据
      addHospitalObj: Object.assign({}, defaultAddHospital),
      // 添加部门弹框开关
      showAddDepartment: false,
      // 添加部门防抖开关
      addDepartmentFlag: false,
      // 删除防抖开关
      removeFlag: false,
      // 添加部门绑定对象
      addDepartmentObj: Object.assign({}, defaultAddDepartment),
      // 添加部门获取医院节点
      parentHospital: null,
      // 编辑保存节点
      setSaveNode: null,
      // 编辑绑定节点
      setObj: Object.assign({}, defaultSet),
      newId: 2,
      // 编辑弹框判断医院部门
      isHospital: false,
      // 数据列表
      hospitalArr: [],
      // 数据列表树配置项
      hospitalArrProp: {
        label: 'name',
        children: 'departments'
      }
    }
  },
  created() {
    this.initHospitalArr()
    // 页面创建拉取区域列表
    this.initArea(this.areaObj,0)
  },
  methods: {
    // 初始化区域列表数据
    initArea(obj, id) {
      areaApi.searchAllSonArea(id)
        .then(res => {
          if (res.code === 20000 && res.data.length > 0) {
            Vue.set(obj, 'children', res.data)
            for(let item of res.data) {
              this.initArea(item, item.id)
            }
          } else if (res.code === 20004) {
            Vue.set(obj, 'children', [])
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
    // 初始化医院列表
    initHospitalArr() {
      api.getHospital({pkId: 0, size: 1000})
        .then(res => {
          console.log(res)
          if (res.code === 20000) {
            this.hospitalArr = res.data
          } else if (res.code === 20004) {
            this.hospitalArr = []
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
    // 下拉选择区域弹框改变值事件
    cascaderChange(obj, modelValue) {
      if (modelValue.length > 0) {
        areaApi.searchSingleArea(modelValue[modelValue.length - 1])
          .then(res => {
            if (res.code === 20000) {
              obj.area = JSON.parse(JSON.stringify(res.data))
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
        // 值改变为clearable清空
        obj.area = null
      }
    },
    // 点击名称显示详情弹框事件
    openDetial(data) {
      if (!data.address) {
        this.detailIsHospital = false
      } else {
        this.detailIsHospital = true
      }
      this.detailObj = data
      this.detailFlag = true
    },
    // 根据区域id获取区域名称
    getAreaName(areaId, arr) {
      if (arr) {
        for (const item of arr) {
          if (areaId === item.id) {
            return item.name
          }
          if (item.children) {
            this.getAreaName(areaId, item.children)
          }
        }
      }
    },
    // 添加医院弹框点击确定事件
    handleAddHospital() {
      if (this.addHospitalFlag) {
        return
      }
      this.addHospitalFlag = true
      this.$refs['addHospitalForm'].validate(valid => {
        if (valid) {
          api.addHospital(this.addHospitalObj)
            .then(res => {
              if (res.code === 20000) {
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                this.addHospitalObj.id = res.data
                this.hospitalArr.push(this.addHospitalObj)
                this.addHospitalObj = Object.assign({}, defaultAddHospital)
                this.showAddHospital = false
                this.cascaValue = []
                this.addHospitalFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.addHospitalObj = Object.assign({}, defaultAddHospital)
              this.showAddHospital = false
              this.cascaValue = []
              this.addHospitalFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.addHospitalFlag = false
        }
      })
    },
    // 添加医院弹框取消事件
    cancelAddHospital() {
      this.addHospitalObj = Object.assign({}, defaultAddHospital)
      this.showAddHospital = false
      this.cascaValue = []
    },
    // 点击添加科室
    openAddDepartment(data) {
      this.parentHospital = data
      this.addDepartmentObj.hospitalId = data.id
      this.showAddDepartment = true
    },
    // 添加科室弹框确认事件
    handleAddDepartment() {
      if (this.addDepartmentFlag) {
        return
      }
      this.addDepartmentFlag = true
      this.$refs['addDepartmentForm'].validate(valid => {
        if (valid) {
          api.addDepartment(this.addDepartmentObj.hospitalId, this.addDepartmentObj)
            .then(res => {
              if (res.code === 20000) {
                this.addDepartmentObj.id = res.data
                this.$message({
                  message: this.$t('addSucMes'),
                  type: 'success',
                  duration: 1500
                })
                if (!this.parentHospital.departments) {
                  this.$set(this.parentHospital, 'departments', [])
                }
                this.parentHospital.departments.push(this.addDepartmentObj)
                this.parentHospital = null
                this.addDepartmentObj = Object.assign({}, defaultAddDepartment)
                this.showAddDepartment = false
                this.addDepartmentFlag = false
              }
            })
            .catch(err => {
              this.$message({
                message: err,
                type: 'error',
                duration: 1500
              })
              this.parentHospital = null
              this.addDepartmentObj = Object.assign({}, defaultAddDepartment)
              this.showAddDepartment = false
              this.addDepartmentFlag = false
            })
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.addDepartmentFlag = false
        }
      })
    },
    // 添加科室弹框取消事件
    cancelAddDepartment() {
      this.parentHospital = null
      this.addDepartmentObj = Object.assign({}, defaultAddDepartment)
      this.showAddDepartment = false
    },
    // 点击删除事件
    remove(node, data) {
      if (this.removeFlag) {
        return
      }
      this.removeFlag = true
      this.$confirm(this.$t('dictionary.hospital.delConfirmEL') + data.name, this.$t('warning'), {
        confirmButtonText: this.$t('confirmBtn'),
        cancelButtonText: this.$t('cancelBtn'),
        type: 'warning'
      })
        .then(() => {
          if (data.address) {
            api.delHospital(data.id)
              .then(res => {
                if (res.code === 20000) {
                  this.$message({
                    message: this.$t('delSucMes'),
                    type: 'success',
                    duration: 1500
                  })
                  const parent = node.parent
                  const children = parent.data.children || parent.data
                  const index = children.findIndex(d => d.id === data.id)
                  children.splice(index, 1)
                  this.removeFlag = false
                }
              })
              .catch(err => {
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.removeFlag = false
              })
          } else {
            api.delDepartment(data.hospitalId, data.id)
              .then(res => {
                if (res.code === 20000) {
                  this.$message({
                    message: this.$t('delSucMes'),
                    type: 'success',
                    duration: 1500
                  })
                  const parent = node.parent
                  const children = parent.data.children || parent.data.departments
                  const index = children.findIndex(d => d.id === data.id)
                  children.splice(index, 1)
                  this.removeFlag = false
                }
              })
              .catch(err => {
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.removeFlag = false
              })
          }
        })
        .catch(() => {
          this.$message({
            message: this.$t('delCancelMes'),
            type: 'warning',
            duration: 1500
          })
          this.removeFlag = false
        })
    },
    // 点击编辑事件
    openSet(data) {
      const _this = this
      let contain = []
      function getId(obj, id) {
        if (obj.children && obj.children.length > 0) {
          for (let item of obj.children) {
            if (item.id === id) {
              contain.unshift(id)
              if (obj.id) {
                getId(_this.areaObj, obj.id)
              }
            } else {
              getId(item, id)
            }
          }
        }
      }
      this.setSaveNode = data
      this.setObj = JSON.parse(JSON.stringify(data))
      if (data.address) {
        this.isHospital = true
        // 递归通过医院的区域id获取下拉选择框回显数组
        let areaId = data.area.id
        getId(this.areaObj,areaId)
        this.selectValue = contain
      } else {
        this.isHospital = false
      }
      this.showSet = true
    },
    // 编辑弹框点击确认事件
    handleSet() {
      if (this.setFlag) {
        return
      }
      this.setFlag = true
      this.$refs['setForm'].validate(valid => {
        if (valid) {
          if (this.isHospital) {
            api.setHospital(this.setObj.id, this.setObj)
              .then(res => {
                if (res.code === 20000) {
                  this.$message({
                    message: this.$t('setSucMes'),
                    type: 'success',
                    duration: 1500
                  })
                  this.showSet = false
                  this.setSaveNode.name = this.setObj.name
                  this.setSaveNode.description = this.setObj.description
                  this.setSaveNode.address = this.setObj.address
                  this.setSaveNode.area = JSON.parse(JSON.stringify(this.setObj.area))
                  this.setSaveNode = null
                  this.setObj = Object.assign({}, defaultSet)
                  this.setObj = JSON.parse(JSON.stringify(defaultSet))
                  this.selectValue = []
                  this.setFlag = false
                }
              })
              .catch(err => {
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.setFlag = false
              })
          } else {
            api.setDepartment(this.setObj.hospitalId, this.setObj.id, this.setObj)
              .then(res => {
                if (res.code === 20000) {
                  this.$message({
                    message: this.$t('setSucMes'),
                    type: 'success',
                    duration: 1500
                  })
                  this.showSet = false
                  this.setSaveNode.name = this.setObj.name
                  this.setSaveNode.description = this.setObj.description
                  this.setSaveNode = null
                  this.setObj = Object.assign({}, defaultSet)
                  this.setFlag = false
                }
              })
              .catch(err => {
                this.$message({
                  message: err,
                  type: 'error',
                  duration: 1500
                })
                this.setFlag = false
              })
          }
        } else {
          this.$message({
            message: this.$t('validFailMes'),
            type: 'error',
            duration: 1500
          })
          this.setFlag = false
        }
      })
    },
    // 编辑弹框点击取消事件
    cancelSet() {
      this.showSet = false
      this.setSaveNode = null
      this.setObj = Object.assign({}, defaultSet)
      this.selectValue = []
    },
    addHospitalClosing(done) {
      this.$refs.addHospitalForm.clearValidate()
      done()
    },
    addDepartClosing(done) {
      this.$refs.addDepartmentForm.clearValidate()
      done()
    },
    setClosing(done) {
      this.$refs.setForm.clearValidate()
      done()
    }
  }
}
</script>
<style lang="scss" scoped>
.dictionary-hospital {
  padding: 30px;
}

.operate-container {
  margin-top: 20px;
}
.operate-container span {
  margin-left: 5px;
}
.table-container {
  margin-top: 20px;
}
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    padding-right: 8px;
  }
</style>
