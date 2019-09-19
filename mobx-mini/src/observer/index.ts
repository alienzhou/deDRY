// cSpell: ignore autorun
import autorun from './autorun';
import Observer from './observable';

function observable(data: any): void {
    new Observer(data);
}

export {
    autorun,
    observable
};