// fetches a resource based on the resource requested and its request options
// handles the response fetched to let the user know how the fetch process went
// returns the response so its fetched information can be represented to the user
async function handle(resource, options) {
    const response = await fetch(resource, options);
    const status = document.querySelector("#statusMessage");

    // handle status codes
    // 404 usually occurs bc user enters a bad url path
    // so it's handled in server instead
    switch (response.status) {
        case 200:
            status.textContent = "You successfully retrieved other users' pooxles, check them out below!";
            break;
        case 201:
            status.textContent = "You successfully created a new pooxle!";
            break;
        case 204:
            status.textContent = "You successfully updated an existing pooxle!";
            break;
        case 400:
            status.textContent = "Please provide a name for your pooxle post!";
            break;
        default:
            break;
    }

    // return response instead of response.json()
    // bc there's a chance that the response status is 204 (more info below)
    // https://stackoverflow.com/questions/65815485/status-204-response-json-caught-syntaxerror-unexpected-end-of-json-input-a
    return response;
};

window.onload = async () => {
    // Setup canvas functionality
    const canvas = document.querySelector("canvas");
    canvas.width = 1000;
    canvas.height = 1000;
    const canvasPos = canvas.getBoundingClientRect();
    const pixelSize = 100;
    const ctx = canvas.getContext("2d");
    canvas.onmousedown = (e) => {
        ctx.fillStyle = "white";

        // canvasPos offsets the mouse coordinates
        // so the mouse coords are relative only to the canvas
        // otherwise, they would be relative to the whole document
        // and pixel placement would not be accurate
        const mouseX = e.pageX - canvasPos.x;
        const mouseY = e.pageY - canvasPos.y;

        const rectX = pixelSize * Math.trunc(mouseX / pixelSize);
        const rectY = pixelSize * Math.trunc(mouseY / pixelSize);
        ctx.fillRect(rectX, rectY, pixelSize, pixelSize);
    };

    let res;
    // Load other artist's posts whenever user loads this page
    const list = document.querySelector("ul");
    list.innerHTML = "";
    res = await handle("/art", {
        method: "GET",
        headers: { "Accept": "application/json" }
    });
    res = await res.json();
    for (const drawing of res.results) {
        list.innerHTML += `
        <li>
          <img src="${drawing.img}">
          <p>
            "${drawing.cap}"
            by ${drawing.name}
            on ${drawing.date}
          </p>
        </li>`;
    }

    // Set up posting functionality
    const submissionForm = document.querySelector("#submissionForm");
    const submissionFormAction = submissionForm.getAttribute("action");
    const submissionFormMethod = submissionForm.getAttribute("method");
    submissionForm.onsubmit = async (e) => {
        e.preventDefault();
        const date = new Date();
        res = await handle(submissionFormAction, {
            method: submissionFormMethod,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            // "+" has to be represented as %2B (more info below)
            // https://help.mulesoft.com/s/article/HTTP-Request-with-Plus-Sign-in-Query-Param-is-Converted-to-Space-by-HTTP-Listener
            body: `img=${canvas.toDataURL().replaceAll("+", "%2B")}
                    &cap=${submissionForm.querySelector("#capField").value}
                    &name=${submissionForm.querySelector("#nameField").value}
                    &date=${date}`
        });
        if (res.status !== 204) {
            res = await res.json();
        }
        return false;
    };

    // Set up searching functionality
    const searchForm = document.querySelector("#searchForm");
    const searchFormAction = searchForm.getAttribute("action");
    const searchFormMethod = searchForm.getAttribute("method");
    searchForm.onsubmit = async (e) => {
        // e.preventDefault() and returning false is so that
        // we aren't redirected to the actual json text material when we fetch
        // via form submission
        e.preventDefault();
        const searchedName = searchForm.querySelector("#nameSearch");
        res = await handle(`${searchFormAction}?name=${encodeURIComponent(searchedName.value)}`, {
            method: searchFormMethod,
            headers: { "Accept": "application/json" }
        });
        res = await res.json();
        list.innerHTML = "";
        for (const drawing of res.results) {
            list.innerHTML += `
            <li>
              <img src="${drawing.img}">
              <p>
                "${drawing.cap}"
                by ${drawing.name}
                on ${drawing.date}
              </p>
            </li>`;
        }
        return false;
    };
}