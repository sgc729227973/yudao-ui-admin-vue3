import request from '@/config/axios'

// 定义 PictureGalleryVO 接口
export interface PictureGalleryVO {
  id?: number;
  title: string;
  isFeatured?: boolean;
  category?: number;
  status?: number;
  subheading?: string;
  dateTaken?: Date;
  authorId?: number |undefined; // 支持 null
  fileConfigId?: number;
  encrypted?: boolean;
  contents?: Record<string, any>; // contents 里现在包含新的动态结构
  tags?: { id: number; tagCode: string; name: string }[];
  createTime?: Date;
  updateTime?: Date;
}

export interface OfficialWebsiteTag {
  id: number;
  name: string;
  tagCode: string;
}

// 查询图库列表
export const getPictureGalleryList = async (params: any) => {
  return await request.get({ url: '/ow/media/picture-gallery/page', params }, true)
}

// 查询简单图库列表
export const getSimplePictureGalleryList = async () => {
  return await request.get({ url: '/ow/media/picture-gallery/simple-list' }, true)
}

// 查询图库详情
export const getPictureGalleryDetail = async (id: number) => {
  return await request.get({ url: '/ow/media/picture-gallery/get', params: { id } }, true)
}

// 新增图库
export const createPictureGallery = async (data: PictureGalleryVO) => {
  return await request.post({ url: '/ow/media/picture-gallery/create', data }, true)
}

// 更新图库
export const updatePictureGallery = async (id: number, data: PictureGalleryVO) => {
  return await request.put({ url: '/ow/media/picture-gallery/update', data: { ...data, id } }, true)
}

// 删除图库
export const deletePictureGallery = async (id: number) => {
  return await request.delete({ url: '/ow/content/picture-gallery/delete', params: { id } }, true)
}
