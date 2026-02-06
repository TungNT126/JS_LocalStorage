var userTableBody = document.querySelector(".user-table-body");
var userUpdateId = null;

function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    return localStorage.setItem("users", JSON.stringify(users));
}

let users = [];

async function dataInitialization() {
    try {
        const getUsers = localStorage.getItem("users");
        if (!getUsers) {
            const res = await fetch("https://jsonplaceholder.typicode.com/users");
            users = await res.json();

            // localStorage.setItem("users", JSON.stringify(data));

            readData(users);
        }
    }
    catch (error){
        console.error("Fetch failed: ", error);
    }

    // Init function
    // createAndUpdateUser();
    // deleteUser();
    changeUpdateForm();
    // searchUser();
    // resetData();

    getUserById();
    addAndUpdateUserApi();
    deleteUserApi();
}

function readData(users) {
    const totalUser = document.querySelector(".total-user");

    totalUser.textContent = `Total users: ${users.length}`;

    // Reset bảng cũ
    userTableBody.innerHTML = "";

    // Duyệt qua từng user trong data
    users.forEach(({id, name, email, phone}) => {
        // Tạo row mới
        const tr = document.createElement("tr");

        // Đổi màu row nếu id là số lẻ
        if (id % 2 !== 0) {
            tr.classList.add("odd-row");
        }

        // Thêm nội dung cho row mới
        tr.innerHTML = `
            <td>${id}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td><button class="view_user" data-id="${id}">Xem</button></td>   
            <td><button class="update_user" data-id="${id}">Sửa</button></td>   
            <td><button class="delete_user" data-id="${id}">Xóa</button></td>   
        `;
        
        // Thêm row mới vào bảng
        userTableBody.appendChild(tr);
    })
}

function getUserById() {
    userTableBody.addEventListener("click", async function(e) {
        e.preventDefault();
        if(!e.target.classList.contains("view_user")) return;
        else {
            const userId = e.target.getAttribute("data-id");
            if(!userId) return;
            else {
                try {
                    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
                    const data = await res.json();
    
                    console.log(data);
                }
                catch (error) {
                    console.log("ERROR:", error);
                }
            }
        }
    })
}

function addAndUpdateUserApi() {   
    document.querySelector(".form-user").addEventListener("submit", async function(e) {
        e.preventDefault();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        const phoneRegex = /^\d{10,11}$/;

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        if (!name || !email) {
            return alert("Vui lòng nhập đầy đủ dữ liệu!");
        }
        if (!emailRegex.test(email)) {
            return alert("Sai dinh dang email")
        }
        if (!phoneRegex.test(phone)) {
            return alert("Sai dinh dang sdt")
        } 

        // Update user
        if (userUpdateId !== null) {
            try {
               const updateUser = await updateUserApi(userUpdateId, {
                    name,
                    email,
                    phone
               });
               
               users = users.map(user => 
                    user.id === userUpdateId ? {...user, ...updateUser } : user
               );

               userUpdateId = null;
               this.reset();
               document.getElementById("submit-btn").textContent = "Thêm nhân viên";
            }
            catch (error) {
                console.log("ERROR:", error);
            }
        }
        // Create user
        else {
            let isDuplicate = users.some(user => user.email === email);
            if (isDuplicate) {
                alert("Email đã tồn tại!");
            }
    
            if(!isDuplicate) {
                try {
                    const res = await fetch(`https://jsonplaceholder.typicode.com/users`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id: users.length ? users[users.length-1] + 1 : 1,
                            name,
                            email,
                            phone
                        })
                    });

                    const newUser = await res.json();
                    users.push(newUser);
                }   
                catch (error) {
                    console.log("ERROR:", error);
                }           
            }
        }
        readData(users);
    })
}

async function updateUserApi(userId, data) {
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    
    return await res.json();
}

function deleteUserApi() {
    userTableBody.addEventListener("click", async function (e) {
        e.preventDefault();
        if(!e.target.classList.contains("delete_user")) return;
        else {
            const userId = Number(e.target.getAttribute("data-id"));
            if (!confirm("Bạn có chắc muốn xóa user này?")) return;
            
            try {
                users = users.filter(user => user.id !== userId);
                readData(users);

                const res = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`, {
                    method: "DELETE"
                });
            }    
            catch (error) {
                console.log("ERROR:", error);
            }
        }

    })
}

function resetDataApi() {
    
}


/* ===================================================================================================== */

function createAndUpdateUser() {
    document.querySelector(".form-user").addEventListener("submit", async function(e) {
        e.preventDefault();

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        let users = getUsers();

        if (!name || !email) {
            return alert("Vui lòng nhập đầy đủ dữ liệu!");
        }
        // if (!emailRegex.test(email)) {
        //     return alert("Sai dinh dang email")
        // }
        if (!phoneRegex.test(phone)) {
            return alert("Sai dinh dang sdt")
        } 

        // Update user
        if (userUpdateId !== null) {
            users = users.map((user) => user.id === userUpdateId ? { ...user, name, email, phone } : user);

            userUpdateId = null;
            document.getElementById("submit-btn").textContent = "Thêm nhân viên";
        }
        // Create user
        else {
            let isDuplicate = users.some(user => user.email === email);
            if (isDuplicate) {
                alert("Email đã tồn tại!");
            }
    
            if(!isDuplicate) {
                const newUser ={
                    id: users.length ? users[users.length - 1].id + 1 : 1,
                    name,
                    email,
                    phone

                }              
                users.push(newUser);
            }
        }
        saveUsers(users)
        readData(users);
        this.reset();
    })
}

function deleteUser() {
    userTableBody.addEventListener("click", function(e) {
        const userData = JSON.parse(localStorage.getItem("users")) || [];
        if(!e.target.classList.contains("delete_user")) return;
        else {
            console.log("confirm called");
    
            const userId = Number(e.target.getAttribute("data-id"));
    
            if(!confirm("Bạn chắc chắn muốn xóa?")) {
                console.log("Hủy xóa");
                return;
            }
    
            const newUsers = userData.filter(user => user.id !== userId);
            localStorage.setItem("users", JSON.stringify(newUsers));
            readData(newUsers);
        }
    })
}

function changeUpdateForm() {
    userTableBody.addEventListener("click", function(e) {
        if(!e.target.classList.contains("update_user")) return;
        else {
            const userId = Number(e.target.getAttribute("data-id"));
            userUpdateId = userId;
            const user = users.find(u => u.id === userUpdateId);

            if(user) {
                document.getElementById("name").value = user.name;
                document.getElementById("email").value = user.email;
                document.getElementById("phone").value = user.phone;

                document.getElementById("submit-btn").textContent = "Cập nhật"
            }
        }
    })
}

function searchUser() {
    const searchInput = document.getElementById("search-input");

    searchInput.addEventListener("input", function() {
        const keyword = this.value.toLowerCase().trim();

        const users = getUsers();

        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(keyword) ||
            user.phone.toLowerCase().includes(keyword)
        )

        readData(filteredUsers);
    })
    
}

function resetData() {
    const resetBtn = document.getElementById("reset-data");
    resetBtn.addEventListener("click", async function(e) {
        e.preventDefault();
        localStorage.removeItem("users");

        try {
            const res = await fetch(`https://jsonplaceholder.typicode.com/users`);
            const data = await res.json();

            localStorage.setItem("users", JSON.stringify(data));
            
            readData(getUsers());
            console.log("reset data");
        }
        catch (error) {
            console.log("Failed to reset data!", error);
        }
    })
}

async function init() {
    await dataInitialization();
    // readData(getUsers());
}

init();
 