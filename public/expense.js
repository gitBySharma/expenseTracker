//const Razorpay = require("razorpay");

const submitButton = document.getElementById("expenseForm");
const listToShow = document.querySelector('.list');
const expense = document.getElementById('expenseAmount');
const category = document.querySelector('.chooseCategory');
const description = document.getElementById('expenseDescription');


//handling the add expense event
submitButton.addEventListener("submit", function (event) {
    event.preventDefault();

    const storeData = {
        expenseAmount: expense.value,
        expenseCategory: category.value,
        expenseDescription: description.value
    }

    //sending a post request to the backend
    const token = localStorage.getItem('token');
    axios.post("http://localhost:3000/expense/addExpense", storeData, { headers: { "Authorization": token } })
        .then((result) => {
            console.log(result);
            displayDetails(result.data.expenseDetails);
        })
        .catch((error) => {
            console.log(error);
        });

    //clearing the input fields
    expense.value = "";
    category.value = "";
    description.value = "";
});

//function to display details on dashboard
function displayDetails(storeData) {
    const newDetails = document.createElement("li");
    newDetails.dataset.id = storeData.id; // Adding id to the li element
    //console.log('Displaying item with id:', storeData.id);

    //adding the entered details to an unordered list and displaying it on DOM
    let amount = document.createElement('span');
    amount.innerText = storeData.expenseAmount;
    newDetails.appendChild(amount);
    newDetails.appendChild(document.createTextNode(" - "));


    let categoryValue = document.createElement('span');
    categoryValue.innerText = storeData.expenseCategory;
    newDetails.appendChild(categoryValue);
    newDetails.appendChild(document.createTextNode(" - "));


    let descriptionValue = document.createElement('span');
    descriptionValue.innerText = storeData.expenseDescription;
    newDetails.appendChild(descriptionValue);
    newDetails.appendChild(document.createTextNode("   "));


    //creating two buttons and appending them on the list and displaying on DOM
    const deleteBtn = document.createElement('button');
    const editBtn = document.createElement('button');
    deleteBtn.appendChild(document.createTextNode("Delete Expense"));
    editBtn.appendChild(document.createTextNode("Edit Expense"));
    newDetails.appendChild(deleteBtn);
    newDetails.appendChild(document.createTextNode("   "));
    newDetails.appendChild(editBtn);
    deleteBtn.setAttribute('class', "delete_btn btn btn-outline-danger btn-sm");
    editBtn.setAttribute('class', "edit_btn btn btn-outline-info btn-sm");

    listToShow.appendChild(newDetails);
}

//handling the delete event
listToShow.addEventListener("click", function (event) {
    event.preventDefault();
    if (event.target.classList.contains('delete_btn')) {
        deleteExpense(event.target);
    }
});

//handling the edit event
listToShow.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target.classList.contains('edit_btn')) {
        editExpense(event.target);
    }
})

//function to delete data from DOM and local storage
function deleteExpense(deleteButton) {
    const listItem = deleteButton.closest("li");
    const id = listItem.dataset.id;  //getting the id of the expense to be deleted

    const token = localStorage.getItem("token");
    axios.delete(`http://localhost:3000/expense/deleteExpense/${id}`, { headers: { "Authorization": token } })
        .then((result) => {
            console.log(result);
            listToShow.removeChild(listItem);
        }).catch(error => {
            console.log(error);
        });
}

//function to edit data whenever any wrong entry is entered
function editExpense(editData) {
    const listItem = editData.closest('li');
    const id = listItem.dataset.id;   //getting the id of the expense to be edited

    //repopulating input fields
    const spans = listItem.querySelectorAll('span');
    expense.value = spans[0].innerText;
    category.value = spans[1].innerText;
    description.value = spans[2].innerText;

    listToShow.removeChild(listItem);

    //creating a save button to save the data after editing
    const saveBtn = document.createElement("button");
    saveBtn.innerText = "Save";
    saveBtn.className = "btn btn-outline-success btn-sm";  //used bootstrap
    submitButton.appendChild(saveBtn);

    //save button functionality
    saveBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const token = localStorage.getItem("token");
        axios.put(`http://localhost:3000/expense/editExpense/${id}`, {
            expenseAmount: expense.value,
            expenseCategory: category.value,
            expenseDescription: description.value
        }, { headers: { "Authorization": token } })
            .then((result) => {
                console.log(result);
                submitButton.removeChild(saveBtn);
                displayDetails(result.data.updatedExpense);

                //clearing the input  fields
                expense.value = "";
                category.value = "";
                description.value = "";

            }).catch(err => {
                console.log(err);
            })
    });
}

//function to display data on dashboard on page reload
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:3000/expense/getExpense", { headers: { "Authorization": token } })
        .then((result) => {
            console.log(result);
            if (result.data.expenseDetails) {
                result.data.expenseDetails.forEach(expense => {
                    displayDetails(expense);
                })
            } else {
                console.log("No data found");
            }

            const isPremiumUser = result.data.isPremiumUser;
            handlePremiumButton(isPremiumUser);
        })
        .catch((error) => {
            console.log(error);
        });

});

//handling the buy premium button - to display only for non premium users
function handlePremiumButton(isPremiumUser){
    const premiumButton  = document.getElementById("rzp-button1");
    if(isPremiumUser){
        premiumButton.style.display = "none";

    } else {
        premiumButton.style.display = "block";
        
    }
}


//handling the premium membership feature
document.getElementById('rzp-button1').onclick = async function (event) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    const response = await axios.get('http://localhost:3000/purchase/premiumMembership', { headers: { 'Authorization': token } });
    console.log(response);

    var options = {
        "key": response.data.key_id, // Enter the Key ID generated from the Dashboard
        "order_id": response.data.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1

        "handler": async function (response) {
            await axios.post('http://localhost:3000/purchase/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id,
            }, { headers: { 'Authorization': token } })


            alert("You are a premium user now");
        }
    };

    const rzp1 = new Razorpay(options);

    rzp1.on('payment.failed', async function (response) {
        console.log(response);
        if (response.error) {
            alert("Something went wrong");
            await axios.post('http://localhost:3000/purchase/updateTransactionStatus', {
                order_id: options.order_id,
                payment_id: "payment_failed",
            }, { headers: { 'Authorization': token } });   
        }
    });

    rzp1.open();
}
