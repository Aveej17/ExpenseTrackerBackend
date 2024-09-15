async function handleFormSubmit(event) {  
    try {
        event.preventDefault();
  
        const expenseDetails = {
            amount: event.target.amount.value,
            category: event.target.category.value,
            description: event.target.description.value,
        };

        const token = localStorage.getItem('token');
        

        // Check if token is available
        if (!token) {
            alert("No token found. Please login again.");
            return;
        }
        
        
        // Send POST request to save expense in the database
        let response = await axios.post("http://34.227.178.35:3000/expenses/create", expenseDetails, {headers: {
            Authorization: 'Bearer ' + token}
        });
  
        // Add the new expense details to the list
        addExpenseToList(response.data);
  
        // Clear the form fields
        event.target.amount.value = "";
        // event.target.category.value = "";
        event.target.description.value = "";
    } catch (error) {
        console.error("Error adding expense:", error);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    try {

        const rowsElement = document.getElementById('rows');
        
        const savedLimit = localStorage.getItem('limit');
        if (savedLimit) {
            rowsElement.value = savedLimit; // Restore the previous limit selection
        }
        const token = localStorage.getItem('token');
        let currentPage = 1; // Start with the first page
         
        const limit = rowsElement.value; 

        // Function to get the current limit
        function getLimit() {
            return rowsElement.value; // Fetch the selected value dynamically
        }

        // Event listener for changes in the dropdown
        rowsElement.addEventListener('change', function() {
        const limit = getLimit(); // Update the limit whenever the dropdown changes
        // console.log(limit);
        localStorage.setItem('limit', limit);
        rowsElement.value = limit;
        // Call the function to fetch data or update the UI here using the new limit
        });

        // Initial log to show the default selected value
        // console.log(getLimit());
        

        // Function to fetch and display expenses for a specific page
        const fetchExpenses = async (page) => {
            try {
                let response = await axios.get(`http://34.227.178.35:3000/expenses/get?page=${page}&limit=${limit}`, {
                    headers: { Authorization: 'Bearer ' + token }
                });

                // Clear the existing list
                document.getElementById('expenseList').innerHTML = "";

                // Display each expense on the screen
                if (response.data.expenses.length > 0) {
                    response.data.expenses.forEach(expense => {
                        addExpenseToList(expense);
                    });
                }
                
                // Hiding the buy premium button for the premium user
                if (response.data.isPremium) {
                    document.getElementById('rzp-button').style.display = 'none';
                    document.getElementById('premium-message').style.display = 'block';
                    document.getElementById('show leaderBoard').style.display = 'block';
                    document.getElementById('downloadFile').style.display = 'block';
                }

                // Update pagination display
                updatePagination(response.data.currentPage, response.data.totalPages);
            } catch (error) {
                console.error("Error loading expenses:", error);
            }
        };

        // Function to update pagination buttons
        const updatePagination = (currentPage, totalPages) => {
            const paginationElement = document.getElementById('pagination');
            paginationElement.innerHTML = ""; // Clear existing pagination

            // Create "First" button
            const firstButton = document.createElement('button');
            firstButton.textContent = "First";
            firstButton.disabled = currentPage === 1; // Disable if on the first page
            firstButton.onclick = () => fetchExpenses(1);
            paginationElement.appendChild(firstButton);

            // Create "Previous" button
            const prevButton = document.createElement('button');
            prevButton.textContent = "Previous";
            prevButton.disabled = currentPage === 1; // Disable if on the first page
            prevButton.onclick = () => fetchExpenses(currentPage - 1);
            paginationElement.appendChild(prevButton);

            // Create "Current" page button
            const currentButton = document.createElement('button');
            currentButton.textContent = currentPage;
            currentButton.disabled = true; // Always disabled, represents the current page
            paginationElement.appendChild(currentButton);

            // Create "Next" button
            const nextButton = document.createElement('button');
            nextButton.textContent = "Next";
            nextButton.disabled = currentPage === totalPages; // Disable if on the last page
            nextButton.onclick = () => fetchExpenses(currentPage + 1);
            paginationElement.appendChild(nextButton);

            // Create "Last" button
            const lastButton = document.createElement('button');
            lastButton.textContent = "Last";
            lastButton.disabled = currentPage === totalPages; // Disable if on the last page
            lastButton.onclick = () => fetchExpenses(totalPages);
            paginationElement.appendChild(lastButton);
        };

        // Fetch and display the first page of expenses
        fetchExpenses(currentPage);

    } catch (error) {
        console.error("Error initializing the page:", error);
    }
});


  
// window.addEventListener("DOMContentLoaded", async () => {
//     try {
//         // Fetch existing expenses from the server

//         const token = localStorage.getItem('token');
//         let response = await axios.get("http://localhost:3000/expenses/get", {headers: {
//             Authorization: 'Bearer ' + token}
//         });
        
//         // console.log(response);
//         // console.log(response.data);
        
//         // Display each expense on the screen
//         if(response.data.expenses.length>0){
//             response.data.expenses.forEach(expense => {
//                 addExpenseToList(expense);
//             }
//         );
//         }
//         // Hiding the premium button for the premium user
//         if (response.data.isPremium) {
//             document.getElementById('rzp-button').style.display = 'none';
//             document.getElementById('premium-message').style.display = 'block'; 
//             document.getElementById('show leaderBoard').style.display = 'block'; 
//             document.getElementById('downloadFile').style.display = 'block';
//         }
//     } catch (error) {
//         console.error("Error loading expenses:", error);
//     }
// });

function addExpenseToList(expenseDetails) {
    const listItem = document.createElement('li');

    listItem.textContent = `${expenseDetails.amount} - ${expenseDetails.category} - ${expenseDetails.description}`;

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Expense';

    deleteButton.addEventListener('click', async ()=> {
        try {

            const token = localStorage.getItem('token');

            // Send DELETE request to remove expense from the database
            await axios.delete(`http://34.227.178.35:3000/expenses/delete/${expenseDetails.id}`, {headers: {
            Authorization: 'Bearer ' + token}
        });

            // Remove the expense from the UI
            listItem.remove();
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    });
    listItem.appendChild(deleteButton);

    // Create edit button
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit Expense';

    editButton.addEventListener('click', async ()=> {

        // Remove the expense from the list temporarily
        listItem.remove();
        
        // Populate the form fields with the current expense details for editing
        document.getElementById("amount").value = expenseDetails.amount;
        document.getElementById("description").value = expenseDetails.description;
        document.getElementById("category").value = expenseDetails.category;
        
        const token = localStorage.getItem('token');

        await axios.delete(`http://34.227.178.35:3000/expenses/delete/${expenseDetails.id}`, {headers: {
            Authorization: 'Bearer ' + token}
        });
        
    });
    listItem.appendChild(editButton);

    const ul = document.getElementById('expenseList');
    ul.appendChild(listItem);
}

document.getElementById('rzp-button').onclick = async function (e) {
    e.preventDefault(); // Prevent default form submission or button behavior

    const token = localStorage.getItem('token');

    // Check if token is available
    if (!token) {
        alert("No token found. Please login again.");
        return;
    }

    try {
        // Send request to backend to initiate the premium membership purchase
        const response = await axios.get('http://34.227.178.35:3000/purchase/premiumMembership', {
            headers: {
                Authorization: 'Bearer ' + token
            }
        });

        // Configure the Razorpay options

        var options = {
            key: response.data.key_id, // Razorpay key ID
            order_id: response.data.order.id, // Order ID returned from the server
            handler: async function (response) {
                // Handle the payment success event
                try {
                    // Inform backend of the completed payment
                    await axios.post('http://34.227.178.35:3000/purchase/updateTransactionStatus', {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                        status: 'Completed' // Payment completed successfully
                    }, {
                        headers: {
                            "Authorization": 'Bearer ' + token
                        }
                    });
        
                    alert('You are a premium user now!');
                    document.getElementById('rzp-button').style.display = 'none';
                    document.getElementById('premium-message').style.display = 'block'; 
                    document.getElementById('show leaderBoard').style.display = 'block';
                    document.getElementById('downloadFile').style.display = 'block'; 


                } catch (error) {
                    console.error("Error updating transaction status:", error);
                    alert('Something went wrong while updating the transaction status.');
                }
            },
            modal: {
                ondismiss: async function () {
                    // Handle the payment failure or if the user closes the payment window
                    try {
                        await axios.post('http://34.227.178.35:3000/purchase/updateTransactionStatus', {
                            order_id: options.order_id,
                            status: 'Failed' // Payment failed or dismissed
                        }, {
                            headers: {
                                "Authorization": 'Bearer ' + token
                            }
                        });
        
                        alert('Payment was not completed. Please try again.');
                    } catch (error) {
                        console.error("Error updating transaction status on failure:", error);
                        alert('Something went wrong while updating the failed transaction status.');
                    }
                }
            }
        };
        
        // var options = {
        //     key: response.data.key_id, // Razorpay key ID
        //     order_id: response.data.order.id, // Order ID returned from the server
        //     handler: async function (response) {
        //         // Handle the payment success event
        //         try {
        //             await axios.post('http://localhost:3000/purchase/updateTransactionStatus', {
        //                 order_id: options.order_id,
        //                 payment_id: response.razorpay_payment_id,
        //             }, {
        //                 headers: {
        //                     "Authorization": 'Bearer ' + token
        //                 }
        //             });

        //             alert('You are a premium user now!');
        //         } catch (error) {
        //             console.error("Error updating transaction status:", error);
        //             alert('Something went wrong while updating the transaction status.');
        //         }
        //     }
        // };

        // Open the Razorpay payment form
        const razorpay = new Razorpay(options);
        razorpay.open();

        // Optionally handle if the payment window is closed without completing the payment
        razorpay.on('payment.failed', function (response) {
            alert('Payment failed. Please try again.');
            console.error(response.error);
        });

    } catch (error) {
        console.error("Error initiating purchase:", error);
        alert('Failed to initiate premium membership purchase.');
    }
};


// document.getElementById('rzp-button').onclick = async function(e){
//     const token = localStorage.getItem('token');
//     // console.log(token);
//     // console.log("Sending Backend Call");


//     const response = await axios.get('http://localhost:3000/purchase/premiumMembership',{headers: {
//         Authorization: 'Bearer ' + token}
//     })
//     // console.log(response);

//     var options = {
//         'key':response.data.key_id,
//         'order_id':response.data.order.id,
//         'handler': async function(response){
//             await axios.post('http://localhost:3000/purchase/updateTransactionStatus',{
//                 order_id:options.order_id,
//                 payment_id:response.razorpay_payment_id,},{headers:{"Authorization": token}
//             })
//             alert('You are a premium user now')
//         }
//     }
// }

document.getElementById('show leaderBoard').onclick = async function (e) {

    const token = localStorage.getItem('token');
    const response = await axios.get('http://34.227.178.35:3000/premium/leaderBoard',{headers: {
        Authorization: 'Bearer ' + token}
    });
    // console.log(response.data);

    // console.log(typeof(response.data));
    

    // Check if the leaderboard has data to display
    if (response.data) {
        // Show the leaderboard header
        document.getElementById('leaderBoard').style.display = 'block';
    
        // Get the leaderboard item container
        const leaderBoardItem = document.getElementById('leaderBoardItem');
        
        // Clear any existing items to avoid duplicates
        leaderBoardItem.innerHTML = '';
    
        response.data.forEach(item=>{
            // console.log(item);
            
            const listItem = document.createElement('li');

            listItem.textContent = `Name : ${item.name} - Amount Spent : ${item.totalAmountSpent}`; 
            leaderBoardItem.appendChild(listItem);
            // console.log(item);  
        })
    }
}

document.getElementById("downloadFile").onclick = async (e)=>{
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('No authorization token found. Please log in again.');
            return;
        }

        // Make the GET request with the authorization token
        const response = await axios.get('http://34.227.178.35:3000/expenses/downloadFile', {
            headers: { Authorization: 'Bearer ' + token }
        });

        // This will help us to download the file

        if (response.data && response.data.fileUrl) {
            // Redirect to the file URL to trigger the download
            window.location.href = response.data.fileUrl;
        } else {
            alert('File URL not found in the response.');
        }

    } catch (error) {
        console.error('Error downloading file:', error);
        alert('An error occurred while downloading the file. Please try again.');
    }
}
