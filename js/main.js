import { Atlas } from './atlas.js';
import { RESTDataSource } from './rest-data-source.js';

const dataSource = new RESTDataSource('http://localhost:3000');
const atlas = new Atlas(dataSource);

const registerPage = 'register.html';
const mainPage = 'index.html';

let currentPage = mainPage; 
let allPets = [];

const maxPetsToShow = 100;

async function initializeApp() {
    const atlas = new Atlas({
        getPets: async () => {
            const response = await fetch('http://localhost:3000/api/v1/pets');
            const data = await response.json();
            return data;
        },
        getOwners: async () => {
            const response = await fetch('http://localhost:3000/api/v1/owners');
            const data = await response.json();
            return data;
        }
    });

    const pets = await atlas.getPets();
    const owners = await atlas.getOwners();

    populateTable(pets, owners);
    const petForm = document.getElementById('pet-form');
    const backToMainButton = document.getElementById('back-to-main');

    petForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(petForm);
        const petData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:3000/api/v1/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(petData)
            });

            if (response.ok) {
                alert('Pet saved successfully!');
                petForm.reset();
                // Refresh the table with updated data
                const updatedPets = await atlas.getPets();
                const updatedOwners = await atlas.getOwners();
                populateTable(updatedPets, updatedOwners);
            } else {
                alert('Failed to save pet.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving the pet.');
        }
    });

    backToMainButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

function populateTable(pets, owners) {
    const tableBody = document.getElementById('course_data');
    const petsShowing = document.getElementById('pets_showing');
    const petsTotal = document.getElementById('pets_total');

    if (!tableBody || !petsShowing || !petsTotal) {
        console.error('Required HTML elements are missing.');
        return;
    }

    tableBody.innerHTML = ''; // Clear existing rows

    petsTotal.textContent = pets.length;

    pets.forEach(pet => {
        const owner = owners.find(owner => owner.ssn === pet.ownerSsn);
        const row = document.createElement('tr');

        row.innerHTML = `
            <td class="pet-name">${pet.name}</td>
            <td class="pet-species">${pet.species}</td>
            <td class="pet-breed">${pet.breed}</td>
            <td class="pet-birthdate">${pet.birthdate}</td>
            <td class="pet-healthstatus">
                <select class="health-status-dropdown" data-name="${pet.name}">
                    <option value="Healthy" ${pet.healthStatus === 'Healthy' ? 'selected' : ''}>Healthy</option>
                    <option value="Sick" ${pet.healthStatus === 'Sick' ? 'selected' : ''}>Sick</option>
                    <option value="Recovering" ${pet.healthStatus === 'Recovering' ? 'selected' : ''}>Recovering</option>
                </select>
            </td>
            <td class="owner-ssn">${owner ? owner.ssn : pet.ownerSsn}</td>
            <td><button class="delete-button" data-name="${pet.name}">Delete</button></td>
        `;
        

        tableBody.appendChild(row);
    });

    petsShowing.textContent = pets.length;

    // Attach event listeners to health status dropdowns
    const healthStatusDropdowns = document.querySelectorAll('.health-status-dropdown');
    healthStatusDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', async function() {
            const petName = this.getAttribute('data-name');
            const newHealthStatus = this.value;
            console.log(`Updating health status for pet: ${petName} to ${newHealthStatus}`);
            const result = await atlas.updatePetHealthStatus(petName, newHealthStatus);
            console.log(result);
            if (result) {
                alert('Health status updated successfully!');
            } else {
                alert('Failed to update health status.');
            }
        });
    });



    // Attach event listeners to delete buttons
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const petName = this.getAttribute('data-name');
            console.log(`Deleting pet: ${petName}`);
            const result = await atlas.deletePet(petName);
            console.log(result);
            if (result) {
                alert('Pet deleted successfully!');
                // Refresh the table with updated data
                const updatedPets = await atlas.getPets();
                const updatedOwners = await atlas.getOwners();
                populateTable(updatedPets, updatedOwners);
            } else {
                alert('Failed to delete pet.');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);