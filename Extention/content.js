// TODO:
// make icon for next to triple dots in sub list
// clicking this icon adds filter for this channel, user then has to add a filter string

if (!localStorage.subFilter) {
    localStorage.subFilter = JSON.stringify({
        name1: ['regex1', 'regex2', 'regex3'],
        name2: ['regex1', 'regex2', 'regex3'],
        name3: ['regex1', 'regex2', 'regex3']
    });
}

function getFilter() {
    return JSON.parse(localStorage.subFilter);
}

function setFilter(v) {
    localStorage.subFilter = JSON.stringify(v);
}

filterAll();

function getVideos() {
    let videoElements = $('.style-scope.ytd-section-list-renderer.x-scope.ytd-item-section-renderer-0');
    videos = [];

    for (let video of videoElements) {
        let videoHTML = video.innerHTML;
        let id = videoHTML.split('<a is="yt-endpoint" class="style-scope ytd-shelf-renderer x-scope yt-endpoint-2" href="/')[1].split("\">")[0].split("/")[1];
        let name = videoHTML.split('<yt-formatted-string id="title" class="style-scope ytd-shelf-renderer x-scope yt-formatted-string-0">')[1].split("</yt-formatted-string>")[0];
        let title = $(video).find('#video-title')[0].title;
        videos.push({
            id: id,
            name: name,
            title: title,
            element: video,
            hidden: false
        });
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
                filterHTML += `<div class='filterRow'><input original="${user}" type='text' placeholder='User' class='userInput' value="${user}"><input original="${regex}" type='text' placeholder='Filter' class='regexInput' value="${regex}"></div>`;
            }
        }

        let html = `
            <h1>Edit Filters</h1>
            <div id='filterContainer' style="padding-top: 20px;">
                ${filterHTML}
            </div>
        `;

        let style = document.createElement('style');
        style.innerHTML = `
            input.userInput {
                margin-right: 10px;
            }
            #filterContainer input {
                width: calc(50% - 25px);
                padding: 10px;
                border-radius: 5px;
                border: none;
            }
            .filterRow {
                margin-bottom: 10px;
            }
        `;
        document.body.appendChild(style);

        element.innerHTML = html;

        let inputFields = element.querySelectorAll('input');
        console.log(inputFields);
        for (let input of inputFields) {
            input.addEventListener('keyup', e => {
                updateFilter();
            });
        }
    }
    return element;
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
