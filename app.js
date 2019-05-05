var state = {
	todo: [],
	inprogress: [],
	done: [],
	id: [],
	addItemToState: function(key, item) {
		this[key].push(item);
	},
	deleteItemFromState: function(key, item) {
		this[key] = this[key].filter(element => element.id != item.id);
	},
	moveItemToOtherPanel: function(key1, key2, itemId) {
		var item = state[key1].find(element => element.id == itemId);
		this.deleteItemFromState(key1, item);
		this.addItemToState(key2, item); 
	}
};

document.addEventListener('DOMContentLoaded', initBoard);

function initBoard() {
	initPanel('todo', state.todo);
	initPanel('inprogress', state.inprogress);
	initPanel('done', state.done);
	getCounter();
}

function initPanel(key, todoList) {
	var panel = document.getElementById(key);
	panel.innerHTML = '';
	for(var i = 0; i < todoList.length; i++ ) {
		var currentItemObject = todoList[i];
		var newTodoElement = createTodoElement(currentItemObject.id, currentItemObject.title);
		panel.appendChild(newTodoElement);
	}
}

function createTodoElement(id, title) {
	var todoElement = document.createElement('span');
	todoElement.id = id;
	todoElement.draggable = true; // for drag and drop
	todoElement.ondragstart = onDragStart; // for drag and drop
	todoElement.textContent = title;
	
	var deleteElement = document.createElement('i');
	deleteElement.className = 'fas fa-times';
	deleteElement.addEventListener('click', function() {		
		var parentId = this.parentNode.id;
		state.id.push(parentId);
		var found = false;
		function deleteElement(key) {
			for (var i = 0; i < state[key].length; i++) {
				if (found) break;
				if (state[key][i].id == parentId) {
					state.deleteItemFromState(key, state[key][i]);
					initPanel(key, state[key]);
					found = true
					break;
				}
			}
		}
		deleteElement('todo');
		deleteElement('inprogress');
		deleteElement('done');
		saveElements();
	});
	todoElement.appendChild(deleteElement);
	return todoElement;
}

var form = document.getElementById('form');

function openForm() {
	form.style.display = 'grid';
}

function cancelForm() {
	form.style.display = 'none';
	document.querySelector('textarea').value = '';
}

function addElement() {
	var element = {};
	if (state.id.length != 0) {
		element.id = +state.id.shift();
	} else {
		element.id = state.todo.length + state.inprogress.length + state.done.length + 1;
	}
	element.title = document.querySelector('textarea').value;
	state.todo.push(element);
	localStorage.setItem('todo', JSON.stringify(state.todo));
	initPanel('todo', state.todo);
	saveElements();
	cancelForm();
}

function saveElements() {
	localStorage.setItem('todo', JSON.stringify(state.todo));
	localStorage.setItem('inprogress', JSON.stringify(state.inprogress));
	localStorage.setItem('done', JSON.stringify(state.done));
	localStorage.setItem('id', JSON.stringify(state.id));
	getCounter();
}

if (localStorage.getItem('todo')) {
	state.todo = JSON.parse(localStorage.getItem('todo'));
	state.inprogress = JSON.parse(localStorage.getItem('inprogress'));
	state.done = JSON.parse(localStorage.getItem('done'));
	state.id = JSON.parse(localStorage.getItem('id'));
}

function clearDone() {
	for (var i = 0; i < state.done.length; i++) {
		state.id.push(state.done[i].id);
	}
	let done = document.getElementById('done');
	while (done.firstChild) {
		done.removeChild(done.firstChild);
	}
	state.done = [];
	saveElements();
}

function clearInprogress() {
	for (var i = 0; i < state.inprogress.length; i++) {
		state.id.push(state.inprogress[i].id);
	}
	let inprogress = document.getElementById('inprogress');
	while (inprogress.firstChild) {
		inprogress.removeChild(inprogress.firstChild);
	}
	state.inprogress = [];
	saveElements();
}

function clearTodo() {
	for (var i = 0; i < state.todo.length; i++) {
		state.id.push(state.todo[i].id);
	}
	let todo = document.getElementById('todo');
	while (todo.firstChild) {
		todo.removeChild(todo.firstChild);
	}
	state.todo = [];
	saveElements();
}

function clearAll() {
  clearTodo();
  clearInprogress();
  clearDone();
  localStorage.clear();
  location.reload(true);
};



function getCounter() {
	document.getElementById('countTodo').innerHTML = state.todo.length;
	document.getElementById('countInprogress').innerHTML = state.inprogress.length;
	document.getElementById('countDone').innerHTML = state.done.length;
}

function makeRequest(url) {
	var httpRequest = false;
	if (window.XMLHttpRequest) { // Mozilla, Safari, ...
		httpRequest = new XMLHttpRequest();
		if (httpRequest.overrideMimeType) {
		    httpRequest.overrideMimeType('text/xml');
		}
	} else if (window.ActiveXObject) { // IE
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {}
		}
	}
	if (!httpRequest) {
		return false;
	}
	httpRequest.onreadystatechange = function() {
		getContent(httpRequest);
	};
	httpRequest.open('GET', url, true);
	httpRequest.send(null);
}

function getContent(httpRequest) {
	if (httpRequest.readyState == 4) {
		if (httpRequest.status == 200) {
			var items = JSON.parse(httpRequest.responseText);
			state.todo = [];
			for (var i = 0; i < items.length; i++) {
				state.todo.push(items[i]);
			}
			state.inprogress = [];
			state.done = [];
			state.id = [];
			saveElements();
			location.reload();
        } else {
			alert('Не вышло :( Невозможно создать экземпляр класса XMLHTTP ');
		}
	}
}