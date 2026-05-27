INSERT INTO genres (name) VALUES 
    ('Action'), ('Comedy'),
    ('Drama'), ('Horror'), 
    ('Sci-Fi'), ('Romance');

INSERT INTO movies 
    (title, poster_url, 'year', genre_id, 'description', rating) 
VALUES 
    ('Inception', 'https://example.com/inception.jpg', 2010, 5, 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 4.8),
    ('The Godfather', 'https://example.com/godfather.jpg', 1972, 3, 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 4.9),
    ('The Dark Knight', 'https://example.com/darkknight.jpg', 2008, 1, 'When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.', 4.7),
    ('Pulp Fiction', 'https://example.com/pulpfiction.jpg', 1994, 2, 'The lives of two mob hitmen, a boxer, a gangster''s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 4.6),
    ('The Shawshank Redemption', 'https://example.com/shawshank.jpg', 1994, 3, 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 4.9),
    ('The Matrix', 'https://example.com/matrix.jpg', 1999, 5, 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', 4.7),
    ('Titanic', 'https://example.com/titanic.jpg', 1997, 6, 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.', 4.5),
    ('Get Out', 'https://example.com/getout.jpg', 2017, 4, 'A young African-American visits his white girlfriend''s parents for the weekend, where his simmering uneasiness about their reception of him eventually reaches a boiling point.', 4.3),
    ('The Avengers', 'https://example.com/avengers.jpg', 2012, 1, 'Earth''s mightiest heroes must come together and learn to fight as a team if they are to stop the mischievous Loki and his alien army from enslaving humanity.', 4.4),
    ('Superbad', 'https://example.com/superbad.jpg', 2007, 2, 'Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.', 4.0);

INSERT INTO reviews (movie_id, author, "text", rating) VALUES 
    (1, 'Alice', 'Inception is a mind-bending masterpiece that keeps you on the edge of your seat!', 5),
    (1, 'Bob', 'A visually stunning film with a complex plot that rewards multiple viewings.', 4.5),
    (2, 'Charlie', 'The Godfather is a timeless classic that defines the gangster genre.', 5),
    (2, 'Dave', 'An epic tale of family and power that is both brutal and beautiful.', 4.8),
    (3, 'Eve', 'The Dark Knight is a thrilling and thought-provoking superhero film.', 4.7),
    (3, 'Frank', 'Heath Ledger''s performance as the Joker is unforgettable.', 5),
    (4, 'Grace', 'Pulp Fiction is a stylish and witty film with unforgettable characters.', 4.6),
    (4, 'Hank', 'Quentin Tarantino''s signature storytelling style shines in this cult classic.', 4.5),
    (5, 'Ivy', 'The Shawshank Redemption is an inspiring story of hope and friendship.', 5),
    (5, 'Jack', 'A beautifully crafted film that resonates with audiences of all ages.', 4.9);
