import Item from './Item';
import STOREDATA from '../data.json';
const dbName = 'Storage';
import EventBus from "./EventBus";
type StoreDataTemplate = {
    id: number,
    location : string ;
    items: Array<{id: number,item: string,price: number}>
}
type OrderRecordTemplate = {
    orderId: number | null,
    billDate: Date | null,
    billTime: Date | null,
    locationId: number | null,
    items: Array<Item> | null,
    totalPrice: number | null
}
export default class OrderManager {
    storesData: Array<StoreDataTemplate> | null = null;
    ordersData: Array<OrderRecordTemplate> | null = null;
    event: EventBus = new EventBus();
    record: OrderRecordTemplate = {
        orderId: null,
        billDate: null,
        billTime: null,
        locationId: null,
        items: null,
        totalPrice: null
    };
    constructor(){
        // this will check in if any storage created in localStorage for storing or not and if not created then it will create
        this.#checkFordb();
        this.storesData = this.getStoresData();
        this.ordersData = this.getOrdersDataPresentInDb();
        this.record.orderId = this.ordersData?.length!;
        this.record.locationId = 0;
        const currentDateTime = new Date();
        this.record.billDate =  this.record.billTime = currentDateTime;
        this.record.items = [];
        this.record.totalPrice = 0;
    }
    // will update date 
    setDate(changedDate: Date){
        this.record.billDate = changedDate;
        this.event.publish('dateChanged',{
            dateValue: this.record.billDate
        }) 
        console.log(this);
    }
    // will update time
    setTime(changedTime: Date){
        this.record.billTime = changedTime;
        this.event.publish('timeChanged',{
            timeValue: this.record.billTime
        })
        console.log(this.record);
    }
    // will update locationId 
    setLocationId(changedLocation: string){
        const changedLocationId = this.storesData?.find(( data: StoreDataTemplate) => data.location === changedLocation )?.id;
        this.record.locationId = changedLocationId!;
        this.setItems([]);
        this.setTotalPrice();
        this.event.publish('locationChanged',{
            itemsDataInStore: this.getItemsDataInStore(),
            itemsLength: this.record.items?.length,
            totalUnits: this.getTotalUnits(),
            totalPrice: this.record.totalPrice
        })
        console.log(this.record);
    }   
    // will update items 
    setItems(changedCheckedItems: Array<{id: number,item: string}>){
        // creating mapping in id and units of items data
        const itemMappingData = new Map();
        this.record.items?.forEach( (item: Item)=> {
            itemMappingData.set(item.salesItemId,item.units);
        });
        // creating new items data 
        const newitems = changedCheckedItems.map(( itemData )=>{
            const tempItem = new Item(0,"",0);
            tempItem.salesItemId = itemData.id;
            tempItem.salesItem = itemData.item;
            const unitValue = itemMappingData.get(itemData.id);
            tempItem.units = unitValue? unitValue:0;
            return tempItem;
        })
        this.record.items = newitems;
        this.setTotalPrice();
        this.event.publish('itemsChanged',{
            itemOrderData: this.getItemOrderData(),
            itemsDataInStore: this.getItemsDataInStore(),
            itemsLength: this.record.items?.length,
            totalUnits: this.getTotalUnits(),
            totalPrice: this.record.totalPrice
        });
        console.log(this.record);
    }
    // will update units in items 
    setUnits(changedValue: number,changedValueItemName: string){
        this.record.items?.forEach( ( item ) => {
            if(item.salesItem === changedValueItemName) item.units = changedValue; 
        })
        this.setTotalPrice();
        this.event.publish('unitsChanged',{
            itemsLength: this.record.items?.length,
            totalUnits: this.getTotalUnits(),
            totalPrice: this.record.totalPrice
        })
        console.log(this.record);
    }
    // will update total price 
    setTotalPrice(){
        if(!this.record.items?.length) {
            this.record.totalPrice = 0;
            return;
        }
        const itemPerUnitData = this.getItemsDataInStore()!;
        this.record.totalPrice = 0;
        this.record.items.forEach( ( item ) => {
            this.record.totalPrice! += item.units*itemPerUnitData[item.salesItemId].price;
        })
    }
    getItemOrderData(){
        return this.record.items?.map( ( item ) => {
            const tempObj: {id: number,units: number} = { id: 0,units: 0 };
            tempObj.id = item.salesItemId;
            tempObj.units = item.units;
            return tempObj;
        } );
    }
    // will give total units selected 
    getTotalUnits(){
        let totalUnits = 0;
        this.record.items?.forEach( ( item ) => totalUnits+=item.units );
        return totalUnits;
    } 
    getStoresData(){
        if(!STOREDATA) return null;
        return STOREDATA;
    }
    getOrdersDataPresentInDb(){
        return JSON.parse(localStorage.getItem(dbName)!);
    }
    #checkFordb(){
        if(!localStorage.getItem(dbName)) localStorage.setItem(dbName,'[]');
    }
    getItemsDataInStore(){
        return this.storesData?.find( ( oneStoreData ) => oneStoreData.id === this.record.locationId )?.items;
    }
    // storing data in localStorage
    storeOrder(){
        this.ordersData?.push(this.record);
        localStorage.setItem('Storage',JSON.stringify(this.ordersData));
        this.event.publish("orderStored",{});
        // console.log(JSON.parse(localStorage.getItem('Storage')));
    }
}