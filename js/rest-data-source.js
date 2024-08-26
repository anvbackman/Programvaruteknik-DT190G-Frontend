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
	 * be appended to the base URL used by the extended DataSource.
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

	/**
	 * Used to get all pets
	 * 
	 * @returns  all pets
	 */
	async getPets() {
		return this.getData('/api/v1/pets/');
	}

	/**
	 * Used to get a pet by its name
	 * 
	 * @param {*} petName the name of the pet
	 * @returns  the pet with the specified name
	 */
	async getPet(petName) {	
		return this.getData(`/api/v1/pets/${petName}`);
	}

	/**
	 * Used to get all owners
	 * 
	 * @returns all owners
	 */
	async getOwners() {
		return this.getData('/api/v1/owners/');
	}

	/**
	 * Used to get all pets owned by a specific owner
	 * @param {*} ownerSsn the SSN of the owner
	 * @returns all pets owned by the specified owner
	 */
	async getOwnersPets(ownerSsn) {
		return this.getData(`/api/v1/pets/${ownerSsn}`);
	}

	/**
	 * Used to add a new pet
	 * 
	 * @param {*} petName the name of the pet
	 * @param {*} species the species of the pet
	 * @param {*} breed the breed of the pet
	 * @param {*} color the color of the pet
	 * @param {*} birthdate the birthdate of the pet
	 * @param {*} healthStatus the health status of the pet
	 * @param {*} ownerSsn the SSN of the owner
	 * @returns the new pet
	 */
    async addPet(petName, species, breed, color, birthdate, healthStatus, ownerSsn) {
        return this.getData(`/api/v1/pets`, 'POST', {petName: petName, species: species, breed: breed, color: color, birthdate: birthdate, healthStatus: healthStatus, ownerSsn: ownerSsn})
    }

	/**
	 * Used to add a new owner
	 * 
	 * @param {*} ownerName the name of the owner
	 * @param {*} address the address of the owner
	 * @param {*} phone the phone number of the owner
	 * @param {*} email the email of the owner
	 * @param {*} ownerSsn the SSN of the owner
	 * @returns the new owner
	 */
	async addOwner(ownerName, address, phone, email, ownerSsn) {
		return this.getData(`/api/v1/owners`, 'POST', {ownerName: ownerName, address: address, phone: phone, email: email, ownerSsn: ownerSsn});
	}
	
	/**
	 * Used to delete a pet
	 * 
	 * @param {*} petName the name of the pet
	 * @param {*} ownerSsn the SSN of the owner
	 * @returns the deleted pet
	 */
    async deletePet(petName, ownerSsn) {
		return this.getData(`/api/v1/pets/${petName}/${ownerSsn}`, 'DELETE');
	}

	/**
	 * Used to update the health status of a pet
	 * 
	 * @param {*} petName the name of the pet
	 * @param {*} healthStatus the new health status of the pet
	 * @returns the updated pet
	 */
    async updatePetHealthStatus(petName, healthStatus) {
        return this.getData(`/api/v1/pets/${petName}`, 'PUT', {petName: petName, healthStatus: healthStatus});
    }
}