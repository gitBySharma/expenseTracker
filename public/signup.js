const signUpBtn = document.getElementById("signup");
const signupForm = document.getElementById("signupForm");

const userName = document.getElementById("userName");
const email = document.getElementById("email");
const password = document.getElementById("password");


signupForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!userName.value || !email.value || !password.value) {
        alert("Please fill in all the required fields");
        return;
    }

    const userData = {
        name: userName.value,
        email: email.value,
        password: password.value
    };


    axios.post('http://localhost:3000/user/signup', userData)
        .then((result) => {
            console.log(result);
            alert("User created successfully");
        }).catch((err) => {
            console.log(err);
            if (err.response.data.error) {
                alert(err.response.data.error);
            }
        });
});