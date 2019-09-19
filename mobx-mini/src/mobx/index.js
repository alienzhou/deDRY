import {observable, computed, autorun} from './mobx';

let start = observable({
    number: 1,
    string: '123'
});

class Test {
    @observable start = {};
}

window.start = start;

let $num = computed(() => {
    console.log('computed', start.number);
    return start.number * 10;
});
$num.observe(c => console.log(c));

console.log($num);
start.number = 2;
console.log($num);

window.auto = autorun(() => console.log('autorun', $num.get()));

window.$num = $num;
