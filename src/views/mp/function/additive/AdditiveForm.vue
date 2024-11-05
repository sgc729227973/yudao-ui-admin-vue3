<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入名称" />
      </el-form-item>
      <el-form-item label="公众号" prop="accountId">
        <el-select
          v-model="formData.accountId"
          placeholder="请选择公众号名称"
        >
          <el-option
            v-for="item in accountList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="介绍" prop="introduce">
        <el-input v-model="formData.introduce" placeholder="请输入介绍" />
      </el-form-item>
      <el-form-item label="类别" prop="categories">
        <el-select v-model="formData.categories" placeholder="请选择类别" multiple clearable>
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="食用建议" prop="consumptionAdvice">
        <el-select v-model="formData.consumptionAdvice" placeholder="请选择食用建议" clearable>
          <el-option label="建议谨慎食用" :value="1" />
          <el-option label="适量食用为宜" :value="2" />
          <el-option label="一般可安全食用" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="评分" prop="score" v-if="formData.score !== undefined && formData.score !== null">
        <el-input v-model="formData.score" :disabled="true" placeholder="评分将在保存后自动计算" />
      </el-form-item>
      <el-form-item label="数据来源" prop="dataSource">
        <el-input v-model="formData.dataSource" placeholder="请输入数据来源" />
      </el-form-item>
      <el-form-item label="安全摄入范围(ADI)" prop="ADI">
        <el-input v-model="formData.ADI" placeholder="请输入安全摄入范围" />
      </el-form-item>
      <el-form-item label="长期摄入风险" prop="longTermIngestionRisk">
        <el-input v-model="formData.longTermIngestionRisk" placeholder="请输入长期摄入风险" />
      </el-form-item>
      <el-form-item label="健康益处" prop="healthBenefits">
        <el-input v-model="formData.healthBenefits" placeholder="请输入健康益处" />
      </el-form-item>
      <el-form-item label="致癌性风险" prop="carcinogenicRisk">
        <el-input v-model="formData.carcinogenicRisk" placeholder="请输入致癌性风险" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as FunctionAdditiveApi from '@/api/mp/function/additive/index'
import * as AccountApi from '@/api/mp/account/index'

defineOptions({ name: 'MpFunctionAdditiveForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formRef = ref() // 表单 Ref
const formData = ref({
  id: undefined,
  accountId: undefined,
  name: '',
  introduce: '',
  categories: [], // 类别字段设置为数组类型
  consumptionAdvice: undefined,
  score: undefined,
  dataSource: '',
  ADI: '',
  longTermIngestionRisk: '',
  healthBenefits: '',
  carcinogenicRisk: '',
});
const rules = reactive({
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
  accountId: [{ required: true, message: '公众号选择不能为空', trigger: 'blur' }],
})

const accountList = ref<AccountApi.AccountVO[]>([]);

const categoryOptions = [
  { value: 1, label: '酸度调节剂' },
  { value: 2, label: '抗结剂' },
  { value: 3, label: '消泡剂' },
  { value: 4, label: '抗氧化剂' },
  { value: 5, label: '漂白剂' },
  { value: 6, label: '膨松剂' },
  { value: 7, label: '胶基糖果中基础剂物质' },
  { value: 8, label: '着色剂' },
  { value: 9, label: '护色剂' },
  { value: 10, label: '乳化剂' },
  { value: 11, label: '酶制剂' },
  { value: 12, label: '增味剂' },
  { value: 13, label: '面粉处理剂' },
  { value: 14, label: '被膜剂' },
  { value: 15, label: '水分保持剂' },
  { value: 16, label: '营养强化剂' },
  { value: 17, label: '防腐剂' },
  { value: 18, label: '稳定剂和凝固剂' },
  { value: 19, label: '甜味剂' },
  { value: 20, label: '增稠剂' },
  { value: 21, label: '食品用香料' },
  { value: 22, label: '食品工业用加工助剂' },
  { value: 23, label: '其他类' }
];

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await FunctionAdditiveApi.getFunctionAdditive(id)
    } finally {
      formLoading.value = false
    }
  }
  await loadAccountList();
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗


const loadAccountList = async () => {
  try {
    const response = await AccountApi.getSimpleAccountList(); 
    if (response) {
      accountList.value = response; 
    }
  } catch (error) {}
};

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value
    if (formType.value === 'create') {
      await FunctionAdditiveApi.createFunctionAdditive(data)
      message.success(t('common.createSuccess'))
    } else {
      await FunctionAdditiveApi.updateFunctionAdditive(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 表单重置 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    accountId: undefined,
    name: '',
    introduce: '',
    categories: [],
    consumptionAdvice: undefined,
    score: undefined,
    dataSource: '',
    ADI: '',
    longTermIngestionRisk: '',
    healthBenefits: '',
    carcinogenicRisk: '',
  };
  formRef.value?.resetFields();
};
</script>