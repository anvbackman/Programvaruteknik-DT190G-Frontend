import { Atlas } from './atlas.js';
import { RESTDataSource } from './rest-data-source.js';

const dataSource = new RESTDataSource('https://anba2205-project-backend-dt190g.azurewebsites.net');
const atlas = new Atlas(dataSource);

const registerPage = 'register.html';
const mainPage = 'index.html';

let currentPage = mainPage;
let allPets = [];

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
async function initializeApp() {
    try {
        currentPage = window.location.pathname.split('/').find(str => str.includes('.html')); // Get the current page

        // Await both promises to resolve
        const pets = await atlas.getPets(); 
        const owners = await atlas.getOwners();

        // Once both are resolved, proceed with processing the data
        allPets = pets;
        populateTable(pets, owners);

    } catch (error) {
        console.error(`An error occurred when getting data from Atlas: ${error.message}`);
        showErrorMessage(error.message);
    }

    if (currentPage === registerPage) {  // If the current page is the register page
        document.getElementById('pet-form').addEventListener('submit', formSubmition);
    }

    document.getElementById('search').addEventListener('input', handleSearch); // Add an event listener for the search input
}

/**
 * Handles the search event.
 * 
 * @param {*} event the search event
 */
async function handleSearch(event) {
    const query = event.target.value.toLowerCase(); // Get the search query
    const filteredPets = allPets.filter(pet =>  // Filter the pets based on the search query
        pet.petName.toLowerCase().includes(query) ||
        pet.ownerSsn.toLowerCase().includes(query)
    );

    atlas.getOwners().then(owners => { // Get all owners
        populateTable(filteredPets, owners); // Populate the table with the filtered pets
    }
    ).catch(error => { // Catch any errors
        console.error('Error fetching owners:', error);
        showErrorMessage('An error occurred while fetching owners.');
    });
}

/**
 * 
 * @param {*} event 
 * @returns 
 */
async function formSubmition(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const formData = new FormData(event.target); // Get the form data
    const petData = Object.fromEntries(formData.entries()); // Convert the FormData to an object

    try {
        // Extract the pet data
        const { petName, species, breed, color, birthdate, healthStatus, ownerSsn, ownerName, address, phone, email } = petData; 

        // Validate required fields
        if (!petName || !species || !breed || !birthdate || !healthStatus || !ownerSsn || !ownerName || !address || !phone || !email) {
            showErrorMessage('All fields are required.');
            return;
        }

        const owners = await atlas.getOwners();
        const existingOwner = owners.find(owner => owner.ownerSsn === ownerSsn); // Check if the owner already exists

        if (!existingOwner) {
            await atlas.addOwner(ownerName, address, phone, email, ownerSsn); // Add the new owner if they do not already exist
        }

        // Add the new pet
        await atlas.addPet(petName, species, breed, color, birthdate, healthStatus, ownerSsn);
        showSuccessMessage('Pet saved successfully!');
        event.target.reset(); // Reset the form
        const updatedPets = await atlas.getPets(); // Get the updated pets
        const updatedOwners = await atlas.getOwners(); // Get the updated owners
        populateTable(updatedPets, updatedOwners);  // Populate the table with the updated pets

    } catch (error) {
        console.error('Error:', error);
        showErrorMessage('An error occurred while saving the pet.');
    }
}

/**
 * Populates the table with the pets and owners.
 * 
 * @param {*} pets the pets to populate the table with
 * @param {*} owners the owners to populate the table with
 * @returns the populated table
 */
function populateTable(pets, owners) {
    const table = document.getElementById('pet_data');
    const petsShowing = document.getElementById('pets_showing');
    const petsTotal = document.getElementById('pets_total');

    
    if (!table || !petsShowing || !petsTotal) { // Check if the required HTML elements are missing
        console.error('Required HTML elements are missing.');
        return;
    }

    table.innerHTML = null; // Clear existing rows
    petsTotal.innerText = pets.length; // Set the total number of pets

    pets.forEach(pet => { // Iterate over the pets
        const owner = owners.find(owner => owner.ownerSsn === pet.ownerSsn); // Find the owner of the pet
        const tr = document.createElement('tr');

        const imgTd = document.createElement('td'); // Create a table data element for the image
        const img = document.createElement('img'); // Create an image element
        img.src = `images/${pet.species.toLowerCase()}.png`; // Set the image source based on the species
        img.alt = pet.species;
        img.width = 50;
        img.height = 50;
        imgTd.appendChild(img);
        tr.appendChild(imgTd);

        tr.appendChild(createTd(pet.petName));
        tr.appendChild(createTd(pet.species));
        tr.appendChild(createTd(pet.breed));
        tr.appendChild(createTd(pet.color));
        tr.appendChild(createTd(pet.birthdate));
        tr.appendChild(createTd(owner ? owner.ownerName : 'Unknown')); // Add the following rows to the table if the owner exists else add 'Unknown'
        tr.appendChild(createTd(owner ? owner.ownerSsn : pet.ownerSsn));
        tr.appendChild(createTd(owner ? owner.address : 'Unknown'));
        tr.appendChild(createTd(owner ? owner.phone : 'Unknown'));
        tr.appendChild(createTd(owner ? owner.email : 'Unknown'));
        
        // Add the health status dropdown and delete button if the current page is the register page
        if (currentPage === registerPage) {
            const healthStatusTd = document.createElement('td');
            const selectElement = document.createElement('select');
            selectElement.classList.add('health-status-dropdown');
            selectElement.dataset.name = pet.petName;

            ['Healthy', 'Sick', 'Recovering'].forEach(status => { // Add the health status options
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                if (status === pet.healthStatus) { // Set the selected option
                    option.selected = true;
                }
                selectElement.appendChild(option); // Append the option to the select element
            });

            selectElement.addEventListener('change', async function() { // Add an event listener for the change event
                const newHealthStatus = this.value; // Get the new health status
                const result = await atlas.updatePetHealthStatus(pet.petName, newHealthStatus); // Update the health status
 
                if (result) { // Check if the health status was updated successfully
                    showSuccessMessage('Health status updated successfully!');
                    pet.healthStatus = newHealthStatus;
                } else {
                    showErrorMessage('Failed to update health status.');
                }
            });

            healthStatusTd.appendChild(selectElement);
            tr.appendChild(healthStatusTd);

            // Add the delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.name = pet.petName;
            deleteButton.dataset.ssn = pet.ownerSsn;

            deleteButton.addEventListener('click', async function() { // Add an event listener for the click event
                const petName = this.dataset.name;
                const ownerSsn = this.dataset.ssn;
                const result = await atlas.deletePet(petName, ownerSsn); // Delete the pet

                if (result) { // Check if the pet was deleted successfully
                    showSuccessMessage('Pet deleted successfully!');
                    const updatedPets = await atlas.getPets(); // Get the updated pets
                    const updatedOwners = await atlas.getOwners(); // Get the updated owners
                    populateTable(updatedPets, updatedOwners); // Populate the table with the updated pets
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

/**
 * Creates a table data element.
 * 
 * @param {*} text the text to add to the table data element
 * @returns the table data element
 */
function createTd(text) { 
    const td = document.createElement('td');
    td.innerText = text;
    return td;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeApp);