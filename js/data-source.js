export class DataSource {
    // The URL used as source of data
    #url;

    // The CSRF token to be used in the data source
    #csrfToken;

    /**
     * Create a new data source with the URL
     * @param url an url to be used
     */
    constructor(url) {
        this.#url = url;
    }

    /**
     * Get data from the data source. The provided endpoint will be appended
     * to the url used as data source. For any HTTP method but GET, the
     * specified body will be sent with the request.
     * @param endpoint default an empty string ''
     * @param httpMethod a HTTP verb (like GET, PUT or POST) that describes the action to perform (default GET)
     * @param requestBody data to be sent to the endpoint (default an empty body {})
     * @return a Promise that resolves to a Response object in the Fetch API
     */
    async getData(endpoint = '', httpMethod = 'GET', requestBody = {}) {

        const useBody = httpMethod.toUpperCase() !== 'GET';
        const headers = useBody ? {
            'Accept': 'application/json',
            'csrf-token': this.#csrfToken
        }
        : {
            'Accept': 'application/json',
        }

        const requestInfo = {
            method: httpMethod,
            headers: headers,
            credentials: 'include'
        };
        
        if (useBody) {
            
            if (Object.keys(requestBody).length === 0) {
                requestBody = {
                    '_csrf': this.#csrfToken
                }
            } else {
                requestBody['_csrf'] = this.#csrfToken; 
            }
            requestInfo['body'] = JSON.stringify(requestBody); 
            requestInfo['headers']['Content-Type'] = 'application/json'; 
        }

        return fetch(this.#url + endpoint, requestInfo);
    }

    /**
     * Get the URL 
     * @return the URL 
     */
    getURL() {
        return this.#url;
    }

    /**
     * Set the CSRF token to be used in the data source.
     * @param token the CSRF token to be used
     */
    setCSRFToken(token) {
        this.#csrfToken = token;
    }
}
