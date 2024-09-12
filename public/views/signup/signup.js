async function handleFormSubmit(event){

    try{
        event.preventDefault();

        const userDetails = {
            userName: event.target.username.value,
            emailId : event.target.email.value,
            password: event.target.password.value
        }
        // console.log(userDetails);
        

        // Send POST request to save expense in the database
        let response = await axios.post("http://44.211.253.232:3000/users/signup", userDetails);
        console.log(response);
        alert("User Signed In Successfully");
        window.location.href = '../Login/login.html';
        
        
        
        
    }
    catch (error){
        console.log("Error : "+error); 
    }
}
