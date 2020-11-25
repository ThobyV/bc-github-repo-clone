const fetch = require('node-fetch');

const GITHUB_API_KEY = process.env.GITHUB_API_KEY;
const GITHUB_GRAPH_API_URL = 'https://api.github.com/graphql';
const GRAPH_QUERY = {
    "query": `{
viewer {
    name
    login
    bio
    avatarUrl
    location
    url
    company
    repositories(orderBy: {field: PUSHED_AT, direction: DESC}, first: 10, isFork: false) {
    totalCount
    nodes {
        id
        name
        description
        url
        stargazers {
        totalCount
        }
        forks {
        totalCount
        }
        languages(first: 5) {
        nodes {
            name
        }
        }
        pushedAt 
    }
    }
}
}`
};

exports.handler = async function (event, context) {
    try {
        const response = await fetch(GITHUB_GRAPH_API_URL, {
            method: 'POST',       
            body: JSON.stringify(GRAPH_QUERY),     
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'authorization': 'token ' + GITHUB_API_KEY
            }
        })

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: response.statusText,
            }
        }
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        }

    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify(err),
        }
    }
};
