import { Atlas } from './atlas.js';
import { RESTDataSource } from './rest-data-source.js';

/** The data source to use for our Atlas instance */
const dataSource = new RESTDataSource('localhost:3000');

/** The Atlas instance */
const atlas = new Atlas(dataSource);

/** The file name of the page displaying the list of My courses */
const myCoursesPage = 'my-courses.html';

/** The file name of the page displaying the list of Miun courses */
const miunCoursesPage = 'index.html';

/** The name of the page currently beeing displayed */
let currentPage = miunCoursesPage; // asume miun courses page

/** An array of all courses to list on the page. It can be Miun 
 * courses or My courses depending on the current page. */
let allCourses = [];

/** Maximum number of courses to show on the page (when searching
 * all courses in the list will be searched). Use -1 to show
 * all courses. */
const maxCoursesToShow = 100;

/**
 * Constants for adding a course to My courses
 */
const courseCodeInput = document.createElement('input');
const addButton = document.createElement('button');
const gradeSelect = document.createElement('select');

/** Compare two course codes in alphabetical order
 * (can be used when sorting a list of courses) */
const courseCodeDescending = (a, b) => a.courseCode > b.courseCode ? 1 : -1;

/** A filter that returns true for courses whose course code or 
 * course name contains the searched string */
const searchFilter = (course, searchString) => {
	// Search in course code and course name (haystack)
	const haystack = (
		course.courseCode + '|' + 
		course.name
		).toLowerCase();

	// return false if nothing to search for or if the searched string is not found
	return searchString == '' || haystack.includes(searchString);
};

/**
 * Displays a message to the user in a dialog box. The dialog can be
 * styled by specifying a CSS class name.
 * @param message the message to be displayed to the user
 * @param style the name of a CSS class to style the dialog with
 */
function showMessage(message, style) {
	// The dialog element used for displaying messages to the user
	const dialog = document.querySelector('dialog');

	// The element containing the message to be displayed
	const text = dialog.querySelector('p');

	// Setup dialog before showing it
	text.innerText = message;
	dialog.className = style;

	// Open the dialog non-modally
	dialog.show();
}

/**
 * Displays a message indicating a success of some sort.
 * @param message the success message to be displayed to the user
 */
function showSuccessMessage(message) {
	showMessage(message, 'success');
}

/**
 * Displays a message indicating an error of some sort.
 * @param message the error message to be displayed to the user
 */
function showErrorMessage(message) {
	showMessage(message, 'error');
}

/**
 * Handles initialization of the app.
 */
function initializeApp() {
	// Get the name of the current page
	currentPage = window.location.pathname.split('/').find(str => str.includes('.html'));

	// Call searchCourses function on keyup events from the search text input
	document.getElementById('search').addEventListener('keyup', searchCourses);
	
	// Get all Miun courses or My courses from Atlas
	const coursesPromise = currentPage == myCoursesPage ? atlas.getMyCourses() : atlas.getCourses();
	coursesPromise
	.then(fetchedCourses => {
		allCourses = fetchedCourses;
		createCoursesTable(); // create table (body) to show the fetched courses
	})
	.catch(error => {
		console.error(`An error occurred when getting courses from Atlas: ${error.message}`);
		showErrorMessage(error.message);
	});
}

/**
* Creates the HTML table displaying the courses (either Miun courses or My courses).
*/
function createCoursesTable() {
	// The type of course (a Miun course or a My course) to be listed in the table depends
	// on the name of the current location (name of the page). The structure of the table 
	// displaying course data also depends upon this.

	// Descide the function to be called to create the tabel
	const tableRowsCreator =
		currentPage == myCoursesPage ? createTableRowsForMyCourses : createTableRowsForMiunCourses;

	// Regardles the type of table to create, sort and filter the courses first
	const searchString = document.getElementById('search').value.toLowerCase();

	// Keep the original course array intact by assigning the filtered courses to a new array
	let coursesToShow = allCourses.filter(course => searchFilter(course, searchString));
	// Sort by course code
	coursesToShow = coursesToShow.sort(courseCodeDescending);
	// Limit number courses to show
	if (maxCoursesToShow > -1) {
		coursesToShow = coursesToShow.slice(0, maxCoursesToShow); 
	}

	// Remove any existing data in the table
	const table = document.getElementById('course_data');
	table.innerHTML = null;
	
	// Create the table (a call to createTableForMyCourses(courses, table)
	// or createTableForMiunCourses(courses, table)) will be made
	tableRowsCreator(coursesToShow, table);

	// Update number of displayed courses out of total courses
	updateNumberOfoursesShowing(coursesToShow.length);
	updateNumberOfoursesTotal(allCourses.length);
}

/**
* Create table rows for all Miun courses in the array.
* @param courses an array of Miun courses to create table rows for
* @param table the table or the table body to add the rows to
*/
function createTableRowsForMiunCourses(courses, table) {

	// For each course create a table row with course data
	courses.forEach(course => {
		// Make a table row
		const tr = document.createElement('tr');

		// Populate the row with the data to display
		tr.appendChild(createTd(course.courseCode));
		tr.appendChild(createTd(course.name,
			element => element.classList.add('text-left'))); // course name should be left aligned
		tr.appendChild(createTd(course.subject, element => element.classList.add('text-left')));
		tr.appendChild(createTd(course.progression));
		tr.appendChild(createTd(course.points));
		tr.appendChild(createTd(course.institutionCode));

		// Add the row to the table
		table.appendChild(tr);
	});
}

/**
* Create table rows for all My courses in the array.
* @param courses an array of My courses to create table rows for
* @param table the table or the table body to add the rows to
*/
function createTableRowsForMyCourses(courses, table) {

	// Get the elements to add to the add course container
	const addCourseContainer = document.getElementById('add-course-container');
	courseCodeInput.placeholder = 'Skriv in kurskod';

	// If the input field, grade select and the add button are not already in the add course container, add them
	if (!courseCodeInput.parentNode) {
		addCourseContainer.appendChild(courseCodeInput);
	}
	
	if (!gradeSelect.parentNode) {
		addCourseContainer.appendChild(gradeSelect);
	}

	if (!addButton.parentNode) {
		addCourseContainer.appendChild(addButton);
	}
	
	// Get grades and then create the table
	atlas.getGrades().then(grades => {
		grades.forEach(grade => {
				const option = document.createElement('option');
				option.value = grade;
				option.textContent = grade;
				gradeSelect.appendChild(option);
			});

		// For each My course create a table row with course data
		courses.forEach(course => {
			// Make a table row
			const tr = document.createElement('tr');

			// Populate the row with the data to display
			tr.appendChild(createTd(course.courseCode));
			tr.appendChild(createTd(course.name,
				element => element.classList.add('text-left'))); // course name should be left aligned
			
			// Create a td to hold the select element for selecting grade
			const td = document.createElement('td');

			// Create a select element for the grades that can be selected
			const selectElement = document.createElement('select');
			// Give each select element a unique id
			selectElement.id = 'select_' + course.courseCode;

			
			// Add each grade as an option in the select element and set
			grades.forEach(grade => {
				const option = document.createElement('option');
				option.value = grade;
				option.textContent = grade;
			
				// If the grade is the selected grade for the course, set to true
				if (grade === course.grade) {
					option.selected = true;
				}
			
				selectElement.appendChild(option);
			});

			// Event listener for the select element
			selectElement.addEventListener('change', async function() {
				// Get the selected grade
				const selectedGrade = this.value;
			
				// Update the grade
				const result = await atlas.updateMyCourse(course.courseCode, selectedGrade);
				
				// Show message depending on the result
				if (result) {
					showSuccessMessage('Grade updated successfully');
					course.grade = selectedGrade; // Update the grade	
				} 
				else {
					showErrorMessage('Failed to update grade');
				}			
			});
	
			td.appendChild(selectElement);
			tr.appendChild(td);

			// Create a delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Radera';
			// Event listener for the delete button
            deleteButton.addEventListener('click', async function() {

                // Call the deleteMyCourse method
                const result = await atlas.deleteMyCourse(course.courseCode);

                // Show message depending on the result
                if (result) {
                    tr.remove(); // Remove the row from the table
					showSuccessMessage('Course deleted successfully');
                } else {
                    showErrorMessage('Failed to delete course');
                }
            });

            // Add the delete button to the row
            tr.appendChild(deleteButton);
			// Add the row to the table
			table.appendChild(tr);	
		});

		addButton.textContent = 'Lägg Till';
		// Event listener for the add button
		addButton.addEventListener('click', async function() {
			// Get the course code and selected grade from the input field and selector
			const courseCode = courseCodeInput.value;
			const selectedGrade = gradeSelect.value;

			try {
				// Get the course from from the course code
				const course = await atlas.getCourse(courseCode);
				// Get the course from my courses
				const myCourses = await atlas.getMyCourse(courseCode);
				// If the course is already added, show an error message
				if (myCourses.courseCode === course.courseCode) {
					showErrorMessage('Course is already added');
					return;
				}

				// Call the addMyCourse method
				const result = await atlas.addMyCourse(course.courseCode, selectedGrade);
				// Show message depending on the result
				if (result) {
					showSuccessMessage('Course added successfully');
					course.grade = selectedGrade; // Update the grade
				} 
				else {
					showErrorMessage('Failed to add course');
				}
			}
			catch (error) {
				console.error('Failed to add course: ' + error.message);
			}
		});			
	});
}


/**
* Create a data cell (td element) with the specified text
* @param text the text to to be displayed in the data cell
* @param extra a lambda that handles any extra that needs to be added to the data cell
* @return the created data cell
*/
function createTd(text, extra) {
	const td = document.createElement('td');
	td.innerText = text;
	
	if (extra) {
		extra(td);
	}

	return td;
}

/**
 * Perform a search for courses matching the text entered in the search input.
 */
function searchCourses() {
	// A re-creation of the table will filter out the courses not matching the searched value
	createCoursesTable();
}

/**
 * Update the page with the number of courses currently showing. This number
 * is the larger value of the 'maximum number of courses to show' and the
 * 'number of currently filtered courses'.
 * @param coursesToShow an array with courses that are shown on the page
 */
function updateNumberOfoursesShowing(coursesToShow) {
	const coursesShowing = document.getElementById('courses_showing');
	coursesShowing.innerText = `${coursesToShow}`;

}

/**
 * Update the page with the total number of courses. This number can be the
 * total number of Miun courses or the total number of My courses, depending
 * on the current page.
 * @param allCourses an array with all courses 
 */
function updateNumberOfoursesTotal(allCourses) {
	const coursesTotal = document.getElementById('courses_total');
	coursesTotal.innerText = `${allCourses}`;
}

document.addEventListener('DOMContentLoaded', initializeApp);
