import STOREDATA from '../data.json';
import Item from './Item';
const dbName = 'Storage';
type OrderRecordTemplateImprovised = {
    salesOrderId: number,
    salesDate: Date,
    salesTime: Date,
    salesLocation: string,
    salesItem: string,
    salesUnitPrice: number,
    unitsSale: number,
    totalPrice: number
}
type OrderRecordTemplate = {
    orderId: number | null,
    billDate: Date | null,
    billTime: Date | null,
    locationId: number | null,
    items: Array<Item> | null,
    totalPrice: number | null
}
type StoreDataTemplate = {
    id: number,
    location : string ;
    items: Array<{id: number,item: string,price: number}>
}
export default class Data {
    #source: { ordersData: Array<OrderRecordTemplate> | null,storesData: Array<StoreDataTemplate> | null } = { ordersData: null, storesData: null};
    constructor(){
        this.#source!.ordersData = JSON.parse(localStorage.getItem(dbName)!);
        this.#source!.storesData = STOREDATA;
        // precondition check
        if(!this.#source!.ordersData) throw Error("Records not found");
        if(!this.#source!.storesData) throw Error("Store data not found");
    }
    totalUnits(){
        let totalUnits = 0;
        this.#source!.ordersData?.forEach( singleData => singleData.items?.forEach( singleItem => totalUnits+=singleItem.units) )
        return totalUnits
    }
    // building data for report tab panel flexGrid
    reportTabData(){
        const data: Array<OrderRecordTemplateImprovised> = [];
        this.#source!.ordersData?.forEach( singleOrderData => singleOrderData.items?.forEach( singleItemData => data.push({
            salesOrderId: data.length,
            salesDate: singleOrderData.billDate!,
            salesTime: singleOrderData.billTime!,
            salesLocation: this.#source!.storesData?.at(singleOrderData.locationId!)?.location!,
            salesItem: singleItemData.salesItem,
            salesUnitPrice: this.#source!.storesData!.at(singleOrderData.locationId!)?.items.at(singleItemData.salesItemId)?.price!,
            unitsSale: singleItemData.units,
            totalPrice: this.#source!.storesData!.at(singleOrderData.locationId!)?.items.at(singleItemData.salesItemId)?.price!*singleItemData.units
        })));
        return data;
    }
    // building data for bar chart sales by product 
    barchartData(){
        const data: Array<{productName: string, productUnitsSale: number}> = [];
        // dataMap for product total units
        const dataMapTotalUnits = new Map(); 
        // dataMap for product unit price
        const dataMapUnitPrice = new Map();
        
        this.#source!.storesData?.forEach( singleData => singleData.items.forEach( item => {
            dataMapTotalUnits.set(item.item,0);
            dataMapUnitPrice.set(item.item,item.price);
        }));
        this.#source!.ordersData?.forEach( singleData => singleData.items?.forEach( item => dataMapTotalUnits.set(item.salesItem,item.units+dataMapTotalUnits.get(item.salesItem))));
        
        for(let v of dataMapTotalUnits){
            data.push({
                productName: v[0],
                productUnitsSale: v[1] * dataMapUnitPrice.get(v[0])
            })
        }
        return data;
    }
    // building data for bar chart sales by location 
    barchartDataforLocation(){
        const data: Array<{locationName: string, unitsSale: number}> = [];
        // dataMap for total units
        const dataMapTotalUnits = new Map();
        // dataMap for product unit price
        const dataMapUnitPrice = new Map();
        this.#source!.storesData?.forEach( singleData => singleData.items.forEach( item => {
            dataMapTotalUnits.set(singleData.location,0)
            dataMapUnitPrice.set(item.item,item.price);
        }));
        // calculating total price for each location
        this.#source!.ordersData?.forEach( singleData => {
            let totalCost = 0;
            singleData.items?.forEach( item => totalCost+=(item.units*dataMapUnitPrice.get(item.salesItem)) );
            const locationName = this.#source!.storesData?.at(singleData.locationId!)?.location;
            dataMapTotalUnits.set(locationName, dataMapTotalUnits.get(locationName)+totalCost);
        })
        for(let v of dataMapTotalUnits){
            data.push({
                locationName: v[0],
                unitsSale: v[1]
            })
        }
        return data;
    }
    // building data for line chart for product monthly sales
    linechartData(){
        const data: Array<any> = [];
        const monthData = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const itemsList: Set<string> = new Set();
        // dataMap for product unit price
        const dataMapUnitPrice = new Map();
        this.#source!.storesData?.forEach( singleData => singleData.items.forEach( item => {
            itemsList.add(item.item)
            dataMapUnitPrice.set(item.item,item.price);
        }));
        
        const dataTemp: any = {
            month: undefined
        }
        for(let item of itemsList){
            dataTemp[item] = 0;
        }
        for(let mn of monthData){
            const newObj = {...dataTemp};
            newObj.month = mn;
            data.push(newObj);
        }
        this.#source.ordersData?.forEach( singleOrder => singleOrder.items?.forEach( singleItem => data[new Date(singleOrder.billDate!).getMonth()][singleItem.salesItem]+=(singleItem.units*dataMapUnitPrice.get(singleItem.salesItem))));

        const seriesData = Object.assign(Array.from(itemsList,(v:any) => ({binding: v,name: v})))
        
        return {
            data: data,
            seriesData: seriesData
        };
    }
}