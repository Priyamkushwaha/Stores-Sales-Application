import * as wjNav from '@grapecity/wijmo.nav';
export default class Navbar {
    theNavPanel: wjNav.TabPanel | null = null;
    header: string[];
    selector: string;

    constructor(selector: string,header: string[]){
        this.header = header;
        this.selector = selector;
        this.#init();
    }
    #init(){
        this.theNavPanel = new wjNav.TabPanel(this.selector);
        // inserting tabs in navPanel
        this.header.forEach( head =>{
            // create tab head element
            const tabHead = document.createElement('a');
            tabHead.textContent = head;
            // create tab body element
            const tabBody = document.createElement('div');
            tabBody.innerHTML = `<div id="${head}"><div>`;
            // add the new Tab to the TabPanel
            this.theNavPanel!.tabs.push(new wjNav.Tab(tabHead, tabBody));
        })
    }
}