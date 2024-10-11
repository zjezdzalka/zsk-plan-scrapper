var input = document.getElementById("f17_start_func");
if (input) {
    input.addEventListener("click", function() {
        console.log("Click");
        try{
            chrome.runtime.sendMessage({name: "get-plan-data"});
        }
        catch(e){
            console.log(e);
        }
    });
}