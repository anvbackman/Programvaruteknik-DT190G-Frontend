import { Atlas } from './atlas.js';
import { RESTDataSource } from './rest-data-source.js';


const dataSource = new RESTDataSource('localhost:3000');


const atlas = new Atlas(dataSource);


const registerPage = 'register.html';


const mainPage = 'index.html';


let currentPage = mainPage; 

let allPets = [];

const maxPetsToShow = 100;



document.addEventListener('DOMContentLoaded', initializeApp);
