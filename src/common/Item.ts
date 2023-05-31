export default class Item {
    salesItemId: number;
    salesItem: string;
    units: number;
    constructor(id: number,itemName: string,NumOfUnits: number){
        this.salesItemId = id;
        this.salesItem = itemName;
        this.units = NumOfUnits;
    }
}