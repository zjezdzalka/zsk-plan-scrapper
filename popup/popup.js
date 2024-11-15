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
                        var container_els = doc.querySelectorAll('#oddzialy>.el>a');
                        var amount = container.length;
                        const classes = [];
                        for(let i = 0; i < container.length; i++){
                            classes.push(container_els[i].innerText);
                        }

                        if (container) {
                            chrome.storage.local.set({ amount: amount }).then(() => {
                                console.log("Amount is set.");
                            });
                            chrome.storage.local.set({ classes: JSON.stringify(classes) }).then(() => {
                                console.log("Classes are set.");
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
                    chrome.storage.local.get(async (result) => {
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
                        let teachers, sale, classes, fre, buko, other;
                        if(safe){
                            var p = document.querySelector('#progress');
                            p.innerText = "Przetwarzanie danych...";
                            let data = await exportData(arr);
                            teachers = data["teachers"];
                            sale = data["sale"];
                            classes = data["klasy"];
                            fre = data["fre"];
                            buko = data["buko"];
                            other = data["other"];

                            chrome.storage.local.set({ teachers: teachers }).then(() => {
                                console.log("Teachers is set.");
                            });

                            chrome.storage.local.set({ rooms: sale }).then(() => {
                                console.log("Teachers is set.");
                            });

                            chrome.storage.local.set({ classes_data: classes }).then(() => {
                                console.log("Classes is set.");
                            });

                            chrome.storage.local.set({ fre: fre }).then(() => {
                                console.log("Fredry is set.");
                            });

                            chrome.storage.local.set({ buko: buko }).then(() => {
                                console.log("Bukowska is set.");
                            });

                            chrome.storage.local.set({ other: other }).then(() => {
                                console.log("Other is set.");
                            });

                            chrome.storage.local.get(async (result) => {
                                let teachers = result["teachers"];
                                let amount = result["amount"];
                                let classes = result["classes"];

                                console.log(teachers);
                                console.log(amount);
                                console.log(classes);
                            });
                            printOut();
                        }
                        else{
                            console.log("You may not continue.");
                            teachers = null;
                        }
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

async function exportData(arr){
    const data = {};
    let teachers = {};
    let sale = {};
    let klasy = {};
    let buko = {};
    let fre = {};
    let other = {};
    for(let i = 0; i < arr.length; i++){
        let element = arr[i];
        let lesson = element[0].querySelectorAll("tr");
        for(let j = 0; j < lesson.length; j++){
            if(lesson[j].querySelector(".nr") != null){
                let time = lesson[j].querySelector(".nr").innerText;
                let lessons = lesson[j].querySelectorAll(".l");
                for(let k = 0; k < lessons.length; k++){
                    if(lessons[k].innerHTML.trim() == "&nbsp;") continue;
                    else{
                        if(lessons[k].querySelectorAll("span[style*='font-size:85%']").length > 0){
                            for(let m = 0; m < lessons[k].querySelectorAll("span[style*='font-size:85%']").length; m++){
                                let lessons_block = lessons[k].querySelectorAll("span[style*='font-size:85%']");
                                let lesson_name = lessons_block[m].querySelector(".p");
                                let teacher = lessons_block[m].querySelector(".n");
                                let sala = lessons_block[m].querySelector(".s");
                                
                                let skipTeacher = false;
                                let skipSala = false;
                                
                                if(lesson_name == null) lesson_name = "???";
                                else lesson_name = lesson_name.innerHTML.trim();
        
                                if(teacher == null) skipTeacher = true;
                                else teacher = teacher.innerHTML.trim();

                                if(sala == null) skipSala = true;
                                else sala = sala.innerHTML.trim();

                                
                                if(!skipTeacher){
                                    if(teachers[teacher] == null){
                                        teachers[teacher] = []; 
                                    }   
                                    teachers[teacher].push({time: time, day: k, lesson: lesson_name, sala: sala, class: i});
                                }

                                if(!skipSala){
                                    if(sale[sala] == null){
                                        sale[sala] = [];
                                    }
                                    sale[sala].push({time: time, day: k, lesson: lesson_name, class: i, teacher: teacher});
    
                                    if(sala[0] == "B"){
                                        if(buko[time] == null){
                                            buko[time] = [];
                                        }
                                        buko[time].push({day: k, class: i, teacher: teacher});
                                    }
                                    else if(!isNaN(parseInt(sala[0]))){
                                        if(fre[time] == null){
                                            fre[time] = [];
                                        }
                                        fre[time].push({day: k, class: i, teacher: teacher});
                                    }
                                    else{
                                        if(other[time] == null){
                                            other[time] = [];
                                        }
                                        other[time].push({day: k, class: i, teacher: teacher, sala: sala});
                                    }
                                }

                                if(klasy[i] == null){
                                    klasy[i] = [];
                                }
                                klasy[i].push({time: time, day: k, teacher: teacher, lesson: lesson_name, sala: sala});
                            }
                        }
                        else{
                            let lesson_name = lessons[k].querySelector(".p");
                            let teacher = lessons[k].querySelector(".n");
                            let sala = lessons[k].querySelector(".s");

                            let skipTeacher = false;
                            let skipSala = false;
                            
                            if(lesson_name == null) lesson_name = "???";
                            else lesson_name = lesson_name.innerHTML.trim();
    
                            if(teacher == null) skipTeacher = true;
                            else teacher = teacher.innerHTML.trim();

                            if(sala == null) skipSala = true;
                            else sala = sala.innerHTML.trim();

                            if(!skipTeacher){
                                if(teachers[teacher] == null){
                                    teachers[teacher] = []; 
                                }   
                                teachers[teacher].push({time: time, day: k, lesson: lesson_name, sala: sala, class: i});
                            }

                            if(!skipSala){
                                if(sale[sala] == null){
                                    sale[sala] = [];
                                }
                                sale[sala].push({time: time, day: k, lesson: lesson_name, class: i, teacher: teacher});

                                if(sala[0] == "B"){
                                    if(buko[time] == null){
                                        buko[time] = [];
                                    }
                                    buko[time].push({day: k, class: i, teacher: teacher});
                                }
                                else if(!isNaN(parseInt(sala[0]))){
                                    if(fre[time] == null){
                                        fre[time] = [];
                                    }
                                    fre[time].push({day: k, class: i, teacher: teacher});
                                }
                                else{
                                    if(other[time] == null){
                                        other[time] = [];
                                    }
                                    other[time].push({day: k, class: i, teacher: teacher, sala: sala});
                                }
                            }

                            if(klasy[i] == null){
                                klasy[i] = [];
                            }
                            klasy[i].push({time: time, day: k, teacher: teacher, lesson: lesson_name, sala: sala});
                        }
                    }
                }
            }
        }
    }
    data["teachers"] = JSON.stringify(teachers);
    data["sale"] = JSON.stringify(sale);
    data["klasy"] = JSON.stringify(klasy);
    data["buko"] = JSON.stringify(buko);
    data["fre"] = JSON.stringify(fre);
    data["other"] = JSON.stringify(other);
    return data;
}

function printOut(){
    chrome.windows.create({
        url: chrome.runtime.getURL("index.html"),
        type: "popup",
        focused: true,
        height: 1000,
        width: 1650
    })
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

var open = document.getElementById("f17_open_func");
if (open) {
    open.addEventListener("click", async function() {
        printOut();
    });
}