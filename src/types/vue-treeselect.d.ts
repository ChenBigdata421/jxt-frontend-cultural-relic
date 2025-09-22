declare module '@riophae/vue-treeselect' {
  import { VueConstructor } from 'vue'
  
  interface TreeselectOption {
    id: string | number
    label: string
    children?: TreeselectOption[]
    isDisabled?: boolean
    isDefaultExpanded?: boolean
    [key: string]: any
  }

  interface TreeselectProps {
    value?: any
    multiple?: boolean
    disabled?: boolean
    clearable?: boolean
    searchable?: boolean
    options?: TreeselectOption[]
    placeholder?: string
    noChildrenText?: string
    noOptionsText?: string
    noResultsText?: string
    loadingText?: string
    maxHeight?: number
    appendToBody?: boolean
    zIndex?: number
    [key: string]: any
  }

  const Treeselect: VueConstructor
  export default Treeselect
}

declare module '@riophae/vue-treeselect/dist/vue-treeselect.css'
