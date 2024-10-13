var input = document.getElementById("f17_start_func");
if (input) {
    input.addEventListener("click", async function() {
        console.log("Click");
        try {
            var port = chrome.runtime.connect({name: "get-plan-data"});
            port.postMessage({request: "run"});
            port.onMessage.addListener(function(msg) {
                if (msg.name == "amount") {
                    if (msg.text !== null) {
                        console.log("Message text is not null:", msg.text);

                        var parser = new DOMParser();
                        var doc = parser.parseFromString(msg.text, 'text/html');
                        
                        var container = doc.querySelectorAll('#oddzialy>.el');
                        var amount = container.length;

                        if (container) {
                            chrome.storage.local.set({ amount: amount }).then(() => {
                                console.log("Amount is set.");
                            });
                        }
                    }
                    port.postMessage({request: "run-data"});
                }
                else if (msg.name == "amount") {
                    if (msg.text !== null) {
                        console.log("Message text is not null:", msg.text);
                    }
                    chrome.storage.local.get((result) => {
                        for(let i = 1; i < result["amount"]; i++){
                            console.log(result[i]);
                        }
                        console.log(result);
                    });
                }
                else{
                    console.log("Error. Received message doesn't exist.");
                }
            });
        } catch (e) {
            console.log(e);
        }
    });
}

var clear = document.getElementById("f17_clear_info_func");
if (clear) {
    clear.addEventListener("click", async function() {
        chrome.storage.local.clear(function() {
            var error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
            }
            // do something more
        });
        chrome.storage.sync.clear();
    });
}