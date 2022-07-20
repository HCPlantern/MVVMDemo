import Vue from "../Vue";
import Dependency from "./Dependency";

/**
 * 订阅者
 */
export default class Watcher {
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
