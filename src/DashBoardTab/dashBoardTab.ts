import Data from '../common/data';
import * as chart from '@grapecity/wijmo.chart';
import * as animation from '@grapecity/wijmo.chart.animation';
import * as core from '@grapecity/wijmo';
const HTMLBODY =`
<div id="barchartForProduct"></div>
<div id="barchartForLocation"></div>
<div id="piechart"></div>
<div id="linechart"></div>
`;
export default class DashboardTab {
    #element: Element;
    #data: Data;
    constructor(selector: string){
        this.#data = new Data();
        this.#element = document.querySelector(selector)!;
        this.#element.innerHTML = HTMLBODY;
        this.#init();
    }
    #init(){
        // barchart for sales by product
        const barchartForProduct = new chart.FlexChart('#barchartForProduct', {
            header: 'Sales By Product',
            legend: {
                position: chart.Position.Bottom
            },
            bindingX: 'productName',
            series: [
                {
                    binding: 'productUnitsSale',
                    name: 'Sales'
                }
            ],
            axisX: {
                title: 'Products'
            },
            itemsSource: this.#data.barchartData(),
        });
        new animation.ChartAnimation(barchartForProduct);
        // barchart for sales by location
        const barchartForLocation = new chart.FlexChart('#barchartForLocation', {
            header: 'Sales By Location',
            chartType: chart.ChartType.Bar,
            legend: {
                position: chart.Position.Bottom
            },
            bindingX: 'locationName',
            series: [
                {
                    binding: 'unitsSale',
                    name: 'Sales'
                }
            ],
            axisY: {
                title: 'locations'
            },
            itemsSource: this.#data.barchartDataforLocation(),
        });
        new animation.ChartAnimation(barchartForLocation);
        // pie chart for % of product contribution 
        const pieChart = new chart.FlexPie('#piechart', {
            header: 'Product sales contribution %',
            bindingName: 'productName',
            binding: 'productUnitsSale',
            dataLabel: {
                content: (ht: any) => {
                    return `${ht.name} ${core.Globalize.format(ht.value / this.#data.totalUnits() , 'p2')}`;
                }
            },
            itemsSource: this.#data.barchartData(),
            palette: ['rgba(42,159,214,1)', 'rgba(119,179,0,1)', 'rgba(153,51,204,1)', 'rgba(255,136,0,1)',
            'rgba(204,0,0,1)', 'rgba(0,204,163,1)', 'rgba(61,109,204,1)', 'rgba(82,82,82,1)', 'rgba(0,0,0,1)']
        });
        new animation.ChartAnimation(pieChart);
        // line chart per month sales of each items
        const lineChartData = this.#data.linechartData();
        const lineChart = new chart.FlexChart('#linechart', {
            header: 'Monthly Sales',
            legend: {
                position: chart.Position.Bottom
            },
            chartType: chart.ChartType.Line,
            bindingX: 'month',
            series: lineChartData.seriesData,
            axisY: {
                title: 'Total Sales'
            },
            axisX: {
                title: 'Months'
            },
            itemsSource: lineChartData.data,
            palette: ['rgba(42,159,214,1)', 'rgba(119,179,0,1)', 'rgba(153,51,204,1)', 'rgba(255,136,0,1)', 'rgba(204,0,0,1)', 'rgba(0,204,163,1)', 'rgba(61,109,204,1)', 'rgba(82,82,82,1)', 'rgba(0,0,0,1)']
        });
        new animation.ChartAnimation(lineChart);
    }
}