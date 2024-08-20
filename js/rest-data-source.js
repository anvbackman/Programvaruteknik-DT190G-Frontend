import { DataSource } from './data-source.js';

/**
 * Represents a data source where data is fetched from a REST API.
 * @extends DataSource
 */
export class RESTDataSource extends DataSource {
	/**
	 * Create a new data source with the specified URL as its source of data.
	 * @param url the base URL to the REST API to be used as source of data
	 */
	constructor(url) {
		super(url);
	}

	/**
	 * Get data from the specified endpoint. The endpoint will 
	 * be appended to the base URL used by the extended DataSource. Example: 
	 * If the base URL is http://localhost:3000 and the endpoint is /api/courses, 
	 * the HTTP request will be sent to http://localhost:3000/api/courses.
	 * 
	 * @param endpoint the endpoint to use, default an empty string ''
	 * @param method the HTTP request method to use, default GET
	 * @param body the body to be sent with the request, default an empty body {}
	 * @return a Promise that resolves with the result of parsing the response 
	 * 		   body text as JSON.
	 */
	async getData(endpoint = '', method = 'GET', body = {}) {
		return super.getData(endpoint, method, body) // getData returns a Promise<Response>
			.then(resp => resp.json()); // parses the Response body text as JSON
	}

	
	async getPets() {
		return this.getData('/api/v1/pets/');
	}

	
	async getPet(petName) {	
		return this.getData(`/api/v1/pets/${petName}`);
	}

	async getOwners() {
		return this.getData('/api/v1/owners/');
	}

	
	async getOwnersPets(ownerSsn) {
		return this.getData(`/api/v1/pets/${ownerSsn}`);
	}

    async addPet(petName, species, breed, birthdate, healthStatus, ownerSsn) {
        return this.getData(`/api/v1/pets/`, 'POST', {petName: petName, species: species, breed: breed, birthdate: birthdate, healthStatus: healthStatus, ownerSsn: ownerSsn})
    }

	async addOwner(ownerName, address, phone, email, ownerSsn) {
		return this.getData(`/api/v1/owners/`, 'POST', {ownerName: ownerName, address: address, phone: phone, email: email, ownerSsn: ownerSsn});
	}
	
    async deletePet(petName) {
		return this.getData(`/api/v1/pets/${petName}`, 'DELETE');
	}

    async updatePetHealthStatus(petName, healthStatus) {
        return this.getData(`/api/v1/pets/${petName}`, 'PUT', {petName: petName, healthStatus: healthStatus});
    }
}