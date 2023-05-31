import * as wjGridFilter from '@grapecity/wijmo.grid.filter';
import * as wjGridGrouppanel from '@grapecity/wijmo.grid.grouppanel';
import { FlexGrid } from '@grapecity/wijmo.grid';
import { CollectionView } from '@grapecity/wijmo';
import { CollectionViewNavigator } from '@grapecity/wijmo.input';
import { FlexGridSearch } from '@grapecity/wijmo.grid.search';
import { InputDateRange } from '@grapecity/wijmo.input';
import Data from '../common/data';
const HTMLBODY = `
<div id="theDateRange"></div>
<button id="btnDateRanged" class="btn btn-primary">Cancel</button>
<div id="theSearch"></div>
<div id="theGroupPanel"></div>
<div id="theFlexGrid"></div>
<div id="thePager"></div>
`;
export default class ReportTab {
    #data: Data;
    #element: Element;
    constructor(selector: string){
        this.#data = new Data();
        this.#element = document.querySelector(selector)!;
        this.#element.innerHTML = HTMLBODY;
        this.#init();
    }
    
    #init(){
        const currentDate = new Date();
        // create a paged CollectionView with 6 data items per page
        const view = new CollectionView(this.#data.reportTabData(), {
            pageSize: 50
        });
        // the date range box
        const inputDateRange = new InputDateRange('#theDateRange', {
            alwaysShowCalendar: true,
            rangeEndChanged: (dateRangeChanged: {value: Date | null,rangeEnd: Date | null}) => onDateRangeChanged(dateRangeChanged),
            value: new Date(currentDate.getFullYear(), currentDate.getMonth(),1),
            rangeEnd: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
            closeOnSelection: true,
            handleWheel: false,
            min: new Date(2010,0,1),
            max: currentDate
        });
        // navigate the pages
        const pager = new CollectionViewNavigator('#thePager', {
            byPage: true,
            headerFormat: 'Page {currentPage:n0} of {pageCount:n0}',
            cv: view
        });
        // flex grid
        const theFlexGrid = new FlexGrid("#theFlexGrid", {
            autoGenerateColumns: false,
            isReadOnly: true,
            columns: [
                { binding: 'salesOrderId', header: 'Sales OrderId' },
                { binding: 'salesDate', header: 'Sales Date' },
                { binding: 'salesTime', header: 'Sales Time' },
                { binding: 'salesLocation', header: 'Sales Location' },
                { binding: 'salesItem', header: 'Sales Items' },
                { binding: 'salesUnitPrice', header: 'Sales Unit Price' },
                { binding: 'unitsSale', header: 'units Sale' },
                { binding: 'totalPrice', header: 'Sales Total Price' },
            ],
            itemsSource: view
        });
        // console.log(view);
        // adding red color if time exceed from 9pm and formatting date column
        theFlexGrid.formatItem.addHandler((s,e)=>{
            if(e.panel === s.cells ){
                const col = s.columns[e.col];
                if(e.row >= 0 && col.binding == "salesDate" ){
                    e.cell.innerHTML = '<p>' + new Date(s.getCellData(e.row,e.col,true)).toLocaleDateString() + '</p>';
                }
                if(e.row >= 0 && col.binding == "salesTime" ){
                    const currentCellDate = new Date(s.getCellData(e.row,e.col,true));
                    if( currentCellDate.getTime() > new Date(currentCellDate.getFullYear(),currentCellDate.getMonth(),currentCellDate.getDate(),21).getTime() ){
                        e.cell.innerHTML = '<p class="errorText">' + new Date(s.getCellData(e.row,e.col,true)).toLocaleTimeString() + '</p>';
                    }else{
                        e.cell.innerHTML = '<p>' + new Date(s.getCellData(e.row,e.col,true)).toLocaleTimeString() + '</p>';
                    }
                }
            }
        })
        // column level filtering
        const filter = new wjGridFilter.FlexGridFilter(theFlexGrid);
        // group panel for group data by single or multiple column
        const theGroupPanel = new wjGridGrouppanel.GroupPanel('#theGroupPanel', {
            placeholder: 'Drag columns here to create groups',
            grid: theFlexGrid
        });
        // the grid search box
        const searchBox = new FlexGridSearch('#theSearch', {
            placeholder: 'Search',
            grid: theFlexGrid
        });
        // range of date changed handler
        function onDateRangeChanged(dateRangedChanged: {value: Date | null, rangeEnd: Date | null}){
            view.filter = ( item: {salesDate: Date} ) => {
                if(!dateRangedChanged.value || !dateRangedChanged.rangeEnd) return true;
                return dateRangedChanged.value.getTime() <= new Date(item.salesDate).getTime() && dateRangedChanged.rangeEnd.getTime() >= new Date(item.salesDate).getTime();
            }
        }
        // checkbox to apply filtering using date range 
        document.querySelector('#btnDateRanged')?.addEventListener("click",(e: any) => {
            inputDateRange.value = null;
            onDateRangeChanged({value: null,rangeEnd: null});
        })
    }
}