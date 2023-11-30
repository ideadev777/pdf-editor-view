export interface Settings {
  currentPage: number,
  totalPage: number,
  scale: number,

  pageMode?: string,
  query?: string
}

export interface PdfList {
  _id: string,
  path: string,
  name: string,
  updatedAt: string,
  isTemplate: boolean,
  template: string,
  file_type: string
}

export interface Field {
  icon: string,
  title: string,
}

export interface FieldProperties {
  _id?: string,
  page: number,
  type: Field,
  font?: {
    size?: number,
    family?: string,
  },
  container?: {
    border?: string,
    background?: string,
    opacity?: number,
    width?: number,
    height?: number
  },
  data: string | any[],
  ext?: string,
  position: {
    x?: number,
    y?: number,
  },
  metadata?: string
}
