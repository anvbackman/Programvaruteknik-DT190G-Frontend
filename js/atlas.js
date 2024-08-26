export class Atlas {
	// The data source used by the Atlas instance
	#dataSource;

	/**
	 * Constructor to create a new Atlas instance with the specified data source for its data.
	 * 
	 * @param dataSource the data source to be used
	 */
	constructor(dataSource) {
		this.#dataSource = dataSource;
	}

	/**
	 * Used to get all pets
	 * 
	 * @returns all pets
	 */
	async getPets() {
		return this.#dataSource.getPets();
	}

	/**
	 * Used to get a pet by its name
	 * 
	 * @param {*} petName the name of the pet
	 * @returns  the pet with the specified name
	 */
	async getPet(petName) {
		return this.#dataSource.getPets(petName);
	}

	/**
	 * Used to get all owners
	 * 
	 * @returns all owners
	 */
	async getOwners() {
		return this.#dataSource.getOwners();
	}

	/**
	 * Used to get all pets owned by a specific owner
	 * @param {*} ownerSsn the SSN of the owner
	 * @returns all pets owned by the specified owner
	 */
	async getOwnersPets(ssn) {
		return this.#dataSource.getPets(ssn);
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
		return this.#dataSource.addPet(petName, species, breed, color, birthdate, healthStatus, ownerSsn);
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
		return this.#dataSource.addOwner(ownerName, address, phone, email, ownerSsn);
	}

	/**
	 * Used to delete a pet
	 * 
	 * @param {*} petName the name of the pet
	 * @param {*} ownerSsn the SSN of the owner
	 * @returns the deleted pet
	 */
	async deletePet(petName, ownerSsn) {
		return this.#dataSource.deletePet(petName, ownerSsn);
	}

	/**
	 * Used to update the health status of a pet
	 * 
	 * @param {*} petName the name of the pet
	 * @param {*} healthStatus the new health status of the pet
	 * @returns the updated pet
	 */
	async updatePetHealthStatus(petName, healthstatus) {
		return this.#dataSource.updatePetHealthStatus(petName, healthstatus);
	}
}
