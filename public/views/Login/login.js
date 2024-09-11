async function handleFormSubmit(event){

    try{
        event.preventDefault();

        const userDetails = {
            emailId : event.target.email.value,
            password: event.target.password.value
        }
        console.log(userDetails+ "Before reaching Backend");
        

        // const token = localStorage.getItem('token');

        // // Send POST request to save expense in the database
        // let response = await axios.post("http://localhost:3000/users/login", userDetails, {headers:{
        //         Authorization: 'Bearer ' + token}});
        
        // alert("userLoggedin Successfully");
        // window.location.href = "../Expenses/expenses.html";

        // Retrieve the token from localStorage
    

    try {
        // Send POST request to log in the user
        const response = await axios.post("http://44.211.253.232:3000/users/login", userDetails);

        alert("User logged in successfully");
        localStorage.setItem('token', response.data.token);
        window.location.href = "../Expenses/expenses.html"; // Redirect on success
    } catch (error) {
        // Handle error response
        alert("Error logging in: " + (error.response?.data?.message || error.message));
    }
    }
    catch (error) {
        // Log error message
        if (error.response && error.response.status === 400) {
            console.error("Error 400: Bad Request. Check the input data.", error.response.data);
            // Display a user-friendly message
            alert("Login failed: Please check your email and password.");
        } 
        else if(error.response && error.response.status === 404){
            console.error("Error 404: Bad Request. Check the input data.", error.response.data);
            // Display a user-friendly message
            alert("Login failed: User Not Found.");
        }
        else if(error.response && error.response.status === 401){
            console.error("Error 404: Bad Request. Check the input data.", error.response.data);
            // Display a user-friendly message
            alert("Login failed: User not authorized");
        }
        else {
            console.error("An unexpected error occurred:", error);
            alert("An unexpected error occurred. Please try again later.");
        }
    }
}

function forgotpassword() {
    window.location.href = "../ForgotPassword/forgotPassword.html"
}
