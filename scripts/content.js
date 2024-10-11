document.querySelector('input').addEventListener('click', () => {
    async function scrapeData(i) {
        try{
            const response = await fetch(```https://www.zsk.poznan.pl/plany_lekcji/2023plany/technikum/plany/o${i}.html```); 
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");  
            const table = doc.querySelector('.tabela');
            console.log(table);
            for(let i = 0; i < table.length; i++){
                console.log(table[i].innerText);
            }
        } catch (error) {
            console.log(error);
        }
    }

    scrapeData(1);
});