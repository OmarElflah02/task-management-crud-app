// Selectors
const taskForm = document.querySelector("#taskForm");
const titleInput = document.querySelector("#title");
const descriptionInput = document.querySelector("#description");
const statusInput = document.querySelector("#status");
const addBtn = document.querySelector("#addBtn");
const cancelBtn = document.querySelector("#cancelBtn");
const errorElement = document.querySelector(".errorElement");
const tasksContainer = document.querySelector(".task-container");
const searchInput = document.querySelector("#search");
const sortInput = document.querySelector("#sort");
const filterStatusInput = document.querySelector("#filterStatus");
const actionPopupConfirm = document.querySelector(".popup-action .confirm");
const actionPopupCancel = document.querySelector(".popup-action .cancel");
const themeToggle = document.querySelector("#themeToggle");
const toggleCircle = document.querySelector("#toggleCircle");

// Variables
let taskItems = JSON.parse(localStorage.getItem("tasks")) || [];
let taskId = null;
let dragIndex = null;
const textAddBtn = addBtn.textContent;

// Add Task
function addTask(e) {
	e.preventDefault();

	if (!checkInputValidation()) return;
	const taskData = {
		id: Date.now().toString(),
		title: titleInput.value,
		description: descriptionInput.value,
		status: statusInput.value,
	};

	if (taskId) {
		taskItems = taskItems.map((task) => (task.id === taskId ? { ...task, ...taskData } : task));
		cancelUpdate();
		taskNotification("success", "Task Updated Successfully");
	} else {
		taskItems.push(taskData);
		taskNotification("success", "Task Added Successfully");
	}

	save();
	renderTasks();
	resetForm();
}

// Validation
function checkInputValidation() {
	let validationText = "";

	if (titleInput.value.trim() === "") {
		validationText = "Please Enter Task Title";
	} else if (descriptionInput.value.trim() === "") {
		validationText = "Please Enter Task Description";
	} else if (statusInput.value.trim() === "") {
		validationText = "Please Select Task Status";
	}

	if (validationText) {
		errorElement.textContent = validationText;
		errorElement.classList.remove("hidden");
		return false;
	}

	errorElement.classList.add("hidden");
	errorElement.textContent = "";
	return true;
}

// Render Tasks
function renderTasks() {
	let taskHTML = "";
	tasksContainer.innerHTML = "";

	if (taskItems.length === 0) {
		tasksContainer.innerHTML = `
        <div class=" not_foundTaskCard col-span-full bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-md">
            <div class="text-5xl mb-4">
                <i class="hgi hgi-stroke hgi-rounded hgi-clipboard"></i>
            </div>
            <h2 class="text-xl font-semibold mb-2">
                No Tasks Found
            </h2>
            <p class="text-black/60">
                Add your first task to get started.
            </p>
        </div>
        `;
		if (localStorage.getItem("theme") === "dark") {
			updateThemeUI(true);
		}
		return;
	}

	taskItems.forEach((item, index) => {
		taskHTML += `

        <div
            data-index="${index}"
            class="task-card bg-white border border-gray-100 shadow-md rounded-2xl p-4 flex gap-2 duration-300 hover:-translate-y-1"
            draggable="true"
        >
            <div>
                <i class="hgi hgi-stroke hgi-rounded hgi-drag-drop-vertical"></i>
            </div>

            <div class="flex-1">
                <h2 class="text-lg mb-1 font-medium">
                    ${item.title}
                </h2>

                <p class="text-sm text-black/60 mb-3">
                    ${item.description}
                </p>

                <span
                    class="text-xs px-4 py-2 rounded-full ${item.status === "Done" ? "bg-green-100 text-green-700" : item.status === "Review" ? "bg-blue-100 text-blue-700" : item.status === "In Progress" ? "bg-yellow-100 text-yellow-700" : "bg-gray-200 text-gray-700"}"
                >
                    ${item.status} 
                </span>
            </div>

            <div class="flex h-fit gap-2">
                <button
                    data-delete="${item.id}"
                    class="delete w-7 h-7 rounded-full bg-red-200 text-red-500 flex justify-center items-center cursor-pointer hover:scale-110 duration-300"
                >
                    <i class="hgi hgi-stroke hgi-rounded hgi-delete-02 pointer-events-none"></i>
                </button>

                <button
                    data-edit="${item.id}"
                    class="edit w-7 h-7 rounded-full bg-sky-200 text-sky-500 flex justify-center items-center cursor-pointer hover:scale-110 duration-300"
                >
                    <i class="hgi hgi-stroke hgi-rounded hgi-edit-01 pointer-events-none"></i>
                </button>
            </div>
        </div>
        `;
	});

	tasksContainer.innerHTML = taskHTML;

	if (localStorage.getItem("theme") === "dark") {
		updateThemeUI(true);
	}

	const taskCards = document.querySelectorAll(".task-card");
	taskCards.forEach((card) => {
		card.addEventListener("dragstart", dragStart);
		card.addEventListener("dragover", dragOver);
		card.addEventListener("drop", drop);
	});
}

renderTasks(); // Initial Render

// Save LocalStorage
function save() {
	localStorage.setItem("tasks", JSON.stringify(taskItems));
}

// Reset Form
function resetForm() {
	titleInput.value = "";
	descriptionInput.value = "";
	statusInput.value = "";
}

// Notification
function taskNotification(type, message) {
	switch (type) {
		case "success":
			return Toastify({
				text: message,
				duration: 1500,
				gravity: "top",
				position: "right",
				style: {
					background: "#bbf7d0",
					color: "#166534",
					borderRadius: "12px",
				},
			}).showToast();

		case "failure":
			return Toastify({
				text: message,
				duration: 1500,
				gravity: "top",
				position: "right",
				style: {
					background: "#fecaca",
					color: "#991b1b",
					borderRadius: "12px",
				},
			}).showToast();
	}
}

// Search + Sort + Filter
function searchSortAndFilterTasks() {
	const searchValue = searchInput.value.toLowerCase();
	const sortValue = sortInput.value;
	const filterValue = filterStatusInput.value;

	taskItems = JSON.parse(localStorage.getItem("tasks")); // Get Tasks

	// Search
	let tasks = taskItems.filter((task) => task.title.toLowerCase().includes(searchValue) || task.description.toLowerCase().includes(searchValue));

	// Sort
	if (sortValue === "a_to_z") {
		tasks.sort((a, b) => a.title.localeCompare(b.title)); // Ascending
	}
	if (sortValue === "z_to_a") {
		tasks.sort((a, b) => b.title.localeCompare(a.title)); // Descending
	}

	// Filter
	if (filterValue !== "all") {
		tasks = tasks.filter((task) => task.status === filterValue); // Filter
	}

	taskItems = tasks;
	renderTasks();
}

// Delete Task
function deleteTask(id) {
	taskId = id;
	showActionPopup("Are you sure you want to delete this task?");
}

// Edit Task
function editTask(id) {
	const item = taskItems.find((task) => task.id === id);
	titleInput.value = item.title;
	descriptionInput.value = item.description;
	statusInput.value = item.status;
	taskId = item.id;
	addBtn.textContent = "Update Task";
	cancelBtn.classList.remove("hidden");
}

// Popup
function showActionPopup(message) {
	const actionPopup = document.querySelector(".popup-action");
	const actionPopupContainer = document.querySelector(".popup-container");
	const actionText = document.querySelector(".popup-container p");
	actionText.textContent = message;
	actionPopup.classList.remove("opacity-0", "pointer-events-none");
	actionPopupContainer.classList.remove("translate-y-6", "opacity-0");
}

function hiddenActionPopup() {
	const actionPopup = document.querySelector(".popup-action");
	const actionPopupContainer = document.querySelector(".popup-container");
	actionPopup.classList.add("opacity-0", "pointer-events-none");
	actionPopupContainer.classList.add("translate-y-6", "opacity-0");
}

// Cancel Update
function cancelUpdate() {
	cancelBtn.classList.add("hidden");
	addBtn.textContent = textAddBtn;
	resetForm();
	taskId = null;
}

// Drag & Drop
function dragStart(e) {
	dragIndex = e.target.dataset.index;
}

function dragOver(e) {
	e.preventDefault();
}

function drop(e) {
	const targetCard = e.target.closest(".task-card");
	// if (!targetCard) return;
	const targetIndex = targetCard.dataset.index;
	// if (isNaN(targetIndex)) return;
	const draggedItem = taskItems[dragIndex];
	taskItems.splice(dragIndex, 1);
	taskItems.splice(targetIndex, 0, draggedItem);
	save();
	renderTasks();
}

// Dark Mode
function enableDarkMode() {
	document.body.classList.remove("bg-gray-50");
	document.body.classList.add("bg-gray-900", "text-white");
	localStorage.setItem("theme", "dark");
	updateThemeUI(true);
	updateToggleUI(true);
}

function disableDarkMode() {
	document.body.classList.add("bg-gray-50");
	document.body.classList.remove("bg-gray-900", "text-white");
	localStorage.setItem("theme", "light");
	updateThemeUI(false);
	updateToggleUI(false);
}

function updateToggleUI(isDark) {
	if (isDark) {
		themeToggle.classList.remove("bg-gray-200");
		themeToggle.classList.add("bg-sky-500");
		toggleCircle.classList.add("translate-x-8");
		toggleCircle.innerHTML = `<i class="hgi hgi-stroke hgi-rounded hgi-sun-03 text-yellow-500"></i>`;
	} else {
		themeToggle.classList.add("bg-gray-200");
		themeToggle.classList.remove("bg-sky-500");
		toggleCircle.classList.remove("translate-x-8");
		toggleCircle.innerHTML = `<i class="hgi hgi-stroke hgi-rounded hgi-moon-02 text-slate-700"></i>`;
	}
}

function updateThemeUI(isDark) {
	const cards = document.querySelectorAll(".crud-form-container, .task-card, .popup-container , .not_foundTaskCard");
	const inputs = document.querySelectorAll("input, textarea, select");
	const paragraphs = document.querySelectorAll(".task-card p, .crud-header p , .not_foundTaskCard p");
	cards.forEach((card) => {
		if (isDark) {
			card.classList.remove("bg-white", "border-gray-100");
			card.classList.add("bg-gray-800", "text-white", "border-gray-700");
		} else {
			card.classList.add("bg-white", "border-gray-100");
			card.classList.remove("bg-gray-800", "text-white", "border-gray-700");
		}
	});

	inputs.forEach((input) => {
		if (isDark) {
			input.classList.remove("bg-white", "text-black", "border-gray-200");
			input.classList.add("bg-gray-900", "text-white", "border-gray-700");
		} else {
			input.classList.add("bg-white", "text-black", "border-gray-200");
			input.classList.remove("bg-gray-900", "text-white", "border-gray-700");
		}
	});

	paragraphs.forEach((p) => {
		if (isDark) {
			p.classList.remove("text-black/60");
			p.classList.add("text-gray-300");
		} else {
			p.classList.add("text-black/60");
			p.classList.remove("text-gray-300");
		}
	});
}

// Theme Load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
	enableDarkMode();
} else if (savedTheme === "light") {
	disableDarkMode();
}

// Events
taskForm.addEventListener("submit", addTask);
searchInput.addEventListener("input", searchSortAndFilterTasks);
sortInput.addEventListener("change", searchSortAndFilterTasks);
filterStatusInput.addEventListener("change", searchSortAndFilterTasks);
actionPopupCancel.addEventListener("click", () => {
	hiddenActionPopup();
	taskNotification("failure", "Task not deleted");
});
actionPopupConfirm.addEventListener("click", () => {
	taskItems = taskItems.filter((task) => task.id !== taskId);
	save();
	renderTasks();
	taskNotification("success", "Task Deleted Successfully");
	hiddenActionPopup();
	taskId = null;
});

cancelBtn.addEventListener("click", () => {
	cancelUpdate();
	taskNotification("failure", "Task not updated");
});

// Event Delegation
tasksContainer.addEventListener("click", (e) => {
	const deleteBtn = e.target.closest("[data-delete]");
	const editBtn = e.target.closest("[data-edit]");
	if (deleteBtn) {
		deleteTask(deleteBtn.dataset.delete);
	}
	if (editBtn) {
		editTask(editBtn.dataset.edit);
	}
});

// Event Theme
themeToggle.addEventListener("click", () => {
	if (document.body.classList.contains("bg-gray-900")) {
		disableDarkMode();
	} else {
		enableDarkMode();
	}
});
