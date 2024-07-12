const showLeaderboard = document.getElementById("showLeaderboard");
const leaderboard = document.getElementById("leaderboard");

showLeaderboard.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
        leaderboard.style.display = "block";
        const token = localStorage.getItem('token');

        const response = await axios.get('http://localhost:3000/leaderBoard/showLeaderboard', { headers: { 'Authorization': token } });
        console.log(response);

        const userData = document.getElementById("userDetails");
        response.data.leaderBoardData.forEach((userDetails) => {
            userData.innerHTML += `<li>Name - ${userDetails.name} || Total Expense - ${userDetails.totalExpense}</li>`;
        })

    } catch (error) {
        alert("Error ", error);
    }

});


const downloadReportBtn = document.getElementById("downloadReport");

downloadReportBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/user/download', { headers: { 'Authorization': token } });

        if (response.status === 201) {
            let a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myExpense.csv';
            a.click();
            alert("Report Downloaded Successfully");

        } else {
            alert("Something went wrong  " + response.data.message);
        }

    } catch (error) {
        console.log(error);

    }
});


const downloadHistory = document.getElementById("downloadHistory");
const downloadUrlsSpan = document.getElementById("downloadUrls");
const downloadUrlsDiv = document.getElementById("downloadUrlsDiv");

downloadHistory.addEventListener('click', async (event) => {
    event.preventDefault();

    try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/user/downloadHistory', { headers: { Authorization: token } });

        downloadUrlsSpan.style.display = "block";

        const fileUrls = response.data.history.map(item => item.fileUrl);
        fileUrls.forEach(url => {
            let a = document.createElement("a");
            a.href = url;
            a.textContent = url;
            a.style.display = "block";
            downloadUrlsDiv.appendChild(a);
        });
        //console.log(response);

    } catch (error) {
        alert("Error ", error);
    }
});