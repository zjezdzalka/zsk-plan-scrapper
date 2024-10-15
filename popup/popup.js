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
                        let teachers, sale, classes;
                        if(safe){
                            var p = document.querySelector('#progress');
                            p.innerText = "Przetwarzanie danych...";
                            teachers = await exportTeacherData(arr);
                            console.log(teachers);
                            chrome.storage.local.set({ teachers: teachers }).then(() => {
                                console.log("Teachers is set.");
                            });

                            sale = await exportRoomData(arr);
                            console.log(sale);
                            chrome.storage.local.set({ rooms: sale }).then(() => {
                                console.log("Teachers is set.");
                            });

                            classes = await exportClassData(arr);
                            console.log(classes);
                            chrome.storage.local.set({ classes_data: classes }).then(() => {
                                console.log("Classes is set.");
                            });

                            chrome.storage.local.get(async (result) => {
                                let teachers = result["teachers"];
                                let amount = result["amount"];
                                let classes = result["amount"];
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

async function exportTeacherData(arr){
    const teachers = {};
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
                                
                                if(lesson_name == null) lesson_name = "???";
                                else lesson_name = lesson_name.innerHTML.trim();

                                if(teacher == null) continue;
                                else teacher = teacher.innerHTML.trim();

                                if(sala == null) sala = lesson_name;
                                else sala = sala.innerHTML.trim();

                                if(teachers[teacher] == null){
                                    teachers[teacher] = [];
                                }
                                teachers[teacher].push({time: time, day: k, lesson: lesson_name, sala: sala, class: i});
                            }
                        }
                        else{
                            let lesson_name = lessons[k].querySelector(".p");
                            let teacher = lessons[k].querySelector(".n");
                            let sala = lessons[k].querySelector(".s");
                            
                            if(lesson_name == null) lesson_name = "???";
                            else lesson_name = lesson_name.innerHTML.trim();
    
                            if(teacher == null) continue;
                            else teacher = teacher.innerHTML.trim();

                            if(sala == null) sala = lesson_name;
                            else sala = sala.innerHTML.trim();

                            if(teachers[teacher] == null){
                                teachers[teacher] = []; 
                            }   
                            teachers[teacher].push({time: time, day: k, lesson: lesson_name, sala: sala, class: i});
                        }
                    }
                }
            }
        }
    }
    return JSON.stringify(teachers);
}

async function exportRoomData(arr){
    const rooms = {};
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
                                
                                if(lesson_name == null) lesson_name = "???";
                                else lesson_name = lesson_name.innerHTML.trim();

                                if(teacher == null) teacher = "???";
                                else teacher = teacher.innerHTML.trim();

                                if(sala == null) continue;
                                else sala = sala.innerHTML.trim();

                                if(rooms[sala] == null){
                                    rooms[sala] = [];
                                }
                                rooms[sala].push({time: time, day: k, lesson: lesson_name, class: i, teacher: teacher});
                            }
                        }
                        else if(lessons[k].querySelectorAll(".p").length>2){
                            for(let m=0;m<lessons[k].querySelectorAll(".p").length;m+=2){
                                let lesson_name = lessons[k].querySelectorAll(".p")[m];
                                let sala = lessons[k].querySelectorAll(".s")[m/2];
                                let teacher = lessons[k].querySelector(".n");

                                if(lesson_name == null) lesson_name = "???";
                                else lesson_name = lesson_name.innerHTML.trim();
        
                                if(teacher == null) teacher = lesson_name;
                                else teacher = teacher.innerHTML.trim();

                                if(sala == null) continue;
                                else sala = sala.innerHTML.trim();

                                if(rooms[sala] == null){
                                    rooms[sala] = []; 
                                }   
                                rooms[sala].push({time: time, day: k, lesson: lesson_name, class: i, teacher: teacher});
                            }
                        }
                        else{
                            let lesson_name = lessons[k].querySelector(".p");
                            let teacher = lessons[k].querySelector(".n");
                            let sala = lessons[k].querySelector(".s");
                            
                            if(lesson_name == null) lesson_name = "???";
                            else lesson_name = lesson_name.innerHTML.trim();
    
                            if(teacher == null) teacher = "???";
                            else teacher = teacher.innerHTML.trim();

                            if(sala == null) continue;
                            else sala = sala.innerHTML.trim();

                            if(rooms[sala] == null){
                                rooms[sala] = []; 
                            }   
                            rooms[sala].push({time: time, day: k, lesson: lesson_name, class: i, teacher: teacher});
                        }
                    }
                }
            }
        }
    }
    return JSON.stringify(rooms);
}

async function exportClassData(arr){
    const classes = {};
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
                                
                                if(lesson_name == null) lesson_name = "???";
                                else lesson_name = lesson_name.innerHTML.trim();

                                if(teacher == null) teacher = "???";
                                else teacher = teacher.innerHTML.trim();

                                if(sala == null) continue;
                                else sala = sala.innerHTML.trim();

                                if(classes[i] == null){
                                    classes[i] = [];
                                }
                                classes[i].push({time: time, day: k, teacher: teacher, lesson: lesson_name, sala: sala});
                            }
                        }
                        else{
                            let lesson_name = lessons[k].querySelector(".p");
                            let teacher = lessons[k].querySelector(".n");
                            let sala = lessons[k].querySelector(".s");
                            
                            if(lesson_name == null) lesson_name = "???";
                            else lesson_name = lesson_name.innerHTML.trim();
    
                            if(teacher == null) teacher = "???";
                            else teacher = teacher.innerHTML.trim();

                            if(sala == null) sala = "???";
                            else sala = sala.innerHTML.trim();

                            if(classes[i] == null){
                                classes[i] = []; 
                            }   
                            classes[i].push({time: time, day: k, teacher: teacher, lesson: lesson_name, sala: sala});
                        }
                    }
                }
            }
        }
    }
    return JSON.stringify(classes);
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