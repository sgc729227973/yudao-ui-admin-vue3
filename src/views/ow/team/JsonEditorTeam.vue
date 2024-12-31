<template>
  <!-- 用一个 div 作为容器，高度和样式可自定义 -->
  <div>
    <!-- 开关按钮 -->
    <div style="margin-bottom: 10px;">
      <el-switch
        v-model="allowEditKey"
        active-text="允许修改键名"
        inactive-text="禁止修改键名"
      />
    </div>
    <div
      ref="editorContainer"
      style="height: 100%; width: 100%; border: 1px solid #ccc; border-radius: 4px;"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits } from 'vue';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { keyChineseMap } from '@/api/ow/content/pageContents/keysMap';

// Props：接受父组件传入的 JSON 数据
const props = defineProps<{
  modelValue: any; // 待编辑的 JSON
  mode?: 'tree' | 'code'; // 编辑器模式，默认 'tree'
}>();
const emit = defineEmits(['update:modelValue']);

// editor 实例 & 容器
const editor = ref<JSONEditor | null>(null);
const editorContainer = ref<HTMLDivElement | null>(null);

// 控制键名是否可以编辑，默认不允许
const allowEditKey = ref(false);

// 把 keyChineseMap 反转一下，做中文 -> 英文映射
const reverseKeyChineseMap: Record<string, string> = Object.fromEntries(
  Object.entries(keyChineseMap).map(([k, v]) => [v, k])
);

/** 将 JSON 对象的 key 从英文 -> 中文 */
function mapKeysToChinese(json: any): any {
  if (json === null || typeof json !== 'object') return json;
  if (Array.isArray(json)) {
    return json.map((item) => mapKeysToChinese(item));
  }
  const mapped: Record<string, any> = {};
  for (const key in json) {
    const newKey = keyChineseMap[key] || key;
    mapped[newKey] = mapKeysToChinese(json[key]);
  }
  return mapped;
}

/** 将 JSON 对象的 key 从中文 -> 英文 */
function mapKeysToEnglish(json: any): any {
  if (json === null || typeof json !== 'object') return json;
  if (Array.isArray(json)) {
    return json.map((item) => mapKeysToEnglish(item));
  }
  const mapped: Record<string, any> = {};
  for (const key in json) {
    const newKey = reverseKeyChineseMap[key] || key;
    mapped[newKey] = mapKeysToEnglish(json[key]);
  }
  return mapped;
}

// 初始化 JSONEditor
onMounted(() => {
  if (!editorContainer.value) return;

  editor.value = new JSONEditor(editorContainer.value, {
    mode: props.mode || 'tree',
    // 键名是否可编辑，动态根据 allowEditKey 控制
    onEditable(_node) {
      return {
        field: allowEditKey.value, // 根据开关决定是否允许编辑键名
        value: true, // 始终允许编辑值
      };
    },
    onChange() {
      try {
        const updatedData = editor.value!.get();
        const englishData = mapKeysToEnglish(updatedData); // 将键名转换为英文
        emit('update:modelValue', englishData); // 同步数据
      } catch (err) {
        console.error('JSONEditor parse error:', err);
      }
    },
  });

  if (props.modelValue) {
    const dataChinese = mapKeysToChinese(props.modelValue);
    editor.value.set(dataChinese); // 初始数据
  }
});

// 父组件数据更新 -> 更新编辑器
watch(
  () => props.modelValue,
  (newVal) => {
    if (!editor.value || !newVal) return;
    // 把英文 -> 中文
    const dataChinese = mapKeysToChinese(newVal);
    editor.value.update(dataChinese);
  },
  { deep: true }
);

// 销毁 editor
onBeforeUnmount(() => {
  editor.value?.destroy();
  editor.value = null;
});
</script>

<style scoped>
/* 你可以按需定制高度、边框等，这里演示最基本 */
</style>
