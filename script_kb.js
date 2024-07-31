// Selecting the DOM Elements
let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textArea-cont");

let allPriorityColors = document.querySelectorAll(".priority-color");

let colors = ["lightpink", "lightgreen", "lightblue", "black"];

let toolboxColors = document.querySelectorAll(".color");

let lockClass = "fa-lock"; // Closed lock icon
let unlockClass = "fa-lock-open"; // Open-lock icon

let addTaskFlag = false;
let removeTaskFlag = false;

let modalPriorityColor = colors[colors.length - 1];

let ticketsArr = [];

// console.log(addTaskFlag);

// local storage
// Check if there are any tickets stored in local storage and load them
if (localStorage.getItem("tickets")) {
	ticketsArr = JSON.parse(localStorage.getItem("tickets"));
	ticketsArr.forEach(function (ticket) {
		createTicket(ticket.ticketColor, ticket.ticketTask, ticket.ticketID);
	});
}

// Filtering Tasks based on the selected toolbox color
for (let i = 0; i < toolboxColors.length; i++) {
	toolboxColors[i].addEventListener("click", function () {
		let selectedToolBoxColor = toolboxColors[i].classList[0];

		let filteredTickets = ticketsArr.filter(function (ticket) {
			return selectedToolBoxColor === ticket.ticketColor;
		});
		// console.log(filteredTickets);
		let allTickets = document.querySelectorAll(".ticket-cont");

		for (let i = 0; i < allTickets.length; i++) {
			allTickets[i].remove();
		}

		filteredTickets.forEach(function (filteredTicket) {
			createTicket(
				filteredTicket.ticketColor,
				filteredTicket.ticketTask,
				filteredTicket.ticketID
			);
		});
	});

	// Display all tickets when toolbox color is double-clicked
	toolboxColors[i].addEventListener("dblclick", function () {
		let allTickets = document.querySelectorAll(".ticket-cont");
		for (let i = 0; i < allTickets.length; i++) {
			allTickets[i].remove();
		}
		ticketsArr.forEach(function (ticketObj) {
			createTicket(
				ticketObj.ticketColor,
				ticketObj.ticketTask,
				ticketObj.ticketID
			);
		});
	});
}

// Selecting priority color for the new task
allPriorityColors.forEach(function (colorElem) {
	colorElem.addEventListener("click", function () {
		allPriorityColors.forEach(function (priorityColorElem) {
			priorityColorElem.classList.remove("active");
		});
		colorElem.classList.add("active");

		// Set the default priority color to 'lightpink'
		modalPriorityColor = colorElem.classList[0];
	});
});

// Handling the add button click event
addBtn.addEventListener("click", function () {
	// Toggle the modal visibility
	addTaskFlag = !addTaskFlag;

	if (addTaskFlag == true) {
		modalCont.style.display = "flex";
	} else {
		modalCont.style.display = "none";
	}
});

// Handling the remove button click event
removeBtn.addEventListener("click", function () {
	removeTaskFlag = !removeTaskFlag;
	if (removeTaskFlag == true) {
		alert("Delete Button Has Been Activated");
		removeBtn.style.color = "red";
	} else {
		removeBtn.style.color = "white";
	}
});

// Handling the keydown event in the modal (Shift key to create a ticket)
modalCont.addEventListener("keydown", function (e) {
	let key = e.key;
	if (key === "Shift") {
		createTicket(modalPriorityColor, textAreaCont.value); // Create a new ticket
		modalCont.style.display = "none"; // Hide the modal
		// console.log(textAreaCont.value);
		textAreaCont.value = ""; // Clear the text area
	}
});

// Function to create a new ticket
function createTicket(ticketColor, ticketTask, ticketID) {
	let id = ticketID || shortid(); // generate a unique ID if not provided
	let ticketCont = document.createElement("div");
	ticketCont.setAttribute("class", "ticket-cont");

	ticketCont.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">
        <i class="fa-solid fa-lock"></i>
    </div>
    `;

	mainCont.appendChild(ticketCont); // add the ticket to the main container

	handleRemoval(ticketCont, id); // handle ticket removal
	handleLock(ticketCont, id); // handle ticket locking / unlocking
	handleColor(ticketCont, id); // handle ticket color change

	// Add the new ticket to the array and local storage if it's a new ticket
	if (!ticketID) {
		ticketsArr.push({ ticketColor, ticketTask, ticketID: id });
		localStorage.setItem("tickets", JSON.stringify(ticketsArr));
	}
	// console.log(ticketsArr);
}

// Function to handle ticket removal
function handleRemoval(ticket, id) {
	ticket.addEventListener("click", function () {
		if (!removeTaskFlag) return;

		let idx = getTicketIdx(id);
		ticket.remove(); // remove the ticket from the UI
		let deletedElement = ticketsArr.splice(idx, 1); // remove the ticket from the array
		// console.log(deletedElement);
		localStorage.setItem("tickets", JSON.stringify(ticketsArr));
	});
}

// Function to handle ticket locking / unlocking
function handleLock(ticket, id) {
	let ticketLockElem = ticket.querySelector(".ticket-lock");
	let ticketLockIcon = ticketLockElem.children[0];
	let ticketTaskArea = ticket.querySelector(".task-area");

	ticketLockIcon.addEventListener("click", function () {
		let ticketIdx = getTicketIdx(id);
		if (ticketLockIcon.classList.contains(lockClass)) {
			ticketLockIcon.classList.remove(lockClass);
			ticketLockIcon.classList.add(unlockClass);
			ticketTaskArea.setAttribute("contenteditable", "true");
		} else {
			ticketLockIcon.classList.remove(unlockClass);
			ticketLockIcon.classList.add(lockClass);
			ticketTaskArea.setAttribute("contenteditable", "false");
		}
		// Update the task content in the array and local storage
		ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText; // updated task
		localStorage.setItem("tickets", JSON.stringify(ticketsArr));
	});
}

// Function to handle ticket color change
function handleColor(ticket, id) {
	let ticketColorBand = ticket.querySelector(".ticket-color");
	ticketColorBand.addEventListener("click", function () {
		let ticketIdx = getTicketIdx(id);
		let currentColor = ticketColorBand.classList[1];

		let currentColorIdx = colors.findIndex(function (color) {
			return currentColor === color;
		});

		currentColorIdx++;

		let newTicketColorIdx = currentColorIdx % colors.length;
		let newTicketColor = colors[newTicketColorIdx];
		ticketColorBand.classList.remove(currentColor);
		ticketColorBand.classList.add(newTicketColor);

		// Update the ticket color in the array and local storage
		ticketsArr[ticketIdx].ticketColor = newTicketColor;
		localStorage.setItem("tickets", JSON.stringify(ticketsArr));
	});
}

// Function to get the index of a ticket in the array
function getTicketIdx(id) {
	let ticketIdx = ticketsArr.findIndex(function (ticketObj) {
		return ticketObj.ticketID === id;
	});
	// console.log(ticketIdx);
	return ticketIdx;
}
