import Dep from './dep';
import Watcher from './watcher';

export default function (cb: Function) {
    const watcher = new Watcher(cb);
    Dep.target = watcher;
    cb();
}