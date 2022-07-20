import Vue from "../src/Vue";

let vue;
let nameEle, ageEle, inputNameEle, inputAgeEle;
beforeAll(() => {
    document.body.innerHTML = `
    <div id="app">
        <p id="name">{{name}}</p>
        <input id="input-name" type="text" v-model="name"/>
        <p id="age">{{more.age}}</p>
        <input id="input-age" type="text" v-model="more.age"/>
    </div>
    `
    vue = new Vue(
        {
            el: '#app',
            data: {
                name: 'Plantern',
                more: {
                    age: 18
                }
            }
        }
    );
    nameEle = document.querySelector('#name');
    ageEle = document.querySelector('#age');
    inputNameEle = document.querySelector('#input-name');
    inputAgeEle = document.querySelector('#input-age');
})

test('compiler', () => {
        expect(nameEle.innerHTML).toBe('Plantern');
        expect(ageEle.innerHTML).toBe("18");
        expect(inputNameEle.value).toBe("Plantern");
        expect(inputAgeEle.value).toBe("18");
    }
);

test('modelToView', () => {
    // 修改数据
    vue.$data.name = 'Polygene';
    vue.$data.more.age = 20;
    expect(nameEle.innerHTML).toBe('Polygene');
    expect(ageEle.innerHTML).toBe("20");
    expect(inputNameEle.value).toBe("Polygene");
    expect(inputAgeEle.value).toBe("20");

})

test('viewToModel', () => {
    // 通过 View 修改 input 的值
    // 需要手动触发 input 事件
    inputNameEle.value = 'lantern';
    inputNameEle.dispatchEvent(new Event('input'))
    inputAgeEle.value = '1';
    inputAgeEle.dispatchEvent(new Event('input'))
    expect(nameEle.innerHTML).toBe('lantern');
    expect(ageEle.innerHTML).toBe("1");
    expect(inputNameEle.value).toBe("lantern");
    expect(inputAgeEle.value).toBe("1");
});
