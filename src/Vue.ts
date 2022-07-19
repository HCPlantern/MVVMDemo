

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
        Observer(this.$data);
        Compile(obj_instance.el, this);
    }
}

/**
 * 数据劫持, 监听实例里的数据
 * @param data_instance
 * @constructor
 */
function Observer(data_instance: { [key: string]: any }) {
    // 递归出口
    if (!data_instance || typeof data_instance !== "object") return;

    // 每次数据劫持一个对象时都创建Dependency实例 用于区分哪个对象对应哪个依赖实例和收集依赖
    const dependency = new Dependency();
    Object.keys(data_instance).forEach((key) => {
        // 使用defineProperty后属性里的值会被修改 需要提前保存属性的值
        let value = data_instance[key];
        // 递归劫持data里的子属性
        Observer(value);
        Object.defineProperty(data_instance, key, {
            enumerable: true,
            configurable: true,
            // 收集数据依赖
            get() {
                console.log(`获取属性值 ${value}`);
                Dependency.temp && dependency.addSub(Dependency.temp);
                return value;
            },
            // 触发视图更新
            set(newVal) {
                console.log(`修改属性值`);
                value = newVal;
                // 处理赋值是对象时的情况
                Observer(newVal);
                dependency.notify();
            },
        });
    });
}

/**
 * 模板解析, 替换 DOM 内容, 把 vue 实例上的数据解析到页面上
 * @param element Vue实例挂载的元素
 * @param vm Vue实例
 */
function Compile(element: any, vm: Vue) {
    vm.$el = document.querySelector(element);
    // 使用文档碎片来临时存放DOM元素 减少DOM更新
    const fragment = document.createDocumentFragment();
    let child;
    // 将页面里的子节点循环放入文档碎片
    while ((child = vm.$el.firstChild)) {
        fragment.appendChild(child);
    }
    fragment_compile(fragment);

    /**
     * 替换文本节点的内容
     * @param node 文本节点
     */
    function fragment_compile(node: any) {
        // 使用正则表达式去匹配并替换节点里的{{}}
        const pattern = /\{\{\s*(\S+)\s*}}/;
        if (node.nodeType === 3) {
            // 提前保存文本内容 否则文本在被替换一次后 后续的操作都会不生效
            const texts = node.nodeValue;
            // 获取正则表达式匹配文本字符串获得的所有结果
            const result_regex = pattern.exec(node.nodeValue);
            if (result_regex) {
                const arr = result_regex[1].split("."); // str1.str2 => ['str1', 'str2']
                // 使用reduce归并获取属性对应的值 = vm.$data['str1'] => vm.$data['str1']['str2']
                const value = arr.reduce((total, current) => total[current], vm.$data);
                node.nodeValue = texts.replace(pattern, value);
                // 在节点值替换内容时 即模板解析的时候 添加订阅者
                // 在替换文档碎片内容时告诉订阅者如何更新,即告诉 Watcher 如何更新自己
                new Watcher(vm, result_regex[1], (newVal: string) => {
                    node.nodeValue = texts.replace(pattern, newVal);
                });
            }
        }
        // 替换绑定了v-model属性的input节点的内容
        if (node.nodeType === 1 && node.nodeName === "INPUT") {
            const attr = Array.from(node.attributes);
            attr.forEach((item: Node) => {
                if (item.nodeName === "v-model") {
                    node.value = item.nodeValue
                        .split(".")
                        .reduce((total, current) => total[current], vm.$data);
                    new Watcher(vm, item.nodeValue, (newVal: string) => {
                        node.value = newVal;
                    });
                    // 监听输入框中的值变化
                    node.addEventListener("input", (e: { target: { value: any; }; }) => {
                        // ['str1', 'str2']
                        const arr1 = item.nodeValue.split(".");
                        // ['str1']
                        const arr2 = arr1.slice(0, arr1.length - 1);
                        // vm.$data.str1
                        const final = arr2.reduce(
                            (total, current) => total[current],
                            vm.$data
                        );
                        // vm.$data.str1['str2'] = e.target.value
                        final[arr1[arr1.length - 1]] = e.target.value;
                    });
                }
            });
        }
        // 对子节点的所有子节点也进行替换内容操作
        node.childNodes.forEach((child: ChildNode) => fragment_compile(child));
    }

    // 操作完成后将文档碎片添加到页面
    // 此时已经能将vm的数据渲染到页面上 但还未实现数据变动的及时更新
    vm.$el.appendChild(fragment);
}

/**
 * 依赖 —— 实现发布-订阅模式 用于存放订阅者和通知订阅者更新
 */
class Dependency {
    private subscribers: Watcher[];
    static temp: Watcher;

    constructor() {
        this.subscribers = []; // 用于收集依赖data的订阅者信息
    }

    addSub(sub: Watcher) {
        this.subscribers.push(sub);
    }

    notify() {
        this.subscribers.forEach((sub) => sub.update());
    }
}

/**
 * 订阅者
 */
class Watcher {
    // 需要vue实例上的属性 以获取更新什么数据
    private vm: Vue;
    private key: string;
    private readonly callback: Function;

    /**
     * 构造函数
     * @param vm vue实例
     * @param key 需要更新的数据的key
     * @param callback 回调函数
     */
    constructor(vm: Vue, key: string, callback: Function) {
        this.vm = vm;
        this.key = key;
        this.callback = callback;
        //临时属性 —— 触发getter 把订阅者实例存储到Dependency实例的subscribers里面
        Dependency.temp = this;
        key.split(".").reduce((total: { [key: string]: any }, current: string) => total[current], vm.$data);
        Dependency.temp = null; // 防止订阅者多次加入到依赖实例数组里
    }

    update() {
        const value = this.key
            .split(".")
            .reduce((total: { [key: string]: any }, current: string) => total[current], this.vm.$data);
        this.callback(value);
    }
}
