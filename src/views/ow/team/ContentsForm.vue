<template>
  <div>
    <!-- 英雄区域设置 -->
    <HeroSectionForm v-model="contents.heroSection" />

    <!-- 关于我们区域 -->
    <AboutSectionForm v-model="contents.aboutSection" />

    <!-- 履历区域 -->
    <ResumeSectionForm v-model="contents.resumeSection" />

    <!-- 联系区域 -->
    <ContactSectionForm v-model="contents.contactSection" />

    <!-- 服务区域 -->
    <ServiceSectionForm v-model="contents.serviceSection" />

    <!-- 侧边栏个人资料 -->
    <SidebarProfileForm v-model="contents.sidebarProfile" />

    <!-- 社区区域 -->
    <CommunitySectionForm v-model="contents.communitySection" />

    <!-- 优势区域 -->
    <AdvantagesSectionForm v-model="contents.advantagesSection" />

    <!-- 推荐/评价区域 -->
    <TestimonialSectionForm v-model="contents.testimonialSection" />

    <!-- 健康案例区域 -->
    <HealthCasesSectionForm v-model="contents.healthCasesSection" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import HeroSectionForm from './contents/HeroSectionForm.vue';
import AboutSectionForm from './contents/AboutSectionForm.vue';
import ResumeSectionForm from './contents/ResumeSectionForm.vue';
import ContactSectionForm from './contents/ContactSectionForm.vue';
import ServiceSectionForm from './contents/ServiceSectionForm.vue';
import SidebarProfileForm from './contents/SidebarProfileForm.vue';
import CommunitySectionForm from './contents/CommunitySectionForm.vue';
import AdvantagesSectionForm from './contents/AdvantagesSectionForm.vue';
import TestimonialSectionForm from './contents/TestimonialSectionForm.vue';
import HealthCasesSectionForm from './contents/HealthCasesSectionForm.vue';

const props = defineProps<{
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const contents = ref<any>({});


watch(
  () => props.modelValue,
  (newVal) => {
    contents.value = newVal || {};
  },
  { immediate: true }
);

watch(
  () => contents.value,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);


</script>
