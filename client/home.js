// fetches resource and shows user the response status
async function handle(resource, options) {
    const response = await fetch(resource, options);
    const status = document.querySelector("#statusMessage");
    let statColor;
    let statMsg

    // handle status codes
    // 404 usually occurs bc user enters a bad url path
    // so it's handled in server code instead
    switch (response.status) {
        case 200:
            statMsg = "Pooxle(s) retrieved";
            statColor = "is-success";
            break;
        case 201:
            statMsg = "Pooxle created";
            statColor = "is-success";
            break;
        case 204:
            statMsg = "Pooxle updated";
            statColor = "is-success";
            break;
        case 400:
            statMsg = "Make sure the name only has letters and numbers (i.e. no spaces, underscores, etc.)";
            statColor = "is-danger";
            break;
        default:
            break;
    }

    status.innerHTML = `
        <div class="notification ${statColor}">
            <p>${statMsg}</p>
        </div>
    `;

    // return response instead of response.json()
    // bc there's a chance that the response status is 204 (more info below)
    // https://stackoverflow.com/questions/65815485/status-204-response-json-caught-syntaxerror-unexpected-end-of-json-input-a
    return response;
};

window.onload = async () => {
    // Setup canvas
    const cvs = await document.querySelector("canvas");
    // Please try making the pixel size a proper divisor of the canvas
    const pixelSize = 20;
    const ctx = await cvs.getContext("2d");
    ctx.fillStyle = "black";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.125;
    // Make grid lines so user can anticipate where their pixel is being placed
    for (let i = 0; i < cvs.height / pixelSize; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * pixelSize);
        ctx.lineTo(cvs.width, i * pixelSize);
        ctx.closePath();
        ctx.stroke();
    }
    for (let i = 0; i < cvs.width / pixelSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pixelSize, 0);
        ctx.lineTo(i * pixelSize, cvs.height);
        ctx.closePath();
        ctx.stroke();
    }

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
            // ' ' is represented as + 
            // https://help.mulesoft.com/s/article/HTTP-Request-with-Plus-Sign-in-Query-Param-is-Converted-to-Space-by-HTTP-Listener
            // do NOT make a new line (pressing enter) to make the query params more grouped and organized, keep it on one single line of code
            body: `img=${cvs.toDataURL().replaceAll("+", "%2B")}&cap=${submissionForm.querySelector("#capField").value}&name=${submissionForm.querySelector("#nameField").value}&date=${date}`
        });
        // if (res.status !== 204) {
        //     res = await res.json();
        // }
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
        if (res.status !== 200) {
            return false;
        }
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