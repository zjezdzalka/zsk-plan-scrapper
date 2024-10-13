var input = document.getElementById("f17_start_func");
if (input) {
    input.addEventListener("click", async function() {
        console.log("Click");
        try {
            chrome.storage.local.clear(function() {
                var error = chrome.runtime.lastError;
                if (error) {
                    console.error(error);
                }
            });
            chrome.storage.sync.clear();

            console.log("cleared storage.");

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

                    function task(delay, port, amount) {
                        let i = 1;
                        const intervalId = setInterval(function() {
                            if (i > amount) {
                                clearInterval(intervalId);
                                return;
                            }
                            port.postMessage({request: "run-data", amount: amount, i: i});
                            let p = document.querySelector('#progress');
                            p.innerText = i + "/" + amount + " planów.";
                            i++;
                        }, delay);
                    }
                    
                    task(250, port, amount);
                }
                else if (msg.name == "values") {
                    if (msg.text !== null) {
                        console.log("Message text is not null:", msg.text);
                    }
                    let p = document.querySelector('#progress');
                    p.innerText = "Finished.";
                    chrome.storage.local.get((result) => {
                        const arr = [];
                        for(let i = 1; i <= result["amount"]; i++){
                            var parser = new DOMParser();
                            var doc = parser.parseFromString(result[i], 'text/html');
                        
                            var container = doc.querySelectorAll('.tabela>tbody');
                            arr[i] = container;
                        }
                        console.log(arr);
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
        });
        chrome.storage.sync.clear();
    });
}