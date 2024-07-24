let editIndex = -1;
let orderArray = [];

function showPage(pageId) {//code to switch pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
}

function updateOrdertextbox() {//updates the "order" value on the input textbox
    const block = document.getElementById('block').value;
    const count = getCountForBlock(block);
    document.getElementById('unit').value = count;
    order = `${block}${count}`;
    document.getElementById('order').value = order;
}

document.getElementById('block').addEventListener('change', updateOrdertextbox); //when the block is changed, updates the textbox

function getCountForBlock(block) {//gets the count of rows with the specified block
    let count = 1;
    for (let i = 0; i < orderArray.length; i++) {
        if (orderArray[i].startsWith(block)) {
            count++;
        }
    }
    return count;
}

function addActivity() {// adds an activity or updates if in edit mode
    const exercise = document.getElementById('exercise').value;
    const rpe = document.getElementById('rpe').value || 'na';
    const sets = document.getElementById('sets').value;
    const reps = document.getElementById('reps').value;
    const block = document.getElementById('block').value;
    const count = getCountForBlock(block);
    const order = `${block}${count}`;
    const table = document.getElementById('sessionActivities');

    if (editIndex >= 0) { //if in edit mode
        const row = table.rows[editIndex];
        row.cells[0].innerHTML = order;
        row.cells[1].innerHTML = exercise;
        row.cells[2].innerHTML = rpe;
        row.cells[3].innerHTML = sets;
        row.cells[4].innerHTML = reps;
        row.classList.remove('editable');
        editIndex = -1;
        document.getElementById('activityaddbutton').innerHTML = 'Add Activity';
        cancelButton.style.display = 'none'; // hide the cancel button
    } else {//if not in edit mode
        const row = table.insertRow();
        row.draggable = true;
        row.ondragstart = dragStartHandler;
        row.ondragover = dragOverHandler;
        row.ondragleave = dragLeaveHandler;
        row.ondrop = dropHandler;
        row.ondragend = dragEndHandler;

        row.insertCell(0).innerHTML = order;
        row.insertCell(1).innerHTML = exercise;
        row.insertCell(2).innerHTML = rpe;
        row.insertCell(3).innerHTML = sets;
        row.insertCell(4).innerHTML = reps;
        row.insertCell(5).innerHTML = '';
    }
    holyGrail()
    updateActions();
    
    
    clearTextboxes();
    updateOrdertextbox();
}

function compareOrders(order1, order2) {
    const block1 = order1[0];
    const block2 = order2[0];
    const number1 = parseInt(order1.substring(1));
    const number2 = parseInt(order2.substring(1));

    if (block1 < block2) return -1;
    if (block1 > block2) return 1;
    if (number1 < number2) return -1;
    if (number1 > number2) return 1;
    return 0;
}

function editActivity(index) {
    if (editIndex >= 0) { //if in edit mode
        showAlert('',"Plese press 'Cancel' before editing another activity.")
    } else{//run the normal edit code
        cancelButton.style.display = 'inline-block'; // show the cancel button
        document.getElementById('activityaddbutton').innerHTML = 'Update';
        const table = document.getElementById('sessionActivities');
        const row = table.rows[index];
        document.getElementById('block').value = row.cells[0].innerHTML[0];
        document.getElementById('unit').value = row.cells[0].innerHTML.slice(1);
        document.getElementById('order').value = row.cells[0].innerHTML;
        document.getElementById('exercise').value = row.cells[1].innerHTML;
        document.getElementById('rpe').value = row.cells[2].innerHTML;
        document.getElementById('sets').value = row.cells[3].innerHTML;
        document.getElementById('reps').value = row.cells[4].innerHTML;
        editIndex = index;
        row.classList.add('editable');
        showPage('activityPage');
    }

}

function cancelEdit() {
    updateOrderOrder()
    cancelButton.style.display = 'none'; // hide the cancel button
    const rows = document.querySelectorAll('.editable');
    document.getElementById('activityaddbutton').innerHTML = 'Add Activity';
    rows.forEach(row => {//remove all editing index tags
        row.classList.remove('editable');
    });
    editIndex = -1; //turn off edit mode
    
}

function deleteActivity(index) {
    if (editIndex >= 0 ) { //if in edit mode 
        const row = document.querySelector('.editable');
        const rowid = Array.from(row.parentElement.children).indexOf(row);//get the index of the editing row
        if(index == rowid){//if deleting the same row as currently editing run delete code like normal
            const table = document.getElementById('sessionActivities');
            const deletedOrder = table.rows[index].cells[0].innerHTML;
            table.deleteRow(index);
            orderArray = orderArray.filter(order => order !== deletedOrder);
            updateActions();
            holyGrail()
            cancelEdit()//exit editing mode
        }else{
            showAlert('',"Please press 'Cancel' before deleting another activity.")
        }

    } else{//run the normal edit code
        const table = document.getElementById('sessionActivities');
        const deletedOrder = table.rows[index].cells[0].innerHTML;
        table.deleteRow(index);
        orderArray = orderArray.filter(order => order !== deletedOrder);
        updateActions();
        holyGrail()
    }
    updateOrdertextbox()
}
function normalizeArray(arr){
    let maxNumbers = {}; // Create a map to store the max number for each block
    arr.forEach(item => {
        let block = item[0]; // Get the block (A, B, etc.)
        let number = parseInt(item.slice(1)); // Get the number part

        // Update the max number for the block if necessary
        if (!maxNumbers[block] || number > maxNumbers[block]) {
            maxNumbers[block] = number;
        }
    });

    // Calculate the necessary length for each block to avoid skipping numbers
    let neededNumbers = {};
    Object.keys(maxNumbers).forEach(block => {
        neededNumbers[block] = [];
        let count = 1;

        // Fill the neededNumbers array up to the length of the input array for each block
        while (neededNumbers[block].length < arr.filter(item => item[0] === block).length) {
            neededNumbers[block].push(block + count);
            count++;
        }
    });

    // Create a new array with normalized values
    let result = arr.map((item, index) => {
        let block = item[0]; // Get the block (A, B, etc.)
        return neededNumbers[block].shift(); // Replace with the next number in sequence
    });
    return result
}

function updateActions() {
    const rows = document.querySelectorAll('#sessionActivities tr');
    rows.forEach((row, index) => {
        const actionsCell = row.cells[5];
        actionsCell.innerHTML = `
            <div class="actions">
                <button class="edit" onclick="editActivity(${index})">Edit</button>
                <button onclick="deleteActivity(${index})">Delete</button>
            </div>
        `;
    });
}

function updateOrderOrder() {
    //this fuction replaces the order column with the stored array 'orderArray'
    var tbody = document.getElementById('sessionActivities');
    var rows = tbody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        let cell = rows[i].cells[0];
        cell.textContent = orderArray[i];
    }
}

function dragStartHandler(e) {
    dragged = this;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.outerHTML);
}

function dragOverHandler(e) {
    e.preventDefault();
    const boundingRect = this.getBoundingClientRect();
    const mouseY = e.clientY;
    if (mouseY < boundingRect.top + boundingRect.height / 2) {
        this.classList.add("drop-above");
        this.classList.remove("drop-below");
    } else {
        this.classList.add("drop-below");
        this.classList.remove("drop-above");
    }
}

function dragLeaveHandler() {
    this.classList.remove("drop-above", "drop-below");
}

function dropHandler(e) {
    e.preventDefault();
    if (dragged !== this) {
        const parent = this.parentNode;
        if (this.classList.contains("drop-above")) {
            parent.insertBefore(dragged, this);
        } else {
            parent.insertBefore(dragged, this.nextSibling);
        }

        const thisValue = this.getElementsByTagName('td')[0].innerText;//get the order value of the object droped on
        const draggedValue = dragged.getElementsByTagName('td')[0].innerText;//get the order value of the object dropped
        console.log('Dragged: '+ draggedValue +'  Dropped onto: '+thisValue)
        const newValue = `${thisValue[0]}${0}`; //takes the block value of the object droped on

        dragged.getElementsByTagName('td')[0].innerText = newValue// replaces the droped order value with this order value

       holyGrail()
    }
    this.classList.remove("drop-above", "drop-below");
}
function holyGrail(){
    //get the current order row as an array
    let secondColumnValues = [];
    let tableBody = document.getElementById('sessionActivities');

    if (tableBody) {
        let rows = tableBody.getElementsByTagName('tr');
        for (let i = 0; i < rows.length; i++) {
            let cells = rows[i].getElementsByTagName('td');
            if (cells.length > 1) {
                let value = cells[0].textContent.trim(); // Get the text content of the second <td> element
                secondColumnValues.push(value); // Push the value into the array
            }
        }
    }  

    //log data
    console.log('Original order values: '+secondColumnValues)

    normalisedArray = normalizeArray(secondColumnValues) //normalise the array from the table
    console.log('Changed order values: '+normalisedArray)

    orderArray = normalisedArray //set the normalised array to the default array
    orderArray.sort(compareOrders);
    updateOrderOrder()//update the table


}
function dragEndHandler() {
    const all = document.querySelectorAll("#sessionTable tbody tr");
    all.forEach(row => row.classList.remove("drop-above", "drop-below"));

}

document.getElementById('warmUpForm').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addWarmUp();
    }
});

document.getElementById('activityForm').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addActivity();
    }
});

function clearTextboxes() {//clear the textboxes
    document.getElementById('exercise').value = '';
    document.getElementById('rpe').value = '';
    document.getElementById('sets').value = '';
    document.getElementById('reps').value = '';
}
function showAlert(title, message) {
    // Create a custom alert box
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
      <h2>${title}</h2>
      <p>${message}</p>
      <button onclick="document.body.removeChild(this.parentElement)">OK</button>
    `;
    document.body.appendChild(alertBox);
  }

showPage('activityPage');
