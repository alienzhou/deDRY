import Watcher from './watcher';

let idx = 0;

class Dep {
    static target: Watcher = null;
    id: number = null;
    subs: Watcher[] = [];

    constructor() {
        this.id = ++idx;
    }

    watchers: Watcher[] = [];

    addSub(watcher: Watcher) {
        this.watchers.push(watcher);
    }

    depend() {
        Dep.target.addDep(this);
    }

    notify() {
        this.watchers.forEach(watch => watch.update());
    }
}

export default Dep;