let profileCurrentUser = null;

function openPopupPanel(type)
{


    const body = document.getElementById('body');
    const popup = document.createElement('div');
        popup.className = 'popup';
        popup.id = 'popup';
    const inputs = document.createElement('div');
        inputs.className = 'popup-inputs';
    const email = document.createElement('div');
        email.className = 'popup-email';
    const password = document.createElement('div');
        password.className = 'popup-password';
    const name = document.createElement('div');
        name.className = 'popup-name';
    const btnsContainer = document.createElement('div');
        btnsContainer.className = 'popup-btns-container';
    const btn = document.createElement('button');
        btn.className = 'popup-btn';
    const btn2 = document.createElement('button');
        btn2.className = 'popup-extra-btn';

    if(type == 'login')
    {
        popup.innerHTML = `
            <div class="popup-title">
                <p>Вхід</p>
                <div class="popup-close" onclick="closePopupPanel()">&times;</div>
            </div>
        `;

        email.innerHTML = `
            <label for="loginMail">Email:</label>
            <input type="text" id="loginMail" placeholder="Email">
        `;
        inputs.appendChild(email);


        password.innerHTML = `
            <label for="loginPass">Password:</label>
            <input type="password" id="loginPass" placeholder="Password">
        `;
        inputs.appendChild(password);
        popup.appendChild(inputs);



        btn.textContent = 'Вхід';
        btn.onclick = () => {
            const email = document.getElementById('loginMail').value;
            const password = document.getElementById('loginPass').value;

            fetch('/api/users/login',
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                })
                .then(res => res.json())
                .then(data => {
                    if(data)
                    {
                        closePopupPanel();
                        if(data.message == 'Login successful') location.reload();
                        else if(data.message == 'User not found') alert('User not found! Please register');
                        else if(data.message == 'Wrong password') alert('Wrong password! Try again');
                    }else {
                        alert(data.error);
                    }
                });
        }

        btn2.textContent = 'Реєстрація';
        btn2.onclick = () => {
            closePopupPanel();
            openPopupPanel('register');
        }
        btnsContainer.appendChild(btn2);
        btnsContainer.appendChild(btn);
        popup.appendChild(btnsContainer);
        body.appendChild(popup);
    }
    else if(type == 'register')
    {
        popup.innerHTML = `
            <div class="popup-title">
                <p> Реєстрація </p>
                <div class="popup-close" onclick="closePopupPanel()">&times;</div>
            </div>
        `;

        name.innerHTML = `
            <label for="registerName">User name:</label>
            <input type="text" id="registerName" placeholder="Name">
        `;
        inputs.appendChild(name);

        email.innerHTML = `
            <label for="registerMail">Email:</label>
            <input type="text" id="registerMail" placeholder="Email">
        `;
        inputs.appendChild(email);

        password.innerHTML = `
            <label for="registerPass">Password:</label>
            <input type="password" id="registerPass" placeholder="Password">
        `;
        inputs.appendChild(password);

        popup.appendChild(inputs);


        btn.textContent = 'Реєстрація';
        btn.onclick = () => {
            fetch('/api/users/register',
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: document.getElementById('registerName').value,
                        email: document.getElementById('registerMail').value,
                        password: document.getElementById('registerPass').value
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if(data)
                    {
                        if(data.message == 'Registration successful')
                            {
                                alert('Registration successful! Please login');
                                closePopupPanel();
                                openPopupPanel('login');
                            }
                        else if(data.message == 'User already exists') alert('User already exists! Please login');
                    }else {
                        alert(data.error);
                    }
                });
        }
        btn2.textContent = 'Вхід';
        btn2.onclick = () => {
            closePopupPanel();
            openPopupPanel('login');
        }
        btnsContainer.appendChild(btn2);
        btnsContainer.appendChild(btn);
        popup.appendChild(btnsContainer);
        body.appendChild(popup);
    }

    else if(type == 'addAdmin')
    {
        popup.innerHTML = `
            <div class="popup-title">
                <p> Додати адміністратора </p>
                <div class="popup-close" onclick="closePopupPanel()">&times;</div>
            </div>
        `;

        name.innerHTML = `
            <label for="adminName">User name:</label>
            <input type="text" id="adminName" placeholder="Name">
        `;
        inputs.appendChild(name);

        email.innerHTML = `
            <label for="adminMail">Email:</label>
            <input type="text" id="adminMail" placeholder="Email">
        `;
        inputs.appendChild(email);

        password.innerHTML = `
            <label for="adminPass">Password:</label>
            <input type="password" id="adminPass" placeholder="Password">
        `;
        inputs.appendChild(password);

        popup.appendChild(inputs);


        btn.textContent = 'Додати';
        btn.onclick = () => {
            fetch('/api/users/add-admin',
                {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: document.getElementById('adminName').value,
                        email: document.getElementById('adminMail').value,
                        password: document.getElementById('adminPass').value
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if(data)
                    {
                        if(data.message == 'Адміністратора успішно створено')
                            {
                                alert('Адміністратора успішно створено');
                                closePopupPanel();
                            }
                        else if(data.message == 'Користувач вже існує!') alert('Користувач вже існує!');
                    }else {
                        alert(data.error);
                    }
                })
                .catch(err => {
                    alert('Помилка: ' + err.message);
                });
        }
        btnsContainer.appendChild(btn);
        popup.appendChild(btnsContainer);
        body.appendChild(popup);
    }
}

function closePopupPanel() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove(); // Видаляє елемент, якщо він існує
    }
}

function handleProfileClick() {
    fetch('/api/users/profile')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Not logged in');
        })
        .then(user => {
            profileCurrentUser = user;
            popupProfilePanel(user);
        })
        .catch(err => {
            console.log("Користувач не авторизований, відкриваємо вхід");
            openPopupPanel('login');
        });
}

function popupProfilePanel(user) {
    const body = document.getElementById('body');
    const overlay = document.getElementById('overlay');
    const profilePanel = document.getElementById('profilePanel');

    // Заполняем данные пользователя
    document.getElementById('profileName').value = user.userName;
    document.getElementById('profileEmail').value = user.userMail;
    document.getElementById('profilePassword').value = '';

    // Додаємо кнопку для власника
    const panelBody = profilePanel.querySelector('.panel-body');
    const existingBtn = document.getElementById('add-admin-btn');

    if (panelBody && user?.role === 'owner' && !existingBtn) {
        const addAdminBtn = document.createElement('button');
        addAdminBtn.id = 'add-admin-btn';
        addAdminBtn.className = 'btn-add-admin btn-full';
        addAdminBtn.textContent = 'Додати адміністратора';
        addAdminBtn.onclick = addAdmin;
        panelBody.appendChild(addAdminBtn);
    }

    // Показываем панель
    overlay.classList.add('open');
    profilePanel.classList.add('open');
}

function toggleProfilePanel() {
    const overlay = document.getElementById('overlay');
    const profilePanel = document.getElementById('profilePanel');

    const panelBody = profilePanel.querySelector('.panel-body');
    const existingBtn = document.getElementById('add-admin-btn');


    // Додаємо кнопку тільки для власника
    if (panelBody && profileCurrentUser?.role === 'owner' && !existingBtn) {
        const addAdminBtn = document.createElement('button');
        addAdminBtn.id = 'add-admin-btn';
        addAdminBtn.className = 'btn-add-admin btn-full';
        addAdminBtn.textContent = 'Додати адміністратора';
        addAdminBtn.onclick = addAdmin;
        panelBody.appendChild(addAdminBtn);
    }
    else if (panelBody && profileCurrentUser?.role !== 'owner' && existingBtn) {
        existingBtn.remove();
    }

    overlay.classList.toggle('open');
    profilePanel.classList.toggle('open');
}

function logout() {
    fetch('/api/users/logout', { method: 'GET' })
        .then(() => {
            toggleProfilePanel();
            location.reload();
        });
}

function deleteAccount() {
    if (confirm('Ви впевнені, що хочете видалити свій акаунт? Ця дія незворотня.')) {
        fetch('/api/users/delete-account', { method: 'DELETE' })
            .then(() => {
                toggleProfilePanel();
                location.reload();
            });
    }
}

// Обработчик формы обновления профиля
document.addEventListener('DOMContentLoaded', () => {
    const updateProfileForm = document.getElementById('updateProfileForm');
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('profileName').value;
            const password = document.getElementById('profilePassword').value;

            const data = { name };
            if (password) {
                data.password = password;
            }

            fetch('/api/users/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Profile updated successfully') {
                    alert('Профіль успішно оновлено!');
                    location.reload();
                } else {
                    alert('Помилка оновлення: ' + (data.error || data.message));
                }
            })
            .catch(err => {
                alert('Помилка: ' + err.message);
            });
        });
    }
});

function addAdmin() {
    console.log('addAdmin');
    openPopupPanel('addAdmin');
}

