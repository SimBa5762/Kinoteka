let currentUser = null;
let isAdmin = false;

//завантажити постери для фільмів
//зробити меню додавання фільму
//видалення фільму
//при відкритті сторінки фільму, вивести інформацію про нього і щоб було можливо редагувати
//на тсорінці фільму можливість залишати коментарі
//редагувати свій коментар
//виділяти свій коментар
//на головній якщо увійшов в акаунт переглядати свою інформацію(вспливаюче віконце)
//виходити з акаунта, і видаляти свій акаунт
//більш приваблививй інтерфейс

document.addEventListener('DOMContentLoaded', () => {
    const moviesGrid = document.getElementById('moviesGrid');
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const sortSelect = document.getElementById('sortSelect');

    const userControls = document.getElementById('user-controls');

    // 1. Завантаження жанрів
    fetch('/api/genres')
        .then(res => res.json())
        .then(genres => {
            genres.forEach(g => {
                genreFilter.innerHTML += `<option value="${g.id}">${g.name}</option>`;
            });
        });
    
    fetch('/api/users/profile')
    .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not logged in');
    })
    .then(user => {
        currentUser = user;
        // Перевіряємо роль (якщо ти зберіг її в сесії як 'admin' або 'owner')
        isAdmin = (user.role === 'admin' || user.role === 'owner');
        
        // Оновлюємо інтерфейс: ховаємо кнопки входу, показуємо кнопку профілю
        userControls.innerHTML = `
            <button class="btn-profile" onclick="popupProfilePanel()">👤 ${user.userName}</button>
        `;
        
        // Перезавантажуємо фільми, щоб з'явилася кнопка "+" для адміна
        loadMovies();
    })
    .catch(err => {
        console.log("Користувач не авторизований");
        userControls.innerHTML = `
            <button class="login" onclick="
                closePopupPanel();
                openPopupPanel('login')">Вхід</button>/
            <button class="registration" onclick="
                closePopupPanel(); 
                openPopupPanel('register')">Реєстрація</button>
        `;

        loadMovies(); // Все одно вантажимо фільми як гість
    });
    // 2. Головна функція завантаження фільмів
    function loadMovies() {
        // Формуємо URL з параметрами пошуку
        const url = new URL('/api/movies', window.location.origin);
        if (searchInput.value) url.searchParams.append('search', searchInput.value);
        if (genreFilter.value) url.searchParams.append('genre', genreFilter.value);
        if (sortSelect.value) url.searchParams.append('sort', sortSelect.value);

        fetch(url)
            .then(res => res.json())
            .then(movies => renderMovies(movies));
    }

    // 3. Відображення карток
    function renderMovies(movies) {

            if (!Array.isArray(movies)) {
            console.error("Очікувався масив, а прийшло:", movies);
            moviesGrid.innerHTML = '<p>Помилка завантаження фільмів.</p>';
            return;
        }
    
        moviesGrid.innerHTML = ''; // Очищаємо сітку

        // Якщо Адмін - малюємо першу сіру картку з "+"
        if (isAdmin) {
            const addCard = document.createElement('div');
            addCard.className = 'movie-card admin-add-card';
            addCard.innerHTML = `<span>+</span>`;
            addCard.onclick = () => alert('Тут буде форма додавання (POST /api/movies)');
            moviesGrid.appendChild(addCard);
        }

        // Малюємо фільми
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.innerHTML = `
                <img src="${movie.poster_url || 'https://via.placeholder.com/200x300'}" alt="Постер">
                <h3>${movie.title} (${movie.year})</h3>
                <p>Рейтинг: ⭐ ${movie.rating.toFixed(1)}</p>
                <a href="/movie.html?id=${movie.id}">Детальніше</a>
            `;

            // Якщо Адмін - додаємо кнопку видалення
            if (isAdmin) {
                const delBtn = document.createElement('button');
                delBtn.textContent = '🗑 Видалити';
                delBtn.onclick = () => deleteMovie(movie.id);
                card.appendChild(delBtn);
            }

            moviesGrid.appendChild(card);
        });
    }

    // 4. Логіка видалення
    function deleteMovie(id) {
        if (confirm('Точно видалити фільм?')) {
            fetch(`/api/movies/${id}`, { method: 'DELETE' })
                .then(() => loadMovies()); // Перезавантажуємо список
        }
    }

    // Слухачі подій для фільтрів (Live-оновлення)
    searchInput.addEventListener('input', loadMovies);
    genreFilter.addEventListener('change', loadMovies);
    sortSelect.addEventListener('change', loadMovies);

    // Перше завантаження
    loadMovies();
});


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
                <div class="popup-close" onclick="closePopupPanel()">&times;</div>
                <div>
                    <h2>Вхід</h2>
                    <p>Введіть email та пароль</p>
                </div>
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
                <div class="popup-close" onclick="closePopupPanel()">&times;</div>
                <div>
                     <h2>Реєстрація</h2>
                     <p>Введіть email та пароль</p>
                </div>
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
}

function closePopupPanel() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove(); // Видаляє елемент, якщо він існує
    }
}