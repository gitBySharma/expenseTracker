const showLeaderboard = document.getElementById("showLeaderboard");
const leaderboard = document.getElementById("leaderboard");

showLeaderboard.addEventListener('click', async (event) => {
    event.preventDefault();
    leaderboard.style.display = "block";
    const token = localStorage.getItem('token');

    const response = await axios.get('http://localhost:3000/leaderBoard/showLeaderboard', { headers: { 'Authorization': token } });
    console.log(response);

    const userData = document.getElementById("userDetails");
    response.data.leaderBoardData.forEach((userDetails) => {
        userData.innerHTML += `<li>Name - ${userDetails.name} || Total Expense - ${userDetails.totalExpense}</li>`;
    })

})