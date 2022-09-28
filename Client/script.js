var Username = "";
var Password = "";

async function LogIn(){
    Username = document.getElementById("UsernameInput").value || "";
    Password = document.getElementById("PasswordInput").value || "";
    if((Username == "") || (Password == "")){
        window.alert("You have to input a username and a password");
    }else{
        Password = await hashValue(Password);
        var response = await fetch('/LogIn', {
            method: "POST",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({Username: Username, Password: Password})
        });
        if(response.status == 200){
            var responseData = await response.json();
            document.getElementById("MainContainer").innerHTML = `
            <div class="add-password-container">
                <input class="add-input" id="WebsiteInput" type="text" placeholder="Website name">
                <input class="add-input" id="UsernameInput" type="text" placeholder="Username">
                <input class="add-input" id="PasswordInput" type="password" placeholder="Password">
                <div class="AddBtnContainer">
                    <button id="AddBtn">+Add</button>
                </div>
            </div>`;
            for(var i=0; i<responseData.length; i++){
                var Card = document.createElement('div');
                Card.className = "Card";
                Card.innerHTML = `
                <div class="card-input-container">
                    <p>Website :</p>
                    <input type="text" class="card-input" value="${responseData[i].website}">
                </div>
                <div class="card-input-container">
                    <p>Username :</p>
                    <input type="text" class="card-input" value="${responseData[i].username}">
                </div>
                <div class="card-input-container">
                    <p>Password :</p>
                    <input type="password" class="card-input" value="${responseData[i].password}">
                </div>
                <div class="card-actions">
                    <div class="delete-action-container">
                        <button onclick="DeleteCard('${responseData[i].id}', this)">Delete</button>
                    </div>
                    <div class="save-action-container">
                        <button onclick="UpdateCard('${responseData[i].id}', this)">Save</button>
                    </div>
                </div>`;
                document.getElementById("MainContainer").appendChild(Card);
            }
            document.getElementById("AddBtn").addEventListener('click', function(e){
                e.stopImmediatePropagation();
                AddPassword();
            });
        }else if(response.status == 403){
            window.alert("The password is wrong");
        }else if(response.status == 500){
            window.alert("An error occured in the servers. Please try again later.")
        }
    }
}

async function AddPassword(){
    var CardWebsite = document.getElementById("WebsiteInput").value;
    var CardUsername = document.getElementById("UsernameInput").value;
    var CardPassword = document.getElementById("PasswordInput").value;
    if(CardWebsite == ""){
        window.alert("You have to enter a website to add a new password");
    }else if(CardUsername == ""){
        window.alert("You have to enter a username to add a new password");
    }else if(CardPassword == ""){
        window.alert("You have to enter a password to add a new password");
    }else{
        var response = await fetch('/NewPassword', {
            method: "POST",
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify({GlobalUsername: Username, GlobalPassword: Password, Website: CardWebsite, Username: CardUsername, Password: CardPassword})
        });
        if(response.status == 200){
            var responseData = await response.json();
            var Card = document.createElement('div');
            Card.className = "Card";
            Card.innerHTML = `
            <div class="card-input-container">
                <p>Website :</p>
                <input type="text" class="card-input" value="${CardWebsite}">
            </div>
            <div class="card-input-container">
                <p>Username :</p>
                <input type="text" class="card-input" value="${CardUsername}">
            </div>
            <div class="card-input-container">
                <p>Password :</p>
                <input type="password" class="card-input" value="${CardPassword}">
            </div>
            <div class="card-actions">
                <div class="delete-action-container">
                    <button onclick="DeleteCard('${responseData.id}', this)">Delete</button>
                </div>
                <div class="save-action-container">
                    <button onclick="UpdateCard('${responseData.id}', this)">Save</button>
                </div>
            </div>`;
            document.getElementById("MainContainer").appendChild(Card);
        }else if(response.status == 403){
            window.location = "/";
        }else if(response.status == 500){
            window.alert("An error occured in the servers. Please try again later.")
        }
    }
}
async function DeleteCard(CardId, DeleteBtn){
    var response = await fetch('/DeletePassword', {
        method: "DELETE",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({GlobalUsername: Username, GlobalPassword: Password, CardId: CardId})
    });
    if(response.status == 200){
        var Card = DeleteBtn.parentElement.parentElement.parentElement;
        Card.style.opacity = '0';
        window.setTimeout(
            function removethis(){
                Card.style.display='none';
            }, 300);
    }
}
async function UpdateCard(CardId, SaveBtn){
    var Card = SaveBtn.parentElement.parentElement.parentElement;
    var CardWebsite = Card.children[0].lastElementChild.value;
    var CardUsername = Card.children[1].lastElementChild.value;
    var CardPassword = Card.children[2].lastElementChild.value;
    var response = await fetch('/UpdatePassword', {
        method: "PUT",
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({GlobalUsername: Username, GlobalPassword: Password, CardId: CardId, Website: CardWebsite, Username: CardUsername, Password: CardPassword})
    });
    console.log(response.status);
}

document.getElementById("LoginBtn").addEventListener('click', function(e){
    e.stopImmediatePropagation();
    LogIn();
});
async function hashValue(variable){
    var varUint8 = new TextEncoder().encode(variable);
    var hashBuffer = await crypto.subtle.digest('SHA-256', varUint8);
    var hashArray = Array.from(new Uint8Array(hashBuffer));
    var hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return(hashHex);
}