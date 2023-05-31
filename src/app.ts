import 'bootstrap/dist/css/bootstrap.min.css'
import '@grapecity/wijmo.styles/wijmo.css';
import './styles.css';
//
import OrderTab from './OrderTab/orderTab';
import ReportTab from './ReportTab/reportTab';
import DashboardTab from './DashBoardTab/dashBoardTab';
import Navbar from './common/NavBar';
// //
document.readyState === 'complete' ? init() : window.onload = init;
//
function init() {
    // Navbar
    const theNavbar = new Navbar("#app",['Order','Reports','DashBoard']); 
    // // order tab
    new OrderTab(`#${theNavbar.header[0]}`);
    // // report tab
    new ReportTab(`#${theNavbar.header[1]}`);
    // // DashBoard tab
    new DashboardTab(`#${theNavbar.header[2]}`);

    // event handler for navbar navigation
    theNavbar.theNavPanel?.selectedIndexChanged.addHandler((e: any) => {
        if(e.selectedIndex === -1 || e.selectedIndex === 0 )
            return;
        if(e.selectedIndex === 1)
            new ReportTab(`#${theNavbar.header[e.selectedIndex]}`);
        if(e.selectedIndex === 2)
            new DashboardTab(`#${theNavbar.header[e.selectedIndex]}`);
    })
}