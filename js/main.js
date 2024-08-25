import { Atlas } from './atlas.js';
import { RESTDataSource } from './rest-data-source.js';

const dataSource = new RESTDataSource('http://localhost:3000');
const atlas = new Atlas(dataSource);

const registerPage = 'register.html';
const mainPage = 'index.html';

let currentPage = mainPage;
let allPets = [];
const maxPetsToShow = 100;

/**
 * Shows a message to the user.
 * 
 * @param {*} message the message to show
 */
function showMessage(message) {
    alert(message);
}

/**
 * Shows a success message to the user.
 * 
 * @param {*} message the success message to show
 */
function showSuccessMessage(message) {
    showMessage(message);
}

/**
 * Shows an error message to the user.
 * 
 * @param {*} message the error message to show
 */
function showErrorMessage(message) {
    showMessage(message);
}

/**
 * Initializes the application.
 */
function initializeApp() {
    currentPage = window.location.pathname.split('/').find(str => str.includes('.html')); // Get the current page
    const petsPromise = atlas.getPets(); // Get all pets
    const ownersPromise = atlas.getOwners(); // Get all owners
 
    Promise.all([petsPromise, ownersPromise]) // Wait for both promises to resolve
        .then(([pets, owners]) => {
            allPets = pets;
            populateTable(pets, owners);
        })
        .catch(error => {
            console.error(`An error occurred when getting data from Atlas: ${error.message}`);
            showErrorMessage(error.message);
        });

    if (currentPage === registerPage) { 
        document.getElementById('pet-form').addEventListener('submit', formSubmition);
    }

    document.getElementById('search').addEventListener('input', handleSearch);
}

async function handleSearch(event) {
    console.log("Searching event called")
    const query = event.target.value.toLowerCase();
    const filteredPets = allPets.filter(pet => 
        pet.petName.toLowerCase().includes(query) ||
        pet.ownerSsn.toLowerCase().includes(query)
    );

    atlas.getOwners().then(owners => {
        populateTable(filteredPets, owners);
    }
    ).catch(error => {
        console.error('Error fetching owners:', error);
        showErrorMessage('An error occurred while fetching owners.');
    });

}


async function formSubmition(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const petData = Object.fromEntries(formData.entries());

    // Log FormData entries for debugging
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    try {
        const { petName, species, breed, color, birthdate, healthStatus, ownerSsn, ownerName, address, phone, email } = petData;

        // Validate required fields
        if (!petName || !species || !breed || !birthdate || !healthStatus || !ownerSsn || !ownerName || !address || !phone || !email) {
            showErrorMessage('All fields are required.');
            return;
        }

        const owners = await atlas.getOwners();
        const existingOwner = owners.find(owner => owner.ownerSsn === ownerSsn);

        if (!existingOwner) {
            console.log(`Owner with SSN ${ownerSsn} does not exist. Adding new owner...`);
            // Add the new owner if they do not already exist
            await atlas.addOwner(ownerName, address, phone, email, ownerSsn);
        }
        console.log("Owner exists");

        // Add the new pet
        await atlas.addPet(petName, species, breed, color, birthdate, healthStatus, ownerSsn);

        showSuccessMessage('Pet saved successfully!');
        event.target.reset();
        const updatedPets = await atlas.getPets();
        const updatedOwners = await atlas.getOwners();
        populateTable(updatedPets, updatedOwners);

    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('An error occurred while saving the pet.');
    }
}


function populateTable(pets, owners) {
    const table = document.getElementById('pet_data');
    const petsShowing = document.getElementById('pets_showing');
    const petsTotal = document.getElementById('pets_total');

    

    if (!table || !petsShowing || !petsTotal) {
        console.error('Required HTML elements are missing.');
        return;
    }

    table.innerHTML = null; // Clear existing rows
    petsTotal.innerText = pets.length;

    pets.forEach(pet => {
        const owner = owners.find(owner => owner.ownerSsn === pet.ownerSsn);
        const tr = document.createElement('tr');
        tr.appendChild(createTd(pet.petName));
        tr.appendChild(createTd(pet.species));
        tr.appendChild(createTd(pet.breed));
        tr.appendChild(createTd(pet.color));
        tr.appendChild(createTd(pet.birthdate));
        
        tr.appendChild(createTd(owner ? owner.ownerName : 'Unknown'));
        tr.appendChild(createTd(owner ? owner.ownerSsn : pet.ownerSsn));


        

        tr.appendChild(createTd(owner ? owner.address : 'Unknown'));
        tr.appendChild(createTd(owner ? owner.phone : 'Unknown'));
        tr.appendChild(createTd(owner ? owner.email : 'Unknown'));
        
        
        

        

        if (currentPage !== mainPage) {
            const healthStatusTd = document.createElement('td');
            const selectElement = document.createElement('select');
            selectElement.classList.add('health-status-dropdown');
            selectElement.dataset.name = pet.petName;

            ['Healthy', 'Sick', 'Recovering'].forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === pet.healthStatus) {
                    option.selected = true;
                }
                selectElement.appendChild(option);
            });

            selectElement.addEventListener('change', async function() {
                const newHealthStatus = this.value;
                console.log(`Updating health status for pet: ${pet.petName} to ${newHealthStatus}`);
                const result = await atlas.updatePetHealthStatus(pet.petName, newHealthStatus);

                if (result) {
                    showSuccessMessage('Health status updated successfully!');
                    pet.healthStatus = newHealthStatus;
                } else {
                    showErrorMessage('Failed to update health status.');
                }
            });

            healthStatusTd.appendChild(selectElement);
            tr.appendChild(healthStatusTd);

           
            

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.name = pet.petName;
            deleteButton.dataset.ssn = pet.ownerSsn;

            deleteButton.addEventListener('click', async function() {
                const petName = this.dataset.name;
                const ownerSsn = this.dataset.ssn;
                console.log(`Deleting pet: ${petName} with owner SSN: ${ownerSsn}`);
                const result = await atlas.deletePet(petName, ownerSsn);

                if (result) {
                    showSuccessMessage('Pet deleted successfully!');
                    const updatedPets = await atlas.getPets();
                    const updatedOwners = await atlas.getOwners();
                    populateTable(updatedPets, updatedOwners);
                } else {
                    showErrorMessage('Failed to delete pet.');
                }
            });

            tr.appendChild(deleteButton);
        }
        else {
            tr.appendChild(createTd(pet.healthStatus));
        }

        table.appendChild(tr);
    });

    petsShowing.innerText = pets.length;
}

function createTd(text) {
    const td = document.createElement('td');
    td.innerText = text;
    return td;
}

document.addEventListener('DOMContentLoaded', initializeApp);