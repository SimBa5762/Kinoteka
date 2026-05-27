let currentUser = null;
let isAdmin = false; // isAdmin використовується тільки в movie.js
let currentPage = 1;
let totalPages = 1;
let totalMovies = 0;

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
        
        // Оновлюємо інтерфейс: показуємо кнопку профілю з іменем користувача
        userControls.innerHTML = `
            <button class="btn-profile" onclick="handleProfileClick()">👤 ${user.userName}</button>
        `;
        
        // Перезавантажуємо фільми, щоб з'явилася кнопка "+" для адміна
        loadMovies();
        console.log("Користувач авторизований:", user);

    })
    .catch(err => {
        console.log("Користувач не авторизований");
        // Завжди показуємо тільки кнопку "Профіль"
        userControls.innerHTML = `
            <button class="btn-profile" onclick="handleProfileClick()">👤 Профіль</button>
        `;

        loadMovies(); // Все одно вантажимо фільми як гість
    });
    // 2. Головна функція завантаження фільмів
    function loadMovies(page = 1) {
        // Формуємо URL з параметрами пошуку
        const url = new URL('/api/movies', window.location.origin);
        if (searchInput.value) url.searchParams.append('search', searchInput.value);
        if (genreFilter.value) url.searchParams.append('genre', genreFilter.value);
        if (sortSelect.value) url.searchParams.append('sort', sortSelect.value);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', '10'); // Завантажуємо більше фільмів для кращого UX

        fetch(url)
            .then(res => res.json())
            .then(result => {
                if (result.movies) {
                    currentPage = page;
                    totalMovies = result.pagination?.total || result.movies.length;
                    totalPages = Math.ceil(totalMovies / 10);
                    renderMovies(result.movies);
                    updatePagination();
                } else {
                    renderMovies(result); // Для зворотної сумісності
                }
            });
        console.log("Завантаження фільмів з параметрами:", url.searchParams.toString());
    }

    // Функції навігації пагінації
    function prevPage() {
        if (currentPage > 1) {
            loadMovies(currentPage - 1);
        }
    }
    function nextPage() {
        if (currentPage < totalPages) {
            loadMovies(currentPage + 1);
        }
    }

    function updatePagination() {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');
        nextBtn.onclick = nextPage;
        prevBtn.onclick = prevPage;
        if (totalPages > 1) {
            pagination.style.display = 'flex';
            pageInfo.textContent = `Сторінка ${currentPage} з ${totalPages}`;
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        } else {
            pagination.style.display = 'none';
        }
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
            addCard.innerHTML = `<span class="add-card-icon">Додати фільм</span>`;
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
                <div class="card-content">
                    <img src="${movie.poster_url || 'https://via.placeholder.com/200x300'}" alt="Постер">
                    <h3>${movie.title} (${movie.year})</h3>
                    <p>Рейтинг: ⭐ ${movie.rating.toFixed(1)}</p>
                </div>
            `;

            // Клік на картку для переходу на сторінку фільму
            card.onclick = (e) => {
                if (!e.target.classList.contains('delete-btn')) {
                    window.location.href = `/movie.html?id=${movie.id}`;
                }
            };

            // Якщо Адмін - додаємо кнопку видалення
            if (isAdmin) {
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-btn';
                delBtn.textContent = '🗑';
                delBtn.title = 'Видалити фільм';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    deleteMovie(movie.id);
                };
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
