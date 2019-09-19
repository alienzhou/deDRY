import Dep from './dep';

const OB_ATTR: string = '__ob__';

class Observer {
    constructor(data: any) {
        Object.defineProperty(data, OB_ATTR, {
            value: this
        });

        if (Array.isArray(data)) {
            data.forEach(Observer.observe);
        }
        else {
            Object.keys(data).forEach(key => {
                this.defineReactive(data, key, data[key]);
            });
        }
    }

    static observe(data: any): Observer {
        if (!data || typeof data !== 'object') {
            return;
        }

        if (data.hasOwnProperty(OB_ATTR)) {
            return data[OB_ATTR];
        }

        const ob = new Observer(data);
        return ob;
    }

    private defineReactive(obj: Object, key: string, val: any) {
        const dep = new Dep();
        Observer.observe(val);
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                if (Dep.target) {
                    dep.depend();
                }
                return val;
            },
            set(newVal) {
                if (newVal === val || (newVal !== newVal && val !== val)) {
                    return;
                }

                val = newVal;
                // observer sub attributes if necessary
                Observer.observe(newVal);
                dep.notify();
            }
        });
    }
}

export default Observer;