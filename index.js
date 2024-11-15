chrome.storage.local.get(async (result) => {
    console.log(result);
    let JSONTeacherData = JSON.parse(result["teachers"]);
    let classNamesJSON = JSON.parse(result["classes"]);
    let classesJSON = JSON.parse(result["classes_data"]);
    let fredryJSON = JSON.parse(result["fre"]);
    let inneJSON = JSON.parse(result["other"]);
    let bukoJSON = JSON.parse(result["buko"]);

    console.log(fredryJSON);
    console.log(inneJSON);
    console.log(bukoJSON);

    let JSONRoomData = JSON.parse(result["rooms"]);
    let classes = [];
    let classesElement = document.querySelector("#classes");

    const nauczyciel = document.querySelector("#nauczyciel");
    const sale = document.querySelector("#sale");
    Object.keys(JSONTeacherData).forEach(element => {
        let option = document.createElement("option");
        option.text = element;
        option.value = element;
        document.querySelector("#nauczyciel").add(option);
    });
    Object.keys(JSONRoomData).forEach(element => {
        let option = document.createElement("option");
        option.text = element;
        option.value = element;
        document.querySelector("#sale").add(option);
    });
    Object.values(classNamesJSON).forEach(element => {
        classes.push(element[0] + element[1]);
        let option = document.createElement("option");
        option.text = element[0] + element[1];
        option.value = element[0] + element[1];
        document.querySelector("#classes").add(option);
    });
    

    const times = ["7:10-7:55", "8:00-8:45", "8.50-9.35", "9.50-10.35", "10.40-11.25", "11.30-12.15", "12.30-13:15", "13:20-14:05", "14:10-14:55", "15:00-15:45", "15:50-16:35", "16:40-17:25"];
    const days = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek"];

    nauczyciel.addEventListener("change", function(){
        sale.style.boxShadow = "0 0 0 0";
        classesElement.style.boxShadow = "0 0 0 0";
        nauczyciel.style.boxShadow = "0 0 25px white";

        let value = nauczyciel.value;
        let table = document.querySelector("#table");

        table.innerHTML = "";

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerText = "Godzina";
        tr.appendChild(th);

        for(let i = 0; i < 5; i++){
            th = document.createElement("th");
            th.innerText = days[i];
            tr.appendChild(th);
        }

        table.appendChild(tr);
        times.forEach(time => {
            let howManyLessons = 0;

            let tr = document.createElement("tr");
            let td = document.createElement("td");

            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);

            let teacher_data = JSONTeacherData[value];

            for(let i = 0; i < 5; i++){
                let text, sala, lessonClass;
                for(let j = 0; j < teacher_data.length; j++){
                    if(teacher_data[j]["time"] == times.indexOf(time) && teacher_data[j]["day"] == i){
                        text = teacher_data[j]["lesson"];
                        sala = teacher_data[j]["sala"];
                        lessonClass = classes[teacher_data[j]["class"]];

                        if(text === undefined) text = "";
                        if(sala === undefined) sala = "";
                        if(lessonClass === undefined) lessonClass = "";
                    }
                }
                let td = document.createElement("td");
                if(text && sala && lessonClass){
                    td.innerText = text+", "+sala+", "+lessonClass;
                    howManyLessons++;
                }
                else td.innerText = "";
                tr.appendChild(td);
            }
            if(howManyLessons != 0) table.appendChild(tr);
        });
    });

    sale.addEventListener("change", function(){
        classesElement.style.boxShadow = "0 0 0 0";
        nauczyciel.style.boxShadow = "0 0 0 0";
        sale.style.boxShadow = "0 0 25px white";

        let value = sale.value;

        let table = document.querySelector("#table");

        table.innerHTML = "";

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerText = "Godzina";
        tr.appendChild(th);

        for(let i = 0; i < 5; i++){
            th = document.createElement("th");
            th.innerText = days[i];
            tr.appendChild(th);
        }

        table.appendChild(tr);

        times.forEach(time => {
            let tr = document.createElement("tr");
            let td = document.createElement("td");

            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);

            let howManyLessons = 0;
            let room_data = JSONRoomData[value];
            for(let i = 0; i < 5; i++){
                let text, teacher, lessonClass;
                const roomInfo = [];

                for(let j = 0; j < room_data.length; j++){
                    if(room_data[j]["time"] == times.indexOf(time) && room_data[j]["day"] == i){
                        text = room_data[j]["lesson"];
                        teacher = room_data[j]["teacher"];
                        lessonClass = classes[room_data[j]["class"]];

                        if(text === undefined) text = "";
                        if(teacher === undefined) teacher = "";
                        if(lessonClass === undefined) lessonClass = "";

                        roomInfo.push([text, teacher, lessonClass]);
                    }
                }

                let td = document.createElement("td");

                for(let room_i = 0; room_i<roomInfo.length;++room_i){
                    if(text && teacher && lessonClass){
                        td.innerHTML += "<p>"+roomInfo[room_i][0]+", "+roomInfo[room_i][1]+", "+roomInfo[room_i][2]+"</p>";
                        howManyLessons++;
                    }
                    else td.innerHTML += "";
                }
                tr.appendChild(td);
            }
            if(howManyLessons != 0) table.appendChild(tr);
        });
    });

    classesElement.addEventListener("change", function(){
        sale.style.boxShadow = "0 0 0 0";
        nauczyciel.style.boxShadow = "0 0 0 0";
        classesElement.style.boxShadow = "0 0 25px white";

        let value = classes.indexOf(classesElement.value);

        let table = document.querySelector("#table");

        table.innerHTML = "";

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerText = "Godzina";
        tr.appendChild(th);

        for(let i = 0; i < 5; i++){
            th = document.createElement("th");
            th.innerText = days[i];
            tr.appendChild(th);
        }

        table.appendChild(tr);

        times.forEach(time => {
            let tr = document.createElement("tr");
            let td = document.createElement("td");

            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);

            let class_data = classesJSON[value];
            let howManyLessons = 0;

            for(let i = 0; i < 5; i++){
                if(classesJSON[value] == null){
                    createRow = false;
                    break;
                }

                let text, teacher, sala;
                const roomClasses = [];

                for(let j = 0; j < class_data.length; j++){
                    if(class_data[j]["time"] == times.indexOf(time) && class_data[j]["day"] == i){
                        text = class_data[j]["lesson"];
                        teacher = class_data[j]["teacher"];
                        sala = class_data[j]["sala"];
                        
                        if(text === undefined) text = "";
                        if(teacher === undefined) teacher = "";
                        if(sala === undefined) sala = "";
                            
                        roomClasses.push([text, teacher, sala]);
                    }
                }
                let td = document.createElement("td");
                for(let room_i = 0; room_i<roomClasses.length;++room_i){
                    if(text && teacher && sala){
                        td.innerHTML += "<p>"+roomClasses[room_i][0]+", "+roomClasses[room_i][1]+", "+roomClasses[room_i][2]+"</p>";
                        howManyLessons++;
                    }
                    else td.innerHTML += "";
                }
                tr.appendChild(td);
            }
            if(howManyLessons != 0) table.appendChild(tr);
        });
    });

    document.querySelector("#fredry").addEventListener("click", function(){
        sale.style.boxShadow = "0 0 0 0";
        nauczyciel.style.boxShadow = "0 0 0 0";
        classesElement.style.boxShadow = "0 0 0 0";

        let table = document.querySelector("#table");

        table.innerHTML = "";

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerText = "Fredry";
        tr.appendChild(th);

        table.appendChild(tr);

        th.innerText = "Godzina";
        tr.appendChild(th);

        for(let i = 0; i < 5; i++){
            th = document.createElement("th");
            th.innerText = days[i];
            tr.appendChild(th);
        }

        table.appendChild(tr);

        times.forEach(time => {
            let tr = document.createElement("tr");
            let td = document.createElement("td");

            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);

            let text, teacher;
            let createRow = true;
            let j = times.indexOf(time);

            for(let i = 0; i < 5; i++){
                let tableColumnClasses = "";
                let tableColumnTeachers = "";

                if(fredryJSON[j] == null){
                    createRow = false;
                    break;
                }

                let teachersInDB = [];
                let classesInDB = [];

                for(let k = 0; k<Object.keys(fredryJSON[j]).length;++k){
                    if(parseInt(fredryJSON[j][k]["day"]) == parseInt(i)){
                        text = classes[parseInt(fredryJSON[j][k]["class"])];
                        teacher = fredryJSON[j][k]["teacher"];

                        if(text != null && teacher != null){
                            if(!teachersInDB.includes(teacher) && !classesInDB.includes(text)){
                                tableColumnClasses += text + ", ";
                                classesInDB.push(text);

                                tableColumnTeachers += teacher + ", ";
                                teachersInDB.push(teacher);
                            }
                            else{
                                if(!teachersInDB.includes(teacher)){
                                    tableColumnTeachers += teacher + ", ";
                                    teachersInDB.push(teacher);
                                }
                                else{
                                    tableColumnClasses += text + ", ";
                                    classesInDB.push(text);
                                }
                            }
                        }
                    }
                }
                let td = document.createElement("td");
                if(tableColumnClasses && tableColumnTeachers){
                    tableColumnClasses = tableColumnClasses.slice(0, -2);
                    tableColumnTeachers = tableColumnTeachers.slice(0, -2);
                    td.innerHTML = "<p>"+tableColumnClasses+"</p><hr><p>"+tableColumnTeachers+"</p>";
                }
                else td.innerHTML = "";
                
                tr.appendChild(td);
            }
            if(createRow) table.appendChild(tr);
        });
    });

    document.querySelector("#bukowska").addEventListener("click", function(){
        sale.style.boxShadow = "0 0 0 0";
        nauczyciel.style.boxShadow = "0 0 0 0";
        classesElement.style.boxShadow = "0 0 0 0";

        let table = document.querySelector("#table");
        table.innerHTML = "";

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerText = "Bukowska";
        tr.appendChild(th);
        table.appendChild(tr);

        th.innerText = "Godzina";
        tr.appendChild(th);

        for(let i = 0; i < 5; i++){
            th = document.createElement("th");
            th.innerText = days[i];
            tr.appendChild(th);
        }

        table.appendChild(tr);

        times.forEach(time => {
            let tr = document.createElement("tr");
            let td = document.createElement("td");

            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);

            let text, teacher;
            let createRow = true;
            let j = times.indexOf(time);

            for(let i = 0; i < 5; i++){
                let tableColumnClasses = "";
                let tableColumnTeachers = "";

                if(bukoJSON[j] == null){
                    createRow = false;
                    break;
                }

                let teachersInDB = [];
                let classesInDB = [];

                for(let k = 0; k<Object.keys(bukoJSON[j]).length;++k){
                    if(parseInt(bukoJSON[j][k]["day"]) == parseInt(i)){
                        text = classes[parseInt(bukoJSON[j][k]["class"])];
                        teacher = bukoJSON[j][k]["teacher"];

                        if(text != null && teacher != null){
                            if(!teachersInDB.includes(teacher) && !classesInDB.includes(text)){
                                tableColumnClasses += text + ", ";
                                classesInDB.push(text);

                                tableColumnTeachers += teacher + ", ";
                                teachersInDB.push(teacher);
                            }
                            else{
                                if(!teachersInDB.includes(teacher)){
                                    tableColumnTeachers += teacher + ", ";
                                    teachersInDB.push(teacher);
                                }
                                else{
                                    tableColumnClasses += text + ", ";
                                    classesInDB.push(text);
                                }
                            }
                        }
                    }
                }
                let td = document.createElement("td");
                if(tableColumnClasses && tableColumnTeachers){
                    tableColumnClasses = tableColumnClasses.slice(0, -2);
                    tableColumnTeachers = tableColumnTeachers.slice(0, -2);
                    td.innerHTML = "<p>"+tableColumnClasses+"</p><hr><p>"+tableColumnTeachers+"</p>";
                }
                else td.innerHTML = "";
                
                tr.appendChild(td);
            }
            if(createRow) table.appendChild(tr);
        });
    });

    document.querySelector("#inne").addEventListener("click", function(){
        sale.style.boxShadow = "0 0 0 0";
        nauczyciel.style.boxShadow = "0 0 0 0";
        classesElement.style.boxShadow = "0 0 0 0";

        let table = document.querySelector("#table");
        table.innerHTML = "";

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.innerText = "Bukowska";
        tr.appendChild(th);
        table.appendChild(tr);

        th.innerText = "Godzina";
        tr.appendChild(th);

        for(let i = 0; i < 5; i++){
            th = document.createElement("th");
            th.innerText = days[i];
            tr.appendChild(th);
        }

        table.appendChild(tr);

        times.forEach(time => {
            let tr = document.createElement("tr");
            let td = document.createElement("td");

            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);

            let text, teacher;
            let createRow = true;
            let j = times.indexOf(time);

            for(let i = 0; i < 5; i++){
                let tableColumnClasses = "";
                let tableColumnTeachers = "";

                if(inneJSON[j] == null){
                    createRow = false;
                    break;
                }

                let teachersInDB = [];
                let classesInDB = [];
                for(let k = 0; k<Object.keys(inneJSON[j]).length;++k){
                    if(parseInt(inneJSON[j][k]["day"]) == parseInt(i)){
                        text = classes[parseInt(inneJSON[j][k]["class"])];
                        teacher = inneJSON[j][k]["teacher"];
                        sala = inneJSON[j][k]["sala"];

                        if(text != null && teacher != null){
                            if(!teachersInDB.includes(teacher) && !classesInDB.includes(text)){
                                console.log(text, teacher, sala);
                                tableColumnClasses += text + ", ";
                                classesInDB.push(text);

                                tableColumnTeachers += teacher;
                                tableColumnTeachers += sala!=null?"-"+sala:"" ;
                                tableColumnTeachers += ", ";

                                teachersInDB.push(teacher);
                            }
                            else{
                                if(!teachersInDB.includes(teacher)){
                                    tableColumnTeachers += teacher;
                                    tableColumnTeachers += sala!=null?"-"+sala:"" ;
                                    tableColumnTeachers += ", ";
                                    
                                    teachersInDB.push(teacher);
                                }
                                else{
                                    tableColumnClasses += text + ", ";
                                    classesInDB.push(text);
                                }
                            }
                        }
                    }
                }
                let td = document.createElement("td");
                if(tableColumnClasses && tableColumnTeachers){
                    tableColumnClasses = tableColumnClasses.slice(0, -2);
                    tableColumnTeachers = tableColumnTeachers.slice(0, -2);
                    td.innerHTML = "<p>"+tableColumnClasses+"</p><hr><p>"+tableColumnTeachers+"</p>";
                }
                else td.innerHTML = "";
                
                tr.appendChild(td);
            }
            if(createRow) table.appendChild(tr);
        });
    });
});