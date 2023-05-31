import * as input from '@grapecity/wijmo.input';
import InputQuantity from './InputQuantity';
import Detail from './Detail';
import OrderManager from '../common/OrderManager';
type ItemOrderDataTemplate = {
    id: number;
    units: number;
}
type ItemsDataInStoreTemplate = {
    id: number;
    item: string;
    price: number;
}
type ControlTemplate = {
    theInputDate: input.InputDate | null,
    theInputTime: input.InputTime | null,
    theinputLocation: input.ComboBox | null,
    theInputItems: input.MultiSelectListBox | null,
    theInputQuantity: InputQuantity | null,
    theDetailBox : Detail | null
}
const htmlBody = `
<header>
    <h1><span>Order</span></h1>
</header>
<main>
<form >
<div class="containerWrapper1">
    <div class="container1">
        <label for="dateBox">Date</label>
        <br>
        <input id="dateBox">
    </div>
    <div class="container2">
        <label for="timeBox">Time</label>
        <br>
        <input id="timeBox">
    </div>
    <div class="container3">
        <label for="locationBox">Select Location</label>
        <br>
        <input id="locationBox">
    </div>
</div>
<div class="containerWrapper2">
    <div class="container1">
        <input id="listBox">
    </div>
    <div class="container2">
        <div class="subContainer1"></div>
        <div class="subContainer2">
            <hr>
            <div class="displayTextContainer"></div>
            <hr>
        </div>
        <button id="btnSubmit" class="btn btn-primary">
            Submit
        </button>
    </div>
</div>
</form>
</main>
`;
export default class OrderTab {
    order: OrderManager;
    element: Element;
    #controls: ControlTemplate;
    constructor(selector: string){
        this.order = new OrderManager();
        this.element = document.querySelector(`${selector}`)!;
        this.element.innerHTML = htmlBody;
        this.#controls = {
            theInputDate: null,
            theInputTime: null,
            theinputLocation: null,
            theInputItems: null,
            theInputQuantity: null,
            theDetailBox : null
        };
        this.#init();
    }
    #init(){
        // inputDate component
        this.#controls.theInputDate = new input.InputDate( '#dateBox', {
            min: new Date(this.order.record.billDate!.getFullYear(),this.order.record.billDate!.getMonth(),this.order.record.billDate!.getDate()-2),
            max: new Date(),
            value: this.order.record.billDate,
            format: 'MMM dd, yyyy',
            valueChanged: (changedDate: {value: Date}) => {
                // will update order date here
                this.order.setDate(changedDate.value);
            }
        });

        // inputTime Component
        this.#controls.theInputTime = new input.InputTime( '#timeBox', {
            format: 'h:mm tt',
            step: 1,
            value: this.order.record.billTime,
            valueChanged: (changedTime: {value: Date}) => {
                // will update order time here
                this.order.setTime(changedTime.value);
            }
        });

        // inputLocation component
        this.#controls.theinputLocation = new input.ComboBox( '#locationBox', {
            displayMemberPath: 'location',
            itemsSource: this.order.storesData,
            selectedIndexChanged: (changedLocation: {text: string}) => {
                // will update order locationid here 
                this.order.setLocationId(changedLocation.text);
            }
        });
        // inputList component
        this.#controls.theInputItems = new input.MultiSelectListBox( '#listBox', {
            checkOnFilter: false,
            showFilterInput: true,
            checkedMemberPath: 'selected',
            displayMemberPath: 'item',
            itemsSource: this.order.getItemsDataInStore(),
            checkedItemsChanged: (changedCheckedItems: {checkedItems: Array<{id: number,item: string}>}) => {
                // will update items here
                this.order.setItems(changedCheckedItems.checkedItems);
            }
        });
        // inputQuantityComponent
        this.#controls.theInputQuantity = new InputQuantity( '.subContainer1',{
            itemOrderData : this.order.getItemOrderData()!,
            itemsDataInStore: this.order.getItemsDataInStore()!
        })
        // details component
        this.#controls.theDetailBox = new Detail('.displayTextContainer',{
            totalItems: this.order.record.items?.length!,
            totalUnits: this.order.getTotalUnits()!,
            totalPrice: this.order.record.totalPrice!
        })
        // event listeners
        this.#controls.theInputQuantity.event.subscribe("unitChanged",(e: { changedValue: number, id: string }) => {
            this.order.setUnits(e.changedValue, e.id );
        })

        this.order.event.subscribe('locationChanged',(e: {itemsDataInStore: Array<ItemsDataInStoreTemplate>,itemsLength: number,totalUnits: number,totalPrice: number})=>{
            this.#controls.theInputItems!.itemsSource = e.itemsDataInStore;
            this.#controls.theInputItems!.checkedItems = [];
            this.#controls.theDetailBox!.updateComponent({
                totalItems: e.itemsLength,
                totalUnits: e.totalUnits,
                totalPrice: e.totalPrice
            })
        })
        this.order.event.subscribe('itemsChanged',(e: {itemOrderData: Array<ItemOrderDataTemplate>, itemsDataInStore: Array<ItemsDataInStoreTemplate>,itemsLength: number,totalUnits: number,totalPrice: number})=>{
            this.#controls.theInputQuantity!.updateComponent({
                itemOrderData : e.itemOrderData,
                itemsDataInStore: e.itemsDataInStore
            });
            this.#controls.theDetailBox!.updateComponent({
                totalItems: e.itemsLength,
                totalUnits: e.totalUnits,
                totalPrice: e.totalPrice
            })
        })
        this.order.event.subscribe('unitsChanged',(e: {itemsLength: number,totalUnits: number,totalPrice: number})=>{
            this.#controls.theDetailBox!.updateComponent({
                totalItems: e.itemsLength,
                totalUnits: e.totalUnits,
                totalPrice: e.totalPrice
            })
        })
        // submit event
        document?.querySelector('#btnSubmit')?.addEventListener('click',this.#onSubmit.bind(this));
    }
    #onSubmit( e: any ) {
        e.preventDefault();
        if(this.#isAllSet()){
            this.order.storeOrder();
            this.order = new OrderManager();
            this.#controls.theInputItems!.checkedItems = [];
            this.element.innerHTML = htmlBody;
            this.#init();
            // popup message when order submitted
            const popUpElement = document.createElement('div');
            popUpElement.textContent = "Order submitted successfully";
            new input.Popup(popUpElement,{
                owner: document.getElementById('btnSubmit'),
                showTrigger: 'None',
                hideTrigger: 'Blur'
            }).show();
        }
    }
    #isAllSet(){
        if (this.order.record.items?.length === 0) {
            document?.querySelector('#listBox')?.classList.add('error');
            return false;
        } else {
            document?.querySelector('#listBox')?.classList.remove("error");
        }
        // flag
        let isAllSet = true;
        this.order.record.items?.forEach(( item ) => {
            if (!item.units) {
                document?.querySelector(`#${item.salesItem}`)?.classList.add("error");
                isAllSet = false;
            } else {
                document?.querySelector(`#${item.salesItem}`)?.classList.remove("error");
            }
        });
        return isAllSet;
    }
}