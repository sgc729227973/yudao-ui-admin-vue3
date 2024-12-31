<template>
  <el-card shadow="never" class="mb-20">
    <!-- 卡片头部，左侧是区域标题，右侧是是否显示的开关 -->
    <template #header>
      <div class="flex justify-between items-center">
        <span>推荐 / 评价区域</span>
        <el-switch
          v-model="localSection.show"
          active-text="显示"
          inactive-text="隐藏"
          @change="handleSwitchChange"
        />
      </div>
    </template>

    <!-- 表单主体 -->
    <el-form :model="localSection" label-width="120px">
      <!-- 标题 -->
      <el-form-item label="标题">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-input
              v-model="localSection.title1"
              placeholder="请输入标题一"
              @input="handleInputChange"
            />
          </el-col>
          <el-col :span="12">
            <el-input
              v-model="localSection.title2"
              placeholder="请输入标题二"
              @input="handleInputChange"
            />
          </el-col>
        </el-row>
      </el-form-item>

      <!-- 段落 -->
      <el-form-item label="段落">
        <el-input
          type="textarea"
          v-model="localSection.paragraph"
          placeholder="请输入段落"
          @input="handleInputChange"
        />
      </el-form-item>

      <!-- 客户评价列表 -->
      <el-form-item label="评价列表">
        <el-table :data="localTestimonials" border style="width: 100%">
          <!-- 姓名 -->
          <el-table-column label="姓名" min-width="100">
            <template #default="{ row }">
              <el-input
                v-model="row.name"
                placeholder="请输入姓名"
                @input="handleInputChange"
              />
            </template>
          </el-table-column>

          <!-- 职位 -->
          <el-table-column label="职位" min-width="180">
            <template #default="{ row }">
              <el-input
                v-model="row.position"
                placeholder="例如：全职妈妈 / 教师"
                @input="handleInputChange"
              />
            </template>
          </el-table-column>

          <!-- 星级评分（0~5，步进0.5） -->
          <el-table-column label="星级" width="200" align="center">
            <template #default="{ row }">
              <el-input-number
                v-model="row.stars"
                :min="0"
                :max="5"
                :step="0.5"
                @change="updateStarsHtml(row)"
              />
            </template>
          </el-table-column>

          <!-- 星级 HTML（只读或可选编辑） -->
          <el-table-column label="星级 HTML" min-width="280">
            <template #default="{ row }">
              <el-input
                v-model="row.starsHtml"
                placeholder="<i class='bx bxs-star'></i><i class='bx bxs-star-half'></i>..."
                @blur="updateStarsFromHtml(row)"
              />
            </template>
          </el-table-column>

          <!-- 评价内容 -->
          <el-table-column label="内容" min-width="200">
            <template #default="{ row }">
              <el-input
                type="textarea"
                v-model="row.content"
                placeholder="请输入客户评价"
                @input="handleInputChange"
              />
            </template>
          </el-table-column>

          <!-- 头像 -->
          <el-table-column label="头像URL" min-width="150">
            <template #default="{ row }">
              <el-input
                v-model="row.avatarUrl"
                placeholder="请输入头像URL"
                @input="handleInputChange"
              />
            </template>
          </el-table-column>

          <!-- 删除操作 -->
          <el-table-column label="操作" width="80" align="center">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeTestimonial($index)" link>删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加新评价按钮 -->
        <el-row justify="center" class="mt-3">
          <el-button type="primary" @click="addTestimonial" round>
            + 添加评价
          </el-button>
        </el-row>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

/**
 * props.modelValue = { show, title1, title2, paragraph, testimonials: { testimonial1: {...}, ... } }
 */
const props = defineProps<{
  modelValue: {
    show?: boolean;
    title1?: string;
    title2?: string;
    paragraph?: string;
    testimonials: Record<string, any>;
  };
}>();

const emit = defineEmits(['update:modelValue']);

// 本地数据
const localSection = ref<any>({
  show: true,
  title1: '',
  title2: '',
  paragraph: '',
  testimonials: {},
});

const localTestimonials = ref<any[]>([]);

/** 当父组件传入值发生变化时，初始化本地数据 */
watch(
  () => props.modelValue,
  (newVal) => {
    if (!newVal) {
      localSection.value = {
        show: true,
        title1: '',
        title2: '',
        paragraph: '',
        testimonials: {},
      };
      localTestimonials.value = [];
      return;
    }

    // 拷贝到本地
    localSection.value = { ...newVal };

    // 将 testimonials 对象转成数组
    if (newVal.testimonials && typeof newVal.testimonials === 'object') {
      localTestimonials.value = Object.keys(newVal.testimonials).map((key) => {
        const rowData = {
          _key: key,
          stars: 0,      // 默认先给0
          starsHtml: '', // 默认先给空
          ...newVal.testimonials[key], // 可能带有 name, content, position, starsHtml...
        };

        // 若 rowData 本来就带有 starsHtml，则解析它以得到正确的 stars
        if (rowData.starsHtml) {
          rowData.stars = parseStarsFromHtml(rowData.starsHtml);
        }
        return rowData;
      });
    } else {
      localTestimonials.value = [];
    }
  },
  { immediate: true }
);

/** 每次本地数据变动，就同步回父组件 */
function doUpdate() {
  const newTestimonials: Record<string, any> = {};
  localTestimonials.value.forEach((item, idx) => {
    const { _key, ...rest } = item;
    const safeKey = _key || `testimonial${idx + 1}`;
    newTestimonials[safeKey] = rest;
  });

  localSection.value.testimonials = newTestimonials;
  emit('update:modelValue', { ...localSection.value });
}

/** 输入/切换操作时触发 */
function handleInputChange() {
  doUpdate();
}
function handleSwitchChange() {
  doUpdate();
}

/** 添加新的评价 */
function addTestimonial() {
  const newIndex = localTestimonials.value.length + 1;
  localTestimonials.value.push({
    _key: `testimonial${newIndex}`,
    name: '',
    position: '',
    content: '',
    avatarUrl: '',
    stars: 0,
    starsHtml: '',
  });
  doUpdate();
}

/** 删除评价 */
function removeTestimonial(index: number) {
  localTestimonials.value.splice(index, 1);
  doUpdate();
}

/** 根据评分生成星级 HTML */
function updateStarsHtml(row: any) {
  const fullStars = Math.floor(row.stars);           // 整星数量
  const halfStar = row.stars % 1 !== 0;             // 是否有半星
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let html = '';
  html += "<i class='bx bxs-star'></i>".repeat(fullStars);
  if (halfStar) {
    html += "<i class='bx bxs-star-half'></i>";
  }
  html += "<i class='bx bx-star'></i>".repeat(emptyStars);

  row.starsHtml = html;
  doUpdate();
}

/** (可选) 根据星星 HTML 反推评分数值 */
function updateStarsFromHtml(row: any) {
  row.stars = parseStarsFromHtml(row.starsHtml);
  doUpdate();
}

/** 工具函数：从星星 HTML 里解析出数值评分 */
function parseStarsFromHtml(html: string): number {
  // 先数 bxs-star-half
  const halfCount = (html.match(/bxs-star-half\b/g) || []).length;
  // 再数 bxs-star（注意不要和 bxs-star-half 混淆）
  // 这里使用一个稍微严格的正则来避免误匹配
  // 你也可以先把 half 替换掉再数 star
  const fullCount = (html.match(/bxs-star(\s|['"]|>)/g) || []).length;

  // 评分 = fullCount + halfCount*0.5
  // 因为 halfCount 的 <i class='bx bxs-star-half'></i> 并没有 "bxs-star " 前缀
  return fullCount + halfCount * 0.5;
}
</script>

<style scoped>
.mb-20 {
  margin-bottom: 20px;
}
.mt-3 {
  margin-top: 15px;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.items-center {
  align-items: center;
}
</style>
