async function getPlans(i){
    let url = `http://thingproxy.freeboard.io/fetch/https://www.zsk.poznan.pl/plany_lekcji/2023plany/technikum/plany/o${i}.html)`;
    console.log(url);
    fetch(url)
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(err => console.log(err));
}

chrome.runtime.onMessage.addListener(data =>{
    console.log(data);
    if(data.name == 'get-plan-data'){
        getPlans(1);
    }
})