const GITHUB_GRAPH_API_MASK_URL = 'https://bc-challenge-app.netlify.app/.netlify/functions/proxyAPI';

// Conveniently create elements from generated virtual element tree

function createElement(nodeTree, parentNode, mountEl) {
    var root = document.getElementById(mountEl || 'app');
    for (var i = 0; i <= nodeTree.length - 1; i++) {
        var node = nodeTree[i];
        // create an actual dom element from the current node object
        if (node.tag) var newEl = document.createElement(node.tag);
        var string = typeof node.data !== 'undefined' ? node.data : '';
        var text = document.createTextNode(string);
        if (node.class) newEl.className = node.class;
        if (node.attrs) {
            for (var attr in node.attrs) {
                newEl.setAttribute(attr, node.attrs[attr]);
            }
        }
        newEl.appendChild(text);
        root.appendChild(newEl);
        if (node.children) {
            newEl.appendChild(createElement(node.children, newEl));
        }
        if (parentNode) parentNode.appendChild(newEl);
    }
    return newEl;
}

// Generate elements virtual tree to represent a small virtual DOM
function e() {
    var args = arguments;
    var node = {}

    for (var i = 0; i <= args.length - 1; i++) {
        if (typeof args[i] === 'string') {
            if (i !== 0 && i == 1) node.class = args[i];
            else node.tag = args[i];
        }
        if (args[i] instanceof Array) node.children = args[i]
        else if (typeof args[i] === 'object') {
            node['attrs'] = args[i].attrs;
            node['data'] = args[i].data;
        }
    }
    return node;
}

/* Support multiple components, dynamic mounting to any element and finally insert the
elements to the DOM using createElement()
*/

function render() {
    var args = arguments;
    var elementTreeArray, mountEl;
    if (typeof args[args.length - 1] === 'string') {
        mountEl = args[args.length - 1];
        args.length = args.length - 1;
        elementTreeArray = [...args];
        return createElement(elementTreeArray, null, mountEl);
    }
    elementTreeArray = [...args];
    return createElement(elementTreeArray);
}

const cuteDate = (d) => {
    let date = new Date(d);
    let options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options).replace(',', ' ');
}

const repoList = (repos) => {
    repos.forEach(repo => {
        let { name, url, stargazers, forks, languages, pushedAt, description } = repo;
        let Component = e('div', 'repo-list',
            [
                e('div', 'left-s', [
                    e('a', { attrs: { href: url } }, [e('h3', { data: name })]),
                    description ? e('h4', { data: description }) : {},
                    languages.nodes.length && e('p', { data: languages.nodes[0].name }),
                    forks.totalCount &&
                    e('span', [
                        e('img', { attrs: { src: 'SVG/fork.svg', style: 'width:16px' } }),
                        e('p', { data: forks.totalCount })
                    ]),
                    stargazers.totalCount &&
                    e('span', [
                        e('img', { attrs: { src: 'SVG/star.svg', style: 'width:16px' } }),
                        e('p', { data: stargazers.totalCount })
                    ]),
                    e('p', { data: `updated at ${cuteDate(pushedAt)}` })
                ]),
                e('div', 'right-s', [
                    e('div', [
                        e('button', [
                            e('img', { attrs: { src: 'SVG/star.svg', style: 'width:16px' } }),
                            e('span', { data: ' Star' }),
                        ])
                    ])
                ]),
            ]
        )
        render(Component, 'repositories');
    });
}

const userProfile = (profile) => {
    let { name, avatarUrl, login, bio, url } = profile;

    let SidebarComponent = e('div', 'profile-container', [
        e('div', 'profile-data-full',
            [
                e('div', 'avartar-base', [
                    e('div', 'avartar-container', [
                        e('img', { attrs: { src: avatarUrl } }),
                        e('a', 'status-button-round', [
                            e('img', { attrs: { src: 'SVG/smile.svg', style: 'width:20px' } }),
                            e('a', 'status-text', { data: ' Set status' })
                        ]),
                    ])
                ]),
                e('div', 'names-base', [
                    e('h2', [e('b', { data: name })]),
                    e('h4', { data: login }),
                ]),
            ]),
        e('div', 'status-normal', { data: 'set status' }),
        e('br'),
        e('p', { data: bio }),
    ])

    let HeaderComponent = e('div', 'header-profile-data', [
        e('img', { attrs: { src: avatarUrl } }),
        e('span', 'dropdown-caret'),
    ]);

    let NavigationBarComponent = e('div', 'navbar-profile-data', { attrs: { id: 'navbar-profile-data' } }, [
        e('img', { attrs: { src: avatarUrl } }),
        e('b', { data: login })
    ])

    render(NavigationBarComponent, 'profile-data-mini')
    render(HeaderComponent, 'profile-src');
    render(SidebarComponent, 'profile');
}

function userRepoCount(count) {
    var Component = e('span', 'repo-count-label', { data: count });
    render(Component, 'repo-count-data');
}

//Setup Eventlisteners
function setMenuToggler() {
    var menuButton = document.getElementById('menu');
    var responsiveMenu = document.getElementById('responsive-menu');
    var showMenu = false;

    function toggle(show) {
        show ? responsiveMenu.classList.add('show')
            : responsiveMenu.classList.remove('show');
    }

    function handleToggle() {
        showMenu = !showMenu
        toggle(showMenu);
    }
    menuButton.onclick = handleToggle;
}

function setScrollWatcher() {
    var show = false;
    var classAdded = false;

    var profileData = document.getElementById('navbar-profile-data');

    function onScrollHandler() {

        function handleToggle(show) {
            show ? profileData.classList.add('navbar-show')
                : profileData.classList.remove('navbar-show');
        }

        if (window.scrollY > 430 && !classAdded) {
            classAdded = true;
            handleToggle(true);
        }
        if (window.scrollY < 430 && classAdded) {
            classAdded = false;
            handleToggle(false);
        }

    }
    window.addEventListener("scroll", onScrollHandler)
};

function handleDataResult({ data }) {
    var { repositories } = data.viewer;
    userProfile(data.viewer);
    repoList(repositories.nodes);
    userRepoCount(repositories.totalCount);
    setScrollWatcher();
}

function getData() {
    fetch(GITHUB_GRAPH_API_MASK_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(result => result.json())
        .then(data => {
            console.log(data)
            handleDataResult(data)
        })
        .catch((error) => { console.log('netlify proxy api', error) })
}

(function initUI() {
    setMenuToggler();
    getData();
}());