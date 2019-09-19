// cSpell: ignore autorun, mobx
import './index.less';
import './mobx';
import {autorun, observable} from './observer';

function tick() {
    var $time = document.getElementById('js-time');
    $time.textContent = (new Date()).toLocaleString();
    setTimeout(tick, 1000);
}

document.getElementById('async').addEventListener('click', () => {
    import('./async').then(mod => mod.default(new Date()));
});

tick();

const reactData = {
    name: 'tom',
    age: 123,
    info: {
        desc: 'a good man',
        address: 'beijing'
    }
};
observable(reactData);
window.reactData = reactData;
autorun(() => {
    console.log('autorun', reactData.info.desc);
});