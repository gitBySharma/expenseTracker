const signupForm = document.getElementById("signUpForm");

signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const userName = document.getElementById('signUpName');
    const email = document.getElementById('signUpEmail');
    const password = document.getElementById('signUpPassword');

    const userData = {
        name: userName.value,
        email: email.value,
        password: password.value
    };

    //clearing the input fields
    userName.value = "";
    email.value = "";
    password.value = "";

    axios.post('http://localhost:3000/user/signup', userData)
        .then((result) => {
            alert("Signed up successfully");
            //hide sign-up modal
            const signUpModal = new bootstrap.Modal(document.getElementById('signUpModal'));
            signUpModal.hide();
            // Show sign-in modal
            const signInModal = new bootstrap.Modal(document.getElementById('signInModal'));
            signInModal.show();
        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });

});



const loginForm = document.getElementById("signInForm");

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('signInEmail');
    const password = document.getElementById('signInPassword');

    const userData = {
        email: email.value,
        password: password.value
    };

    //clearing the input fields
    email.value = "";
    password.value = "";

    axios.post('http://localhost:3000/user/login', userData)
        .then((result) => {
            alert("User logged in successfully");
            localStorage.setItem("token", result.data.token);
            window.location.href = "expense.html";
        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });
});
