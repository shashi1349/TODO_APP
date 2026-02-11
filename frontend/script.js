const BASE_URL = "http://localhost:3000";

let authSection = document.getElementById("authSection");
let todoSection = document.getElementById("todoSection");
let todoItemsContainer = document.getElementById("todoItemsContainer");
let addTodoButton = document.getElementById("addTodoButton");
let saveTodoButton = document.getElementById("saveTodoButton");

//auth elements
let loginButton = document.getElementById("loginBtn");
let registerButton = document.getElementById("registerBtn");
let logoutButton = document.getElementById("logoutButton");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");

/* STATE */
let todoList = [];        // Data from server
let pendingTodos = [];   // Data waiting to be saved


function getToken() { return localStorage.getItem("token"); }

function showAuthSection() {
    authSection.style.display = "block";
    todoSection.style.display = "none";
}

function showTodoSection() {
    authSection.style.display = "none";
    todoSection.style.display = "block";
}

//authorization

loginButton.onclick = async function () {
    const username = usernameInput.value;
    const password = passwordInput.value;

    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    usernameInput.value = "";
    passwordInput.value = "";

    if (!res.ok) {
        alert("Invalid credentials");
        return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    showTodoSection();
    loadTodos();
};

registerButton.onclick = async function () {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    usernameInput.value = "";
    passwordInput.value = "";
    if (!res.ok) { alert("User already exists"); return; }
    alert("Registered successfully. Please login.");
};

logoutButton.onclick = function () {
    localStorage.removeItem("token");
    todoItemsContainer.innerHTML = "";
    pendingTodos = [];
    showAuthSection();
};

//todos functions

async function loadTodos() {
    const response = await fetch(`${BASE_URL}/todos`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!response.ok) {
        showAuthSection();
        return;
    }
    todoList = await response.json();
    todoItemsContainer.innerHTML = "";
    todoList.forEach(todo => createAndAppendTodo(todo, true));
    updateProgressUI(todoList);
}


addTodoButton.onclick = function () {
    let userInputElement = document.getElementById("todoUserInput");
    let text = userInputElement.value;

    if (text === "") {
        alert("Enter Valid Text");
        return;
    }

    const tempTodo = {
        id: Date.now(),
        task: text,
        is_completed: 0
    };

    pendingTodos.push(tempTodo); 
    createAndAppendTodo(tempTodo, false);
    userInputElement.value = "";
};


saveTodoButton.onclick = async function () {
    const token = getToken();
    if (!token) return;


    for (let todo of pendingTodos) {
        await fetch(`${BASE_URL}/todos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ task: todo.task })
        });
    }

    pendingTodos = []; 
    await loadTodos(); 
    alert("Saved to database!");
};

async function onTodoStatusChange(todoId, checkboxId, labelId, isSaved) {
    let checkboxElement = document.getElementById(checkboxId);
    let labelElement = document.getElementById(labelId);
    labelElement.classList.toggle("checked");

     const todo = todoList.find(t => t.id === todoId);
    if (todo) {
        todo.is_completed = checkboxElement.checked ? 1 : 0;
    }
    
    updateProgressUI(todoList);

    if (!isSaved) return;

    await fetch(`${BASE_URL}/todos/${todoId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ is_completed: checkboxElement.checked ? 1 : 0 })
    });

}

async function onDeleteTodo(todoId, isSaved) {
    if (isSaved) {
        await fetch(`${BASE_URL}/todos/${todoId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
    }
    document.getElementById("todo" + todoId).remove();

    todoList = todoList.filter(todo => todo.id !== todoId);
    updateProgressUI(todoList);
}

function createAndAppendTodo(todo, isSaved) {
    let todoId = "todo" + todo.id;
    let checkboxId = "checkbox" + todo.id;
    let labelId = "label" + todo.id;

    let todoElement = document.createElement("li");
    todoElement.classList.add("todo-item-container", "d-flex", "flex-row" ,"panel", "rounded-[2rem]", "p-2", "mb-4");
    todoElement.id = todoId;
    todoItemsContainer.appendChild(todoElement);

    let inputElement = document.createElement("input");
    inputElement.type = "checkbox";
    inputElement.id = checkboxId;
    inputElement.checked = todo.is_completed === 1;
    inputElement.onclick = () => onTodoStatusChange(todo.id, checkboxId, labelId, isSaved);
    inputElement.classList.add("checkbox-input");
    todoElement.appendChild(inputElement);

    let labelContainer = document.createElement("div");
    labelContainer.classList.add("label-container", "d-flex", "flex-row");
    todoElement.appendChild(labelContainer);

    let labelElement = document.createElement("label");
    labelElement.setAttribute("for", checkboxId);
    labelElement.id = labelId;
    labelElement.classList.add("checkbox-label");
    labelElement.textContent = todo.task;
    if (todo.is_completed === 1) labelElement.classList.add("checked");
    labelContainer.appendChild(labelElement);

    let deleteIconContainer = document.createElement("div");
    deleteIconContainer.classList.add("delete-icon-container");
    labelContainer.appendChild(deleteIconContainer);

    let deleteIcon = document.createElement("i");
    deleteIcon.classList.add("far", "fa-trash-alt", "delete-icon");
    deleteIcon.onclick = () => onDeleteTodo(todo.id, isSaved);
    deleteIconContainer.appendChild(deleteIcon);
}

//progreess bar
function calculateProgress(tasks) {
    const total = tasks.length;
    if (total === 0) return 0;

    const completed = tasks.filter(
        task => task.is_completed === 1 || task.is_completed === true
    ).length;

    return Math.round((completed / total) * 100);
}

function updateProgressUI(tasks) {
    const percent = calculateProgress(tasks);

    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");

    if (!progressText || !progressBar) return;

    progressText.textContent = percent + "% COMPLETED";
    progressBar.style.width = percent + "%";
}

// Initialize App on load
async function initApp() {
    const token = getToken();
    if (token) {
        showTodoSection();
        await loadTodos();
    } else {
        showAuthSection();
    }
}

initApp();

form=document.getElementById("form");
form.addEventListener("submit", function(event){
    event.preventDefault();
    loginButton.click();
});


// Elements


const agree = document.getElementById("agree");
const remember = document.getElementById("remember");
const footer1 = document.getElementById("footer1");
const footer2 = document.getElementById("footer2");
const createLink = document.getElementById("create");
const signLink = document.getElementById("sign");
const title = document.getElementById("form-title");
subtitle=document.getElementById("subtitle");

// Toggle to Register Mode
createLink.addEventListener("click", function (e) {

    title.innerText = "Join Focus Flow";
    remember.classList.add("hide");
    agree.classList.remove("hide");

    subtitle.innerText = "Start your journey to a more organized and peaceful lifestyle.";
    footer2.classList.remove("hide");
    loginButton.classList.add("hide");
    registerButton.classList.remove("hide");
    footer1.classList.add("hide");
});

// Toggle to Login Mode
signLink.addEventListener("click", function (e) {

    title.innerText = "Welcome Back";
    remember.classList.remove("hide");
    subtitle.innerText = "Log in to clear your mind and organize your day.";
    agree.classList.add("hide");
    footer1.classList.remove("hide");
    footer2.classList.add("hide");
    loginButton.classList.remove("hide");
    registerButton.classList.add("hide");   
});
