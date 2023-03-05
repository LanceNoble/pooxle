// fetches json resources and let's the user know how the request went
async function handle(resource, options, callback) {
    const stat = document.querySelector("#statusMessage");
    let statColor;
    let statMsg;
    let res;
    try {
        res = await fetch(resource, options);
    }
    catch (e) {
        statMsg = `${e}, try refreshing the page`;
        statColor = "is-warning";
        stat.innerHTML = `
        <div class="notification ${statColor}">
            <p>${statMsg}</p>
        </div>
        `;
        return;
    }
    // 404 usually happens when the user inputs a nonexistent path in the url bar
    // so it's handled in the server side code instead
    switch (res.status) {
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
            statMsg = "Unhandled status"
            statColor = "is-warning";
            break;
    }
    stat.innerHTML = `
        <div class="notification ${statColor}">
            <p>${statMsg}</p>
        </div>
    `;
    // as of now, we only expect an error 400 to happen when requesting json
    // when 400 happens, extracting json() will not work, so return early
    // note there may be more errors to handle in the future
    // as for success statuses, 204 does not have a response body
    // so json() still won't work on that
    // or if nothing was passed into the callback parameter, exit
    if (res.status === 400 || res.status === 204 || !callback) {
        return;
    }
    const json = await res.json();
    // this callback function parameter will typically be a function
    // that serves to present the results to the user visually on the
    // webpage
    callback(json);
}
window.onload = () => {
    // Setup canvas
    const cvs = document.querySelector("canvas");
    // Please try making the pixel size a proper divisor of the canvas
    const pixelSize = 20;
    const ctx = cvs.getContext("2d");
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
    handle("/art", {
        method: "GET",
        headers: { "Accept": "application/json" }
    },
        (json) => {
            for (const drawing of json.results) {
                list.innerHTML += `
                <li>
                  <img src="${drawing.img}">
                  <p>"${drawing.cap}" by ${drawing.name} on ${drawing.date}</p>
                </li>`;
            }
        });
    // Set up posting functionality
    const submissionForm = document.querySelector("#submissionForm");
    const submissionFormAction = submissionForm.getAttribute("action");
    const submissionFormMethod = submissionForm.getAttribute("method");
    submissionForm.onsubmit = async (e) => {
        e.preventDefault();
        const date = new Date();
        handle(submissionFormAction, {
            method: submissionFormMethod,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            // "+" has to be represented as %2B (more info below)
            // ' ' is represented as + 
            // https://help.mulesoft.com/s/article/HTTP-Request-with-Plus-Sign-in-Query-Param-is-Converted-to-Space-by-HTTP-Listener
            // keep the query params on a single line of code bc new lines do get registered in the body
            body: `img=${cvs.toDataURL().replaceAll("+", "%2B")}&cap=${submissionForm.querySelector("#capField").value}&name=${submissionForm.querySelector("#nameField").value}&date=${date}`
        });
        return false;
    };
    // Set up searching functionality
    const searchForm = document.querySelector("#searchForm");
    const searchFormAction = searchForm.getAttribute("action");
    const searchFormMethod = searchForm.getAttribute("method");
    searchForm.onsubmit = async (e) => {
        // e.preventDefault() tells the form element that we're going to handle the request ourselves
        // otherwise, the form will redirect us to a page showing the literal JSON text
        e.preventDefault();
        const searchedName = searchForm.querySelector("#nameSearch");
        handle(`${searchFormAction}?name=${encodeURIComponent(searchedName.value)}`,
            {
                method: searchFormMethod,
                headers: { "Accept": "application/json" }
            },
            (json) => {
                list.innerHTML = "";
                for (const drawing of json.results) {
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
            });
        // returning false prevents the event from bubbling up
        return false;
    };
}