import { Atlas } from './atlas.js';
import { RESTDataSource } from './rest-data-source.js';

const dataSource = new RESTDataSource('http://localhost:3000');
const atlas = new Atlas(dataSource);

const registerPage = 'register.html';
const mainPage = 'index.html';

let currentPage = mainPage;
let allPets = [];
const maxPetsToShow = 100;

function showMessage(message, style) {
    alert(message);
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function initializeApp() {
    currentPage = window.location.pathname.split('/').find(str => str.includes('.html'));
    const petsPromise = atlas.getPets();
    const ownersPromise = atlas.getOwners();

    Promise.all([petsPromise, ownersPromise])
        .then(([pets, owners]) => {
            allPets = pets;
            populateTable(pets, owners);
        })
        .catch(error => {
            console.error(`An error occurred when getting data from Atlas: ${error.message}`);
            showErrorMessage(error.message);
        });

    document.getElementById('pet-form').addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
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
                showSuccessMessage('Pet saved successfully!');
                event.target.reset();
                const updatedPets = await atlas.getPets();
                const updatedOwners = await atlas.getOwners();
                populateTable(updatedPets, updatedOwners);
            } else {
                showErrorMessage('Failed to save pet.');
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorMessage('An error occurred while saving the pet.');
        }
    });

    document.getElementById('back-to-main').addEventListener('click', () => {
        window.location.href = mainPage;
    });
}

function populateTable(pets, owners) {
    const table = document.getElementById('course_data');
    const petsShowing = document.getElementById('pets_showing');
    const petsTotal = document.getElementById('pets_total');

    if (!table || !petsShowing || !petsTotal) {
        console.error('Required HTML elements are missing.');
        return;
    }

    table.innerHTML = null; // Clear existing rows
    petsTotal.innerText = pets.length;

    pets.forEach(pet => {
        const owner = owners.find(owner => owner.ssn === pet.ownerSsn);
        const tr = document.createElement('tr');
        tr.appendChild(createTd(pet.name));
        tr.appendChild(createTd(pet.species));
        tr.appendChild(createTd(pet.breed));
        tr.appendChild(createTd(pet.birthdate));

        const healthStatusTd = document.createElement('td');
        const selectElement = document.createElement('select');
        selectElement.classList.add('health-status-dropdown');
        selectElement.dataset.name = pet.name;

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
            console.log(`Updating health status for pet: ${pet.name} to ${newHealthStatus}`);
            const result = await atlas.updatePetHealthStatus(pet.name, newHealthStatus);

            if (result) {
                showSuccessMessage('Health status updated successfully!');
                pet.healthStatus = newHealthStatus;
            } else {
                showErrorMessage('Failed to update health status.');
            }
        });

        healthStatusTd.appendChild(selectElement);
        tr.appendChild(healthStatusTd);
        tr.appendChild(createTd(owner ? owner.ssn : pet.ownerSsn));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.dataset.name = pet.name;

        deleteButton.addEventListener('click', async function() {
            console.log(`Deleting pet: ${pet.name}`);
            const result = await atlas.deletePet(pet.name);

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