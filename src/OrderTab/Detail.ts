type Template = {
    totalItems: number,
    totalUnits: number,
    totalPrice: number
}
function getDetailsHtml (args: Template) {
    return `
    <h4 class="displayText">Items: ${args.totalItems}, Number of units: ${args.totalUnits}</h4>
    <h3 class="displayText">Total Price: ${args.totalPrice}</h3>
    `;
}
export default class Detail {
    element: Element;
    totalItems: number;
    totalUnits: number;
    totalPrice: number;
    constructor(selector: string,args: Template){
        this.element = document.querySelector(selector)!;
        this.totalItems = args.totalItems;
        this.totalUnits = args.totalUnits;
        this.totalPrice = args.totalPrice;
        this.addComponent();
    }
    addComponent(){
        this.element.innerHTML = getDetailsHtml({totalItems: this.totalItems,totalPrice: this.totalPrice, totalUnits: this.totalUnits});
    }  
    updateComponent(args: Template){
        this.totalItems = args.totalItems;
        this.totalUnits = args.totalUnits;
        this.totalPrice = args.totalPrice;
        this.addComponent();
    }    
}