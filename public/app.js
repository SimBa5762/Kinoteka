

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
            console.log("Жанри завантажені:", genres);
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
        console.log("Користувач авторизований:", user);

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
        console.log("Завантаження фільмів з параметрами:", url.searchParams.toString());
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
            addCard.onclick = () => {
                window.location.href = '/movie.html';
                renderAddingMoviePage();
            };
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

function renderMoviePage(props) {
    const header = getElementById('header');
    const main = getElementById('main');
    const footer = getElementById('footer');

    const backToMain = createElement('button', 'back-to-main', 'На головну', () => {
        window.location.href = '/';
    });
    const title = createElement('h1', 'title');

    const profile = createElement('button', 'profile', 'Профіль', () => {
        popupProfilePanel();
    });

    if(Admin)
    {
        title.textContent = 'Додавання фільму';
        header.appendChild(backToMain, title, profile);


        const form = createElement('form');
        const inputs = createElement('div', 'inputs');
        const inputName = createElement('input', 'input-name');
        const inputYear = createElement('input', 'input-year');
        const selectgenre= createElement('select', 'select-genre');

        const uploadContainer = createElement('div', 'poster-container');
        const previewPoster = createElement('img', 'poster');
        const fileInput = createElement('input', 'poster-input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

            DbManager.getGenres().forEach(genre => {
                const option = createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                selectgenre.appendChild(option);
            });
        const inputPoster = createElement('input', 'input-poster');
            inputPoster.type = 'file';
            inputPoster.accept = 'image/*';
        const inputDescription = createElement('input', 'input-description');
            inputDescription.type = 'text';

        const save = createElement('button', 'save', 'Зберегти', () => {
            const data = {
                title: inputName.value,
                year: inputYear.value,
                genre_id: selectgenre.value,
                rating: inputRating.value,
                poster_url: inputPoster.value,
                description: inputDescription.value
            };
            DbManager.addMovie(data);
            window.location.href = '/';
        });     

        inputs.append(inputName, inputYear, selectgenre, inputPoster, inputDescription);
        form.append(inputs, save);
        body.append(header, main, footer);
        main.appendChild(backToMain);
        main.appendChild(title);
        main.appendChild(poster);
        main.appendChild(form);
    }
    // else
    // {
    //     body.append(header, main, footer);
    //     main.appendChild(backToMain);
    //     main.appendChild(title);
    //     main.appendChild(poster);
    // }
}

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
}

function closePopupPanel() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.remove(); // Видаляє елемент, якщо він існує
    }
}

function popupProfilePanel() {
    const body = document.getElementById('body');
    const header = document.getElementById('header');
        header.className = 'profile-header';
    const main = document.getElementById('main');
        main.className = 'profile-content';
        
    const popup = document.createElement('div');
        popup.className = 'profile-popup';
        popup.id = 'popup';
    const backgraound = document.createElement('div');
        backgraound.className = 'profile-background'; 
    const closeBtn = document.createElement('div');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
        closePopupPanel();
    }

    const title = document.createElement('h2');
    title.textContent = 'Профіль';

    const inputs = document.createElement('div');
    inputs.className = 'profile-inputs';
    const name = document.createElement('div');
    name.className = 'profile-input';
    const email = document.createElement('div');
    email.className = 'profile-input';
    const password = document.createElement('div');
    password.className = 'profile-input';
    if(isAdmin)
    {

    }

}