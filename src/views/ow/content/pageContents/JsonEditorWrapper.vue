<template>
  <div>
    <!-- 开关按钮 -->
    <div style="margin-bottom: 10px;">
      <el-switch
        v-model="allowEditKey"
        active-text="允许修改键名"
        inactive-text="禁止修改键名"
      />
    </div>
    <!-- JSON 编辑器容器 -->
    <div
      ref="editorContainer"
      style="height: 400px; width: 100%; border: 1px solid #ccc; border-radius: 4px;"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits } from 'vue';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { keyChineseMap } from '@/api/ow/content/pageContents/keysMap';

// Props：接受父组件传递的 JSON 数据和编辑模式
const props = defineProps<{
  modelValue: any; // 需要编辑的 JSON 数据
  mode?: 'tree' | 'code'; // 编辑模式，默认 'tree'
}>();

// Emits：用于 v-model 同步
const emit = defineEmits(['update:modelValue']);

// JSONEditor 实例 & 容器
const editor = ref<JSONEditor | null>(null);
const editorContainer = ref<HTMLDivElement | null>(null);

// 控制键名是否可以编辑，默认不允许
const allowEditKey = ref(false);

// 映射表反转（中文 -> 英文）
const reverseKeyChineseMap = Object.fromEntries(
  Object.entries(keyChineseMap).map(([key, value]) => [value, key])
);

// 转换键名为中文
const mapKeysToChinese = (json: any): any => {
  if (!json || typeof json !== 'object') return json;
  const mapped = Array.isArray(json) ? [] : {};
  for (const key in json) {
    const newKey = keyChineseMap[key] || key;
    mapped[newKey] = mapKeysToChinese(json[key]);
  }
  return mapped;
};

// 转换键名为英文
const mapKeysToEnglish = (json: any): any => {
  if (!json || typeof json !== 'object') return json;
  const mapped = Array.isArray(json) ? [] : {};
  for (const key in json) {
    const newKey = reverseKeyChineseMap[key] || key;
    mapped[newKey] = mapKeysToEnglish(json[key]);
  }
  return mapped;
};

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
        const updatedJson = editor.value!.get();
        const englishJson = mapKeysToEnglish(updatedJson); // 将键名转换为英文
        emit('update:modelValue', englishJson); // 同步数据
      } catch (err) {
        console.error('JSONEditor parse error:', err);
      }
    },
  });

  // 初始值，键名转中文
  if (props.modelValue) {
    const initialData = mapKeysToChinese(props.modelValue);
    editor.value.set(initialData);
  }
});

// 父组件数据更新 -> 更新编辑器
watch(
  () => props.modelValue,
  (newVal) => {
    if (editor.value && newVal) {
      const updatedData = mapKeysToChinese(newVal);
      editor.value.update(updatedData);
    }
  },
  { deep: true }
);

// 组件卸载时销毁 JSONEditor 实例
onBeforeUnmount(() => {
  editor.value?.destroy();
  editor.value = null;
});
</script>

<style scoped>
div[ref="editorContainer"] {
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
