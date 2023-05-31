/**
 * subscriptions data format: 
 * { eventType: [ callback, callback ] }
 */
export default class EventBus {
    #subscriptions: Record<string,Array<Function>>;
    constructor(){
        this.#subscriptions = {};
    }
    subscribe(eventType: string, callback: Function) {
    
        if(!this.#subscriptions[eventType])
            this.#subscriptions[eventType] = [];
    
        this.#subscriptions[eventType].push(callback);
    
        return { 
            unsubscribe: () => {
                this.#subscriptions[eventType] = this.#subscriptions[eventType].filter( func => func != callback);

                if(this.#subscriptions[eventType].length === 0) {
                    delete this.#subscriptions[eventType];
                }
            }
        }
    }
    publish(eventType: string, arg: object) {
        if(!this.#subscriptions[eventType])
            return
    
        this.#subscriptions[eventType].forEach( callback => callback(arg));
    }
}