// fetches resource and shows user the response status
async function handle(resource, options) {
    const response = await fetch(resource, options);
    const status = document.querySelector("#statusMessage");

    // handle status codes
    // 404 usually occurs bc user enters a bad url path
    // so it's handled in server code instead
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
    // Setup canvas
    const cvs = document.querySelector("canvas");
    cvs.width = 1000;
    cvs.height = 1000;
    // Please make sure that the pixel size is a proper divisor of the canvas
    const pixelSize = 20;
    const ctx = cvs.getContext("2d");
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    // Make grid lines so user can anticipate where their pixel is being placed
    ctx.beginPath();
    for (let i = 0; i < cvs.width / pixelSize; i++) {

    }
    // ctx.moveTo(500, 200);
    // ctx.lineTo(500, 500);
    // ctx.closePath();
    // ctx.stroke();
    

    // BORROWED CODE
    // workaround for events only firing once
    // simulates them firing multiple times
    // let's user continuously draw while holding down mouse button
    // instead of having to click everytime to place a pixel
    // https://stackoverflow.com/questions/41304737/why-onmousedown-event-occur-once-how-to-handle-mouse-hold-event
    let pixelX;
    let pixelY;
    let timer;
    cvs.addEventListener("mousemove", (e) => {
        // put canvas coords in global space
        const cvsPos = cvs.getBoundingClientRect();
        const cvsX = cvsPos.x;
        const cvsY = cvsPos.y;
        const canXAbs = cvsX + window.scrollX;
        const canYAbs = cvsY + window.scrollY;

        // put mouse coords relative to canvas space
        const cvsMouseX = e.pageX - canXAbs;
        const cvsMouseY = e.pageY - canYAbs;

        // Math.trunc ensures that pixel doesn't take up multiple gridboxes 
        // especially in the event of a pixel size that is not a proper divisor of the canvas dimensions
        pixelX = pixelSize * Math.trunc(cvsMouseX / pixelSize);
        pixelY = pixelSize * Math.trunc(cvsMouseY / pixelSize);
    });
    cvs.addEventListener("mousedown", () => {
        timer = setInterval(() => {
            ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        });
    });
    function mouseDone() {
        clearInterval(timer);
    }
    cvs.addEventListener("mouseup", mouseDone);
    cvs.addEventListener("mouseleave", mouseDone);
    // END OF BORROWED CODE


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
            body: `img=${cvs.toDataURL().replaceAll("+", "%2B")}
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