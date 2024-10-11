import getPlans from './api/getPlan.js';
chrome.runtime.onMessage.addListener(data =>{
    console.log(data);
    if(data.name == 'get-plan-data'){
        getPlans(1);
    }
})