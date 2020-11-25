## Project Live Url
[https://kyc-app-65a63.web.app](https://bc-challenge-app.netlify.app/)


### Api proxy Thanks to netlify serverless functions

You can find the GraphQL request inside the  ```functions/proxyAPI``` folder as I made use of a netlify serverless function to proxy client request from client to netlify and then github nraphQL api server using a mask url to avoid exposing my github api keys and making use of netlify support for environment variables.