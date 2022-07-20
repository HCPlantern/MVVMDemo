
import compile from "./components/Compiler";
import observe from "./components/Observer";

/**
 * MVVM 框架入口
 */
export default class Vue {
    // 参数为对象实例 这个对象用于告知vue需要挂载到哪个元素并挂载数据
    readonly $data: { [key: string]: any };
    $el: HTMLElement;

    /**
     * 构造函数
     * @param obj_instance 外部传入的数据对象, 包含节点名和数据
     */
    constructor(obj_instance: { [key: string]: any }) {
        // 给实例赋值对象的data属性
        this.$data = obj_instance.data;
        // 进行数据劫持 监听对象里属性的变化
        observe(this.$data);
        // 模板解析
        compile(obj_instance.el, this);
    }
}


