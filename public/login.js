const loginBtn = document.getElementById("login");
const loginForm = document.getElementById("loginForm");

const email = document.getElementById("email");
const password = document.getElementById("password");


loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!email.value || !password.value) {
        alert("Please fill in all the required fields");
        return;
    }

    const userData = {
        email: email.value,
        password: password.value
    };

    //clearing the input fields
    email.value = "";
    password.value = "";

    axios.post('http://localhost:3000/user/login', userData)
        .then((result) => {
            console.log(result);
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


const forgotPasswordBtn = document.getElementById("forgotPassword");
forgotPasswordBtn.addEventListener('click', (event) => {
    event.preventDefault();
    window.location.href = "forgotPassword.html";
})