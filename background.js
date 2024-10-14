async function getMain(){
    let url = `http://thingproxy.freeboard.io/fetch/https://www.zsk.poznan.pl/plany_lekcji/2023plany/technikum/lista.html)`;
    console.log(url);
    let data = await fetch(url)
        .then(response => response.text())
        .catch(err => console.log(err));
        console.log("Recieved main site.");
    return data;
}

async function getPlans(i, port, amount){
    let url = `http://thingproxy.freeboard.io/fetch/https://www.zsk.poznan.pl/plany_lekcji/2023plany/technikum/plany/o${i}.html)`;
    console.log(url);
    let data = await fetch(url)
        .then(response => response.text())
        .catch(err => console.log(err));
    chrome.storage.local.set({ [i]: data }).then(() => {
        console.log("Value "+i+" is set.");
    });
    port.postMessage({name:"text-update", text: `Pobrano ${i} z ${amount} planów.`})
    return data;
}

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "get-plan-data");
    port.onMessage.addListener(async function(msg) {
        if (msg.request === "run-data"){
            let text="Successful.";
            for(let i = 1; i <= msg.amount; i++){
                await getPlans(i, port, msg.amount);
            }
            console.log("finished uploading.");
            
            port.postMessage({name:"values", text: text});
        }
        else if (msg.request === "run-data-again"){
            let text = "Successful.";
            await getPlans(msg.i, port, msg.amount);
            console.log("finished uploading.");
            
            port.postMessage({name:"values-again", text: text});
        }
        else if (msg.request === "run"){
            let value = await getMain();
            
            port.postMessage({name:"amount", text: value});
        }
        else{
            port.postMessage({text: "Error."});
        }
    });
});
