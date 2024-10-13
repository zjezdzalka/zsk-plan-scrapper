chrome.storage.local.get(async (result) => {
    let JSONdata = JSON.parse(result["teachers"]);
    let data = [];
    const nauczyciel = document.querySelector("#nauczyciel");
    Object.keys(JSONdata).forEach(element => {
        let temp = [element, JSONdata[element]];
        data.push(temp);
        let option = document.createElement("option");
        option.text = element;
        option.value = element;
        document.querySelector("#nauczyciel").add(option);
    });
    const times = ["7:10-7:55", "8:00-8:45", "8.50-9.35", "9.50-10.35", "10.40-11.25", "11.30-12.15", "12.30-13:15", "13:20-14:05", "14:10-14:55", "15:00-15:45", "15:50-16:35", "16:40-17:25"];
    nauczyciel.addEventListener("change", function(){
        let value = nauczyciel.value;
        let table = document.querySelector("#table");
        table.innerHTML = "";
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.innerText = "Godzina";
        tr.appendChild(th);
        th = document.createElement("th");
        th.innerText = "Poniedziałek";
        tr.appendChild(th);
        th = document.createElement("th");
        th.innerText = "Wtorek";
        tr.appendChild(th);
        th = document.createElement("th");
        th.innerText = "Środa";
        tr.appendChild(th);
        th = document.createElement("th");
        th.innerText = "Czwartek";
        tr.appendChild(th);
        th = document.createElement("th");
        th.innerText = "Piątek";
        tr.appendChild(th);
        table.appendChild(tr);
        times.forEach(time => {
            let tr = document.createElement("tr");
            let td = document.createElement("td");
            td.style = "text-align: end;";
            td.innerText = time;
            tr.appendChild(td);
            let teacher_data = JSONdata[value];
            for(let i = 0; i < 5; i++){
                let text, sala;
                for(let j = 0; j < teacher_data.length; j++){
                    if(teacher_data[j]["time"] == times.indexOf(time) && teacher_data[j]["day"] == i){
                        text = teacher_data[j]["lesson"];
                        sala = teacher_data[j]["sala"];
                        if(text === undefined) text = "";
                        if(sala === undefined) sala = "";
                    }
                }
                let td = document.createElement("td");
                if(text && sala) td.innerText = text+", "+sala;
                else td.innerText = "";
                tr.appendChild(td);
            }
            table.appendChild(tr);
        });
    });
    console.log(data);
});