import Dep from './dep';

interface IDeps {
    [propName: number]: boolean
}

class Watcher {
    cb: Function = null;
    deps: IDeps = {};

    constructor(cb: Function) {
        this.cb = cb;
    }

    // add watcher itself to Dep
    addDep(dep: Dep) {
        if (!this.deps[dep.id]) {
            dep.addSub(this);
            this.deps[dep.id] = true;
        }
    }

    update() {
        if (this.cb) {
            this.cb();
        }
    }
}

export default Watcher;