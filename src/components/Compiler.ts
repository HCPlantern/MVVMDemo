import Watcher from "./Watcher";
import Vue from "../Vue";

/**
 * 模板解析, 替换 DOM 内容, 把 vue 实例上的数据解析到页面上, 同时监听输入框的 input 事件
 * @param element Vue实例挂载的元素
 * @param vm Vue实例
 */
export default function Compile(element: any, vm: Vue) {
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
        const pattern = /{{\s*(\S+)\s*}}/;
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
        if (node.nodeType === 1 && (node.nodeName === "INPUT" || node.nodeName === "TEXTAREA")) {
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
    vm.$el.appendChild(fragment);
}
