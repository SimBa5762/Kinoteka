let movieCurrentUser = null;
let isAdmin = false;
let movieId = null;

document.addEventListener('DOMContentLoaded', () => {
    const userControls = document.getElementById('user-controls');

    // Проверяем авторизацию и права админа
    fetch('/api/users/profile')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Not logged in');
        })
        .then(user => {
            movieCurrentUser = user;
            isAdmin = (user.role === 'admin' || user.role === 'owner');

            if (userControls) {
                userControls.innerHTML = `
                    <button class="btn-profile" onclick="handleProfileClick()">👤 ${user.userName}</button>
                `;
            }

            loadGenres();
            checkMovieId();
        })
        .catch(err => {
            console.log("Користувач не авторизований");
            isAdmin = false; // Явно встановлюємо false

            if (userControls) {
                userControls.innerHTML = `
                    <button class="btn-profile" onclick="handleProfileClick()">👤 Профіль</button>
                `;
            }

            loadGenres();
            checkMovieId();
        });
});

function loadGenres() {
    fetch('/api/genres')
        .then(res => res.json())
        .then(genres => {
            const select = document.getElementById('movieGenre');
            genres.forEach(g => {
                const option = document.createElement('option');
                option.value = g.id;
                option.textContent = g.name;
                select.appendChild(option);
            });
        });
}

function checkMovieId() {
    const urlParams = new URLSearchParams(window.location.search);
    movieId = urlParams.get('id');
    
    if (movieId) {
        // Якщо є ID - завантажуємо дані фільму
        loadMovieData(movieId);
        
        if (isAdmin) {
            // Адмін - показуємо форму редагування
            document.getElementById('formTitle').textContent = 'Редагування фільму';
            document.getElementById('movieFormContainer').style.display = 'block';
            document.getElementById('movieView').style.display = 'none';
        } else {
            // Не адмін - показуємо режим перегляду
            document.getElementById('movieFormContainer').style.display = 'none';
            document.getElementById('movieView').style.display = 'block';
            showMovieView(movieId);
        }
    } else {
        // Немає ID - тільки адмін може додавати фільми
        if (!isAdmin) {
            alert('Тільки адміністратори можуть додавати фільми.');
            window.location.href = '/';
            return;
        }
        // Адмін - показуємо форму додавання
        document.getElementById('formTitle').textContent = 'Додавання фільму';
        document.getElementById('movieFormContainer').style.display = 'block';
        document.getElementById('movieView').style.display = 'none';
    }
}

function loadMovieData(id) {
    fetch(`/api/movies/${id}`)
        .then(res => res.json())
        .then(movie => {
            document.getElementById('movieTitle').value = movie.title;
            document.getElementById('movieYear').value = movie.year;
            document.getElementById('movieGenre').value = movie.genre_id;
            document.getElementById('movieRating').value = movie.rating;
            document.getElementById('movieDescription').value = movie.description || '';
            document.getElementById('moviePoster').value = movie.poster_url || '';
            
            if (movie.poster_url) {
                showPosterPreview(movie.poster_url);
            }
        })
        .catch(err => {
            alert('Ошибка загрузки данных фильма: ' + err.message);
        });
}

function showMovieView(id) {
    fetch(`/api/movies/${id}`)
        .then(res => res.json())
        .then(movie => {
            document.getElementById('viewTitle').textContent = movie.title;
            document.getElementById('viewYear').textContent = movie.year;
            document.getElementById('viewRating').textContent = movie.rating.toFixed(1);
            document.getElementById('viewDescription').textContent = movie.description || 'Опис відсутній';
            
            if (movie.poster_url) {
                document.getElementById('viewPoster').src = movie.poster_url;
            } else {
                document.getElementById('viewPoster').src = 'https://via.placeholder.com/300x450';
            }
            
            // Отримуємо назву жанру
            fetch('/api/genres')
                .then(res => res.json())
                .then(genres => {
                    const genre = genres.find(g => g.id === movie.genre_id);
                    document.getElementById('viewGenre').textContent = genre ? genre.name : 'Невідомий жанр';
                });

            // Показуємо форму коментарів якщо користувач авторизований
            if (movieCurrentUser) {
                document.getElementById('commentForm').style.display = 'block';
            }
            
            // Завантажуємо коментарі
            loadComments(id);
        })
        .catch(err => {
            alert('Ошибка загрузки данных фильма: ' + err.message);
        });
}

function loadComments(movieId) {
    fetch(`/api/movies/${movieId}/reviews`)
        .then(res => res.json())
        .then(reviews => {
            renderComments(reviews);
        })
        .catch(err => {
            console.error('Помилка завантаження коментарів:', err);
        });
}

function renderComments(reviews) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '';
    
    if (reviews.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">Коментарів ще немає. Будьте першим!</p>';
        return;
    }
    
    reviews.forEach(review => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.dataset.commentId = review.id;
        
        const isOwnComment = movieCurrentUser && review.user_id === movieCurrentUser.id;
        const isAdminUser = isAdmin;
        
        let actionsHtml = '';
        if (isOwnComment || isAdminUser) {
            actionsHtml = `
                <div class="comment-actions">
                    ${isOwnComment ? `<button class="btn-edit" onclick="editComment(${review.id})">✏ Редагувати</button>` : ''}
                    <button class="btn-delete" onclick="deleteComment(${review.id})">🗑 Видалити</button>
                </div>
            `;
        }
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${review.author}</span>
                <span class="comment-rating">⭐ ${review.rating}/10</span>
            </div>
            <div class="comment-text">${review.text}</div>
            ${actionsHtml}
        `;
        
        commentsList.appendChild(commentDiv);
    });
}

function addComment() {
    const text = document.getElementById('commentText').value.trim();
    const rating = parseInt(document.getElementById('commentRating').value);
    const editingReviewId = document.getElementById('editingReviewId').value;

    if (!text) {
        alert('Будь ласка, напишіть коментар');
        return;
    }

    if (!movieId) {
        alert('Помилка: не вказано ID фільму');
        return;
    }

    // Якщо є ID коментаря, то це оновлення
    if (editingReviewId) {
        fetch(`/api/movies/reviews/${editingReviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, rating })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Review updated successfully') {
                cancelEdit();
                loadComments(movieId);
            } else {
                alert('Помилка: ' + (data.error || data.message));
            }
        })
        .catch(err => {
            alert('Помилка: ' + err.message);
        });
    } else {
        // Додавання нового коментаря
        fetch(`/api/movies/${movieId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, rating })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Review added successfully') {
                document.getElementById('commentText').value = '';
                loadComments(movieId);
            } else {
                alert('Помилка: ' + (data.error || data.message));
            }
        })
        .catch(err => {
            alert('Помилка: ' + err.message);
        });
    }
}

function deleteComment(reviewId) {
    if (!confirm('Ви впевнені, що хочете видалити цей коментар?')) {
        return;
    }
    
    fetch(`/api/movies/reviews/${reviewId}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.message === 'Review deleted successfully') {
            loadComments(movieId);
        } else {
            alert('Помилка: ' + (data.error || data.message));
        }
    })
    .catch(err => {
        alert('Помилка: ' + err.message);
    });
}

function editComment(reviewId) {
    const commentDiv = document.querySelector(`[data-comment-id="${reviewId}"]`);
    const textElement = commentDiv.querySelector('.comment-text');
    const ratingElement = commentDiv.querySelector('.comment-rating');
    const currentText = textElement.textContent;
    const currentRating = ratingElement.textContent.replace('⭐ ', '').replace('/10', '');

    // Заповнюємо форму даними коментаря
    document.getElementById('commentText').value = currentText;
    document.getElementById('commentRating').value = currentRating;
    document.getElementById('editingReviewId').value = reviewId;

    // Змінюємо кнопку на "Оновити коментар"
    document.getElementById('commentSubmitBtn').textContent = 'Оновити коментар';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';

    // Прокручуємо до форми
    document.getElementById('commentForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
    // Очищаємо форму
    document.getElementById('commentText').value = '';
    document.getElementById('commentRating').value = '0';
    document.getElementById('editingReviewId').value = '';

    // Змінюємо кнопку назад на "Додати коментар"
    document.getElementById('commentSubmitBtn').textContent = 'Додати коментар';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// Предпросмотр постера при вводе URL
document.getElementById('moviePoster').addEventListener('input', (e) => {
    const url = e.target.value;
    if (url) {
        showPosterPreview(url);
    } else {
        document.getElementById('posterPreview').innerHTML = '';
    }
});

// Предпросмотр постера при выборе файла
document.getElementById('moviePosterFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            showPosterPreview(event.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function showPosterPreview(src) {
    const preview = document.getElementById('posterPreview');
    preview.innerHTML = `<img src="${src}" alt="Предпросмотр постера" style="max-width: 200px; border-radius: 8px;">`;
}

// Обработчик формы
document.getElementById('movieForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('movieTitle').value;
    const year = document.getElementById('movieYear').value;
    const genreId = document.getElementById('movieGenre').value;
    const rating = document.getElementById('movieRating').value;
    const description = document.getElementById('movieDescription').value;
    const posterUrl = document.getElementById('moviePoster').value;
    const fileInput = document.getElementById('moviePosterFile');
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Збереження...';
    
    try {
        let response;
        
        // Якщо завантажено файл, використовуємо FormData
        if (fileInput.files[0]) {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('year', year);
            formData.append('genre_id', genreId);
            formData.append('rating', rating);
            formData.append('description', description);
            formData.append('poster', fileInput.files[0]);
            if (posterUrl) {
                formData.append('poster_url', posterUrl);
            }
            
            if (movieId) {
                // Редактирование существующего фильма
                response = await fetch(`/api/movies/${movieId}`, {
                    method: 'PUT',
                    body: formData
                });
            } else {
                // Добавление нового фильма
                response = await fetch('/api/movies', {
                    method: 'POST',
                    body: formData
                });
            }
        } else {
            // Якщо файл не завантажено, відправляємо JSON
            const movieData = {
                title,
                year: parseInt(year),
                genre_id: parseInt(genreId),
                rating: parseFloat(rating),
                description,
                poster_url: posterUrl
            };
            
            if (movieId) {
                // Редактирование существующего фильма
                response = await fetch(`/api/movies/${movieId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
            } else {
                // Добавление нового фильма
                response = await fetch('/api/movies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(movieData)
                });
            }
        }
        
        const data = await response.json();
        
        if (response.ok) {
            alert(movieId ? 'Фільм успішно оновлено!' : 'Фільм успішно додано!');
            window.location.href = '/';
        } else {
            alert('Помилка: ' + (data.error || data.message));
        }
    } catch (err) {
        alert('Помилка: ' + err.message);
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Зберегти';
    }
});

