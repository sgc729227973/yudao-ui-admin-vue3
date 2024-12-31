declare module 'jsoneditor' {
  // 定义 JSONEditor 的配置项
  interface JSONEditorOptions {
    mode?: 'tree' | 'view' | 'form' | 'code' | 'text';
    onChange?: () => void;
    onChangeText?: (jsonString: string) => void;
    onEditable?: (node: JSONEditorNode) => { field: boolean; value: boolean } | boolean;
    // 可继续扩展更多字段，如：
    mainMenuBar?: boolean;
    navigationBar?: boolean;
    statusBar?: boolean;
    onError?: (error: Error) => void;
    onEvent?: (node: JSONEditorNode, event: Event) => void;
  }

  // 定义 JSONEditor 的节点类型
  interface JSONEditorNode {
    field: string; // 当前键名
    value: any;    // 当前值
    path: string[]; // 当前路径
  }

  // 定义 JSONEditor 的类
  export default class JSONEditor {
    constructor(container: HTMLElement, options?: JSONEditorOptions);

    // 常用方法声明
    public destroy(): void;
    public get(): any;
    public set(json: any): void;
    public update(json: any): void;
    public expandAll(): void;
    public collapseAll(): void;
    // 其他方法根据需要扩展
  }
}
