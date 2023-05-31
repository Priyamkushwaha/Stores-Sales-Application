import * as input from '@grapecity/wijmo.input';
import EventBus from '../common/EventBus';
type ItemOrderDataTemplate = {
    id: number;
    units: number;
}
type ItemsDataInStoreTemplate = {
    id: number;
    item: string;
    price: number;
}
function getQuantityHtml (args: {itemName: string,itemUnitPrice: number}) {
    return `
    <label>${args.itemName} 1 unit price : ${args.itemUnitPrice}</label>
    <br>
    <input id="${args.itemName}">
    <br>
    `;
}
export default class InputQuantity {
    event: EventBus;
    element: Element;
    itemOrderData: Array<ItemOrderDataTemplate>;
    itemsDataInStore: Array<ItemsDataInStoreTemplate>;
    constructor(selector: string,args: {itemOrderData: Array<ItemOrderDataTemplate>, itemsDataInStore: Array<ItemsDataInStoreTemplate>}){
        this.element = document.querySelector(selector)!;
        this.itemOrderData = args.itemOrderData;
        this.itemsDataInStore = args.itemsDataInStore;
        this.event = new EventBus();
        this.#init();
    }
    #init(){
        this.#addHtmlInDOM();
        this.#addWijmoComponent();
    }
    #addHtmlInDOM(){
        let html = "";
        this.itemOrderData.forEach( ( item ) => {
            html+=getQuantityHtml({itemName: this.itemsDataInStore[item.id].item,itemUnitPrice: this.itemsDataInStore[item.id].price});
        });
        this.element.innerHTML = html;
    }
    #addWijmoComponent(){
        this.itemOrderData.forEach( ( item ) => {
            new input.InputNumber( `#${this.itemsDataInStore[item.id].item}`,{
                format: 'n0',
                min: 0,
                step: 1,
                value: item.units,
                valueChanged: (changedValue: {value: number,hostElement: { id: number}}) => {
                    // publishing event when units changed 
                    this.event.publish("unitChanged",{
                        changedValue: changedValue.value,
                        id: changedValue.hostElement.id
                    })
                }
            });
        })
    }
    updateComponent(args: {itemOrderData: Array<ItemOrderDataTemplate>,itemsDataInStore: Array<ItemsDataInStoreTemplate>}){
        this.itemOrderData = args.itemOrderData;
        this.itemsDataInStore = args.itemsDataInStore;
        this.#init();
    }
}