window.onload = async function() {
    console.log(new Version("v1.0.0", "2025-02-13", []));

    let template = document.querySelector("#templateAbout").cloneNode(true);
    document.querySelector(".content").innerHTML = template.innerHTML;
};