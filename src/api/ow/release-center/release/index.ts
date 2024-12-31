import request from '@/config/axios';

// 标签定义
export interface OfficialWebsiteTag {
  id: number; // 标签 ID
  name: string; // 标签名称
  tagCode: string; // 标签代码
}

// 评论项
export interface CommentItem {
  date: string; // 评论日期
  content: string; // 评论内容
  username: string; // 评论用户名
  avatarUrl: string; // 用户头像 URL
}

export interface NewsImageItem {
  fileUrl: string;
  description: string;
}

export interface CommunityVO {
  id?: number;
  title: string;
  subheading?: string;
  author?: number;
  top?: boolean;
  status: number;
  tags?: OfficialWebsiteTag[];
  createTime?: number;
  type?: number;
  fileConfigId?: number;
  encrypted?: boolean;
  linkUrl?: string;
  contents: {
    coverUrl: {
      fileUrl: string; // 封面图 URL，必填
    };
    datePublished: string; // 发布日期
    dynamicContent: DynamicContent[]; // 动态内容列表
  };
  comments?: {
    comments: CommentItem[]; // 评论列表
    commentCount: string; // 评论数量
  };
}

// 动态内容结构
interface DynamicContent {
  type: 'content' | 'image' | 'video' | 'audio' | 'link';
  sort: number;
  data: {
    fileUrl?: string;           // 图片、音视频 URL
    description?: string;       // 图片描述
    title?: string;             // 视频或音频标题
    text?: string;              // 文本内容
    linkText?: string;          // 超链接文字
    linkUrl?: string;           // 超链接地址
    coverUrl?: {
      fileUrl: string;          // 视频封面 URL
    };
  };
}

// 动态内容的数据部分
export interface DynamicContentData {
  fileUrl?: string; // 图片、视频或音频的 URL
  description?: string; // 图片的描述
  title?: string; // 视频或音频的标题
  text?: string; // 文本内容
  coverUrl?: {
    fileUrl: string; // 视频封面 URL
  };
}

export const getCommunityList = async (params) => {
  return await request.get({ url: '/ow/release/release/page', params }, true);
};

// 获取社区详情
export const getCommunityDetail = async (id: number) => {
  return await request.get({ url: '/ow/release/release/get', params: { id } }, true);
};

export const createCommunity = async (data: CommunityVO) => {
  return await request.post({ url: '/ow/release/release/create', data }, true);
};

export const updateCommunity = async (id: number, data: CommunityVO) => {
  return await request.put({ url: '/ow/release/release/update', data: { ...data, id } }, true);
};

export const deleteCommunity = async (id: number) => {
  return await request.delete({ url: '/ow/release/release/delete', params: { id } }, true);
};

export const exportCommunity = (params) => {
  return request.download({ url: '/ow/release/release/export', params }, true);
};
