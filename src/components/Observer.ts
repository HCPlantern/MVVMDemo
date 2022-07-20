import Dependency from "./Dependency";

/**
 * 数据劫持, 监听实例里的数据
 * @param data_instance 实例里的数据
 * @constructor
 */
export default function observe(data_instance: { [key: string]: any }): void {
    // 递归出口
    if (!data_instance || typeof data_instance !== "object") return;
    // 每次数据劫持一个对象时都创建Dependency实例 用于区分哪个对象对应哪个依赖实例和收集依赖
    const dependency = new Dependency();

    Object.keys(data_instance).forEach((key) => {
        // 使用defineProperty后属性里的值会被修改 需要提前保存属性的值
        let value = data_instance[key];
        // 递归劫持data里的子属性
        observe(value);
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
                observe(newVal);
                dependency.notify();
            },
        });
    });
}
