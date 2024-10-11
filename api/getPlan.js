let url = `http://thingproxy.freeboard.io/fetch/https://www.zsk.poznan.pl/plany_lekcji/2023plany/technikum/plany/o)`;

export default function getPlans(i){
    fetch(url + `${i}.html`)
        .then(response => response.text())
        .then(data => {
            console.log(data);
        })
        .catch(err => console.log(err));
}
