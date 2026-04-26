document.addEventListener('DOMContentLoaded', () => {
    const moviesGrid = document.getElementById('moviesGrid');
    const adminToggle = document.getElementById('adminToggle');
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const sortSelect = document.getElementById('sortSelect');

    let isAdmin = false;

    // 1. Завантаження жанрів
    fetch('/api/genres')
        .then(res => res.json())
        .then(genres => {
            genres.forEach(g => {
                genreFilter.innerHTML += `<option value="${g.id}">${g.name}</option>`;
            });
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
    
    // Перемикач адміна
    adminToggle.addEventListener('change', (e) => {
        isAdmin = e.target.checked;
        loadMovies();
    });

    // Перше завантаження
    loadMovies();
});