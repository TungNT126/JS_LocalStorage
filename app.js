var userTableBody = document.querySelector(".user-table-body");
var userUpdateId = null;

function getUsers() {
    return JSON.parse(localStorage.getItem("users"));
}

function saveUsers(users) {
    return localStorage.setItem("users", JSON.stringify(users));
}

async function dataInitialization() {
    try {
        const getUsers = localStorage.getItem("users");
        if (!getUsers) {
            const res = await fetch("https://jsonplaceholder.typicode.com/users");
            const data = await res.json();

            localStorage.setItem("users", JSON.stringify(data));
        }
    }
    catch (error){
        console.error("Fetch failed: ", error);
    }

    // Init function
    createAndUpdateUser();
    deleteUser();
    updateUser();
    searchUser();
    resetData();
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
            <button class="update_user" data-id="${id}">Sửa</button>   
            <button class="delete_user" data-id="${id}">Xóa</button>   
        `;

        // Thêm row mới vào bảng
        userTableBody.appendChild(tr);
    })
}
 
function createAndUpdateUser() {
    document.querySelector(".form-user").addEventListener("submit", function(e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();

        let users = getUsers();

        if (!name || !email) {
            alert("Vui lòng nhập đầy đủ dữ liệu!");
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
    
            if(name && email && !isDuplicate) {
                const newUser = {
                    id: users.length ? users[users.length - 1].id + 1 : 1,
                    name,
                    email,
                    phone
                };
                
                users.push(newUser);
            }
        }
        saveUsers(users)
        readData(users);
        this.reset();
    })
}

function deleteUser() {
    const userData = JSON.parse(localStorage.getItem("users")) || [];
    userTableBody.addEventListener("click", function(e) {
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

function updateUser() {
    userTableBody.addEventListener("click", function(e) {
        if(!e.target.classList.contains("update_user")) return;
        else {
            const users = JSON.parse(localStorage.getItem("users"));
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

function init() {
    dataInitialization();
    readData(getUsers());
}

init();
 