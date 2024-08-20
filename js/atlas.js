export class Atlas {
	/**
	 * The data source used for this Atlas instance.
	 */
	#dataSource;

	/**
	 * Create a new Atlas instance with the specified data source for its data.
	 * @param dataSource the data source to be used
	 */
	constructor(dataSource) {
		this.#dataSource = dataSource;
	}

	
	async getPets() {
		return this.#dataSource.getPets();
	}

	
	async getPet(petName) {
		return this.#dataSource.getPets(petName);
	}

	
	async getOwners() {
		return this.#dataSource.getOwners();
	}

	
	async getOwnersPets(ssn) {
		return this.#dataSource.getPets(ssn);
	}

	async addPet(petName, species, breed, birthdate, healthStatus, ownerSsn) {
		return this.#dataSource.addPet(petName, species, breed, birthdate, healthStatus, ownerSsn);
	}

	async addOwner(ownerName, address, phone, email, ownerSsn) {
		return this.#dataSource.addOwner(ownerName, address, phone, email, ownerSsn);
	}

	async deletePet(petName, ownerSsn) {
		return this.#dataSource.deletePet(petName, ownerSsn);
	}

	async updatePetHealthStatus(petName, healthstatus) {
		return this.#dataSource.updatePetHealthStatus(petName, healthstatus);
	}
}
