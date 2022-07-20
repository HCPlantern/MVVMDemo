# 一个 MVVM 框架

## 项目要求

实现一个简单的 MVVM 框架

- [x] 实现数据劫持
- [x] 实现发布订阅模式
- [x] 实现数据单向绑定
- [x] 实现双向绑定
- [x] 使用 Typescript
- [x] 单测覆盖率 80%

## 使用方法

在　`main.ts` 中定义 `MVVM` 入口, 随后运行 `npm run start`

其中, 需要传入 `el` 为绑定的`dom`元素, `data` 为传递的数据

示例:

`main.ts`:

```ts
import Vue from "./Vue";
new Vue({
    el: '#app',
    data: {
        name: 'Lubricants',
        more: {
            salary: 10000
        }
    }
});
```

`index.html`:

```html
...
<body>
<div id="app">
    <p>{{name}}</p>
    <input type="text" v-model="name"/>
    <p>{{more.salary}}</p>
    <input type="text" v-model="more.salary"/>
</div>
</body>
...
```

该项目集成了 Webpack Server, 运行 `npm run start` 即可开启服务器, 默认地址为 `localhost:8888`

## 实现细节

### 数据劫持

使用 `Object.defineProperty` 实现对数据进行 `get` 和 `set` 操作

```ts
Object.defineProperty(data_instance, key, {
    enumerable: true,
    configurable: true,
    get() {
        // ...
        return value;
    },
    set(newVal) {
        // ...
        dependency.notify();
    },
});
```

### 发布-订阅模式

详见 `Observer` 和 `Watcher` 
