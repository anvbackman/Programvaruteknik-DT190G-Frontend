/**
 * This is a base class for data sources to be used in an Atlas instance.
 */
export class DataSource {
    /** The URL to the data source (eg. a local/remote JSON file or a REST API). */
    #url;

    /** The CSRF token to be used in the data source. */
    #csrfToken;

    /**
     * Create a new data source with the specified URL as its source.
     * @param url an url to be used as source of data
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
                requestBody['_csrf'] = this.#csrfToken; // add CSRF token to the body
            }
            requestInfo['body'] = JSON.stringify(requestBody); // data needs to be parsed into JSON
            requestInfo['headers']['Content-Type'] = 'application/json'; // we are sending json
        }

        return fetch(this.#url + endpoint, requestInfo);
    }

    /**
     * Get the URL this data source uses.
     * @return the URL to the data source used
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
