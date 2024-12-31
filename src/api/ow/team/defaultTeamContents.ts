export const defaultTeamContents = {
  videoUrl: {
    fileUrl: '',
  },
  heroSection: {
    show: true,
    status: [''],
    heroImages: {
      dark: { fileUrl: '' },
      light: { fileUrl: '' },
    },
    heroTitle1: '',
    heroTitle2: '',
    skillsSlider: [
      { icon: '', title: '' },
      { icon: '', title: '' },
      { icon: '', title: '' },
      { icon: '', title: '' },
    ],
    heroParagraph1: '',
    heroParagraph2: '',
    heroParagraph3: '',
  },
  aboutSection: {
    show: true,
    tags: [''],
    stats: [
      { key: '', value: '<span>98</span>%' },
    ],
    title1: '关于',
    title2: '我',
    contacts: [
      { key: '地址', value: '' },
      { key: '微信', value: '' },
      { key: '语言', value: '中文' },
      { key: '邮箱', value: '' },
    ],
    subtitle1: '',
    subtitle2: '',
    subtitle3: '',
  },
  resumeSection: {
    show: true,
    education: [
      {
        degree: '本科',
        duration: '2014年 - 2017年',
        description: '在山东中医药大学完成了本科教育，同时开始接触摄影。',
        institution: '山东中医药大学',
      },
      {
        degree: '',
        duration: '',
        description: '',
        institution: '',
      },
    ],
    experience: [
      {
        duration: '2015年 - 2018年',
        position: '儿童摄影师',
        description: '专注于儿童主题摄影，捕捉孩子最纯真的笑容。',
        institution: '摄影工作室',
      },
      {
        duration: '',
        position: '',
        description: '',
        institution: '',
      },
    ],
    resumeParagraph: '',
    titleEducation1: '教育',
    titleEducation2: '背景',
    titleExperience1: '职业',
    titleExperience2: '经历',
    educationParagraph: '',
  },
  contactSection: {
    show: true,
    title1: '与我',
    title2: '联系',
    paragraph: '我期待为您的拍摄需求提供最佳服务。',
    contactData: [
      { title: '', description: '' },
    ],
  },
  serviceSection: {
    show: true,
    title1: '我的',
    title2: '服务',
    services: [
      {
        icon: 'bx bxs-camera',
        title: '',
        number: '01',
        description: '',
      },
      {
        icon: 'bx bxs-video',
        title: '',
        number: '02',
        description: '',
      },
      {
        icon: 'bx bxs-image',
        title: '',
        number: '03',
        description: '',
      },
      {
        icon: 'bx bx-film',
        title: '',
        number: '04',
        description: '',
      },
    ],
    subtitle: '',
  },
  sidebarProfile: {
    age: '29',
    city: '山东省 济南市',
    show: true,
    stats: {},
    avatar: {
      dark: { fileUrl: '' },
      light: { fileUrl: '' },
    },
    skills: [{ icon: '1', title: '综合好评率', percentage: '98%' }],
    contacts: {},
  },
  communitySection: {
    show: true,
    title1: '我的',
    title2: '发布',
    paragraph: '',
  },
  advantagesSection: {
    show: true,
    title1: '我的',
    title2: '优势',
    subtitle: '多年的经验和专业的设备，为每一次创作保驾护航。',
    advantages: [
      { title: '专业的摄影服务', description: '从儿童摄影到商业拍摄，涵盖多种领域。' },
      { title: '高效的后期处理', description: '精通多种后期软件，确保作品质量。' },
      { title: '定制化拍摄方案', description: '根据客户需求量身设计拍摄计划。' },
      { title: '丰富的行业经验', description: '多年的实战经验，确保每个项目顺利完成。' },
    ],
  },
  testimonialSection: {
    show: true,
    title1: '客户',
    title2: '评价',
    paragraph: '感谢每一位客户对我的认可，这里是部分真实反馈。',
    testimonials: {
      testimonial1: {
        name: '张女士',
        content: '摄影师非常专业，耐心地引导孩子拍摄，最终效果非常满意，期待下次合作！',
        position: '全职妈妈',
        avatarUrl: 'https://irujia-admin-1300208231.cos.accelerate.myqcloud.com/irujia/ow/avatar/avatar.jpg',
        starsHtml: "<i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star'></i><i class='bx bxs-star-half'></i>",
      }
    },
  },
  healthCasesSection: {
    show: true,
    title1: '',
    title2: '',
    paragraph: '',
  },
} as Record<string, any>;
