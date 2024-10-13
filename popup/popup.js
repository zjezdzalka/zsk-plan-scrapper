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
                    port.postMessage({request: "run-data", amount: amount});
                }
                else if (msg.name == "values") {
                    if (msg.text !== null) {
                        console.log("Message text is not null:", msg.text);
                    }
                    else{
                        console.log("Error. Message text is null.");
                    }
                    chrome.storage.local.get((result) => {
                        let arr = [];
                        let safe = 1;
                        for(let i = 1; i <= result["amount"]; i++){
                            var parser = new DOMParser();
                            var doc = parser.parseFromString(result[i], 'text/html');
                        
                            var container = doc.querySelectorAll('.tabela>tbody');
                            arr[i] = container;
                            if(arr[i].length != 0) console.log("Container "+i+" is not null.");
                            else{ 
                                var p = document.querySelector('#progress');
                                p.innerText = "Error. Uruchom ponownie. Brak planu "+i+".";
                                console.log("Error. Container "+i+" is null.");
                                safe = false;
                            }
                        }
                        arr = arr.filter(element => element !== null && element !== undefined);
                        console.log(arr);
                        if(safe) exportData(arr);
                    });
                }
                else if(msg.name == "text-update"){
                    console.log("Message text is not null:", msg.text);
                    var p = document.querySelector('#progress');
                    p.innerText = msg.text;
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

function exportData(arr){
    const teachers = [];
    const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];
    const times = ["7:10-7:55", "8:00-8:45", "8.50-9.35", "9.50-10.35", "10.40-11.25", "11.30-12.15", "12.30-13:15", "13:20-14:05", "14:10-14:55", "15:00-15:45", "15:50-16:35", "16:40-17:25"];
    for(let i = 0; i < arr.length; i++){
        let element = arr[i];
        console.log(element);
        let lesson = element[0].querySelectorAll("tr");
        console.log(lesson);
        for(let j = 0; j < lesson.length; j++){
            if(lesson[j].querySelector(".nr") != null){
                let time = lesson[j].querySelector(".nr").innerText;
                let lessons = lesson[j].querySelectorAll(".l");
                for(let k = 0; k < lessons.length; k++){
                    console.log(lessons[k]);
                    if(lessons[k].innerHTML.trim() == "&nbsp;") continue;
                    else{
                        console.log(lessons[k].querySelectorAll("span"));
                        console.log(lessons[k].querySelector(".p"), lessons[k].querySelector(".n"), lessons[k].querySelector(".s"));


                        let lesson_name = lessons[k].querySelector(".p");
                        let teacher = lessons[k].querySelector(".n");
                        let sala = lessons[k].querySelector(".s");
                        
                        if(lesson_name == null) lesson_name = lessons[k].innerHTML.trim();
                        else lesson_name = lesson_name.innerHTML.trim();

                        if(teacher == null) continue;
                        else teacher = teacher.innerHTML.trim();

                        if(sala == null) sala = lesson_name;
                        else sala = sala.innerHTML.trim();

                        console.log(lesson_name, teacher, sala);   

                        if(teachers[teacher] == null){
                            teachers[teacher] = [];
                        }
                        teachers[teacher].push({time: time, day: days[k], lesson: lesson_name, sala: sala});
                    }
                }
            }
        }
    }
    console.log(teachers);
    return arr;
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