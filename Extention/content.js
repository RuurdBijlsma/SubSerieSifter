icon = document.createElement("button");
icon.setAttribute("is", "paper-icon-button-light");
icon.setAttribute("id", "button");
icon.setAttribute("class", "dropdown-trigger style-scope ytd-menu-renderer");
icon.setAttribute("aria-label", "Filter menu");
icon.setAttribute("style", `
    background-image: url(https://cdn.pixabay.com/photo/2013/07/13/12/20/funnel-159670_960_720.png);
    background-size: 50%;
    background-position: center;
    background-repeat: no-repeat;
    filter: invert(100%);
    -webkit-filter: invert(100%);
    opacity: 0.6;
`);
icon.setAttribute("filter", "ruurd");

icon.innerHTML = `<yt-icon class="style-scope ytd-menu-renderer x-scope yt-icon-0 x-scope yt-icon-0"></yt-icon>
    <paper-ripple class="style-scope paper-icon-button-light circle">
    <div id="background" class="style-scope paper-ripple"></div>
    <div id="waves" class="style-scope paper-ripple"></div>
  </paper-ripple>`;

if (!localStorage.subFilter) {
    localStorage.subFilter = JSON.stringify({});
}

function getFilter() {
    return JSON.parse(localStorage.subFilter);
}

function setFilter(v) {
    localStorage.subFilter = JSON.stringify(v);
}

function handleClick(e) {
    let video = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
    video = getVideoInfo(video);
    let regex = prompt("Adding filter for " + video.name, video.title);
    if (regex) {
        let filter = getFilter();
        console.log("Regex: ", regex);

        if (filter.hasOwnProperty(video.id)) {
            filter[video.id].push(regex);
        } else {
            filter[video.id] = [regex];
        }
        setFilter(filter);
        reFilter();
    }
}

filterAll();

function getVideoInfo(video) {
    let videoHTML = video.innerHTML;
    let id = videoHTML.split('<a is="yt-endpoint" class="style-scope ytd-shelf-renderer x-scope yt-endpoint-2" href="/')[1].split("\">")[0].split("/")[1];
    let name = videoHTML.split('<yt-formatted-string id="title" class="style-scope ytd-shelf-renderer x-scope yt-formatted-string-0">')[1].split("</yt-formatted-string>")[0];
    let title = $(video).find('#video-title')[0].title;

    return {
        id: id,
        name: name,
        title: title,
        element: video,
        hidden: false
    };
}

function getVideos() {
    let videoElements = $('.style-scope.ytd-section-list-renderer.x-scope.ytd-item-section-renderer-0');
    videos = [];

    for (let video of videoElements) {
        let menu = video.querySelector("#dismissable > #menu > ytd-menu-renderer");
        let clone = icon.cloneNode(true);
        clone.addEventListener("click", e => handleClick(e));

        if (!menu.querySelector("[filter=ruurd]"))
            menu.appendChild(clone);

        videos.push(getVideoInfo(video));
    }
}

function filterVidoes(filter) {
    for (let video of videos) {
        if (filter.hasOwnProperty(video.id)) {
            let filterRegex = filter[video.id];
            if (video.title.match(filterRegex)) {
                $(video.element).hide();
                video.hidden = true;
            }
        }
    }
    return videos;
}

function filterAll() {
    getVideos();
    filterVidoes(getFilter());
}

function unHideAll() {
    for (let video of videos) {
        $(video.element).show();
    }
}

let lastFilterUpdateY = 0;
window.addEventListener('scroll', () => {
    if (window.scrollY - lastFilterUpdateY > 100) {
        lastFilterUpdateY = window.scrollY;
        console.log('Filter all');
        filterAll();
    }
});

function updateFilter() {
    let container = $('#filterContainer');
    let filter = getFilter();

    for (let child of container.children()) {
        let user = $(child).find('.userInput').val();
        let regex = $(child).find('.regexInput').val();
        let originalUser = $(child).find('.userInput').attr('original');
        let originalRegex = $(child).find('.regexInput').attr('original');

        if (filter.hasOwnProperty(user)) {
            let regexes = filter[user];
            for (let i = 0; i < regexes.length; i++) {
                let storedRegex = regexes[i];
                if (storedRegex == originalRegex) {
                    regexes[i] = regex;
                }
            }
        } else {
            delete filter.originalUser;
            filter[user] = [regex];
        }
        $(child).find('.userInput').attr('original', user);
        $(child).find('.regexInput').attr('original', regex);
    }

    setFilter(filter);
    reFilter();
}

function reFilter() {
    lastFilterUpdateY = 0;
    unHideAll();
    filterAll();
}

function getElement() {
    if (typeof element == 'undefined') {
        element = document.createElement('div');
        element.id = 'ruurd';
        element.style = `
            width: 700px;
            background-color: rgb(8, 8, 8);
            position: fixed;
            top: calc(50% - 250px);
            left: calc(50% - 350px);
            padding: 20px;
            color: white;
        `;

        let filterHTML = '';
        let filters = getFilter();
        for (let user in filters) {
            let regexes = filters[user];
            for (let regex of regexes) {
                filterHTML += `
                <div class='filterRow'>
                    <input original="${user}" type='text' placeholder='User' class='userInput' value="${user}">
                    <input original="${regex}" type='text' placeholder='Filter' class='regexInput' value="${regex}">
                    <div class="ruurdbutton"></div>
                </div>
                `;
            }
        }

        let html = `
            <h1>Edit Filters</h1><div id="filter-close"></div>
            <div id='filterContainer' style="padding-top: 20px;">
                ${filterHTML}
            </div>
        `;

        let style = document.createElement('style');
        style.innerHTML = `
            h1{
                display:inline-block;
            }
            div#filter-close {
                float: right;
                background: maroon;
                width: 40px;
                height: 40px;
                cursor: pointer;
                border-radius: 50%;
            }
            input.userInput {
                margin-right: 10px;
            }
            #filterContainer input {
                width: calc(50% - 50px);
                padding: 10px;
                border-radius: 5px;
                border: none;
            }
            .filterRow {
                margin-bottom: 10px;
            }
            .ruurdbutton {
                width: 35px;
                height: 35px;
                cursor: pointer;
                float: right;
                background: red;
                display: inline-block;
            }
        `;
        document.body.appendChild(style);

        element.innerHTML = html;

        let inputFields = element.querySelectorAll('input');
        let buttonFields = element.querySelectorAll('.ruurdbutton');
        console.log(inputFields);
        for (let input of inputFields) {
            input.addEventListener('keyup', e => {
                updateFilter();
            });
        }
        for (let button of buttonFields) {
            button.addEventListener('click', e => {
                removeFilter(e);
            });
        }
        let closeButton = element.querySelector('#filter-close');
        closeButton.addEventListener("click", e => {
            editing = false;
            element.remove();
        });
    }
    return element;
}

function removeFilter(e) {
    let rowElement = e.target.parentElement;
    let user = rowElement.children[0].value;
    let regex = rowElement.children[1].value;

    let filter = getFilter();
    if (filter[user].length == 1) {
        delete filter[user];
    } else {
        let index = filter[user].indexOf(regex);
        filter[user].splice(index, 1);
    }

    setFilter(filter);
    rowElement.remove();

    reFilter();
}

editing = false;
document.addEventListener('keypress', e => {
    if (e.key == 'f') {
        if (!editing) {
            editing = true;
            document.body.appendChild(getElement());
        }
    }
});
