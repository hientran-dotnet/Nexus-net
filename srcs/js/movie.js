// Sample movie data
const movies = [
    {
        id: 1,
        title: "The Adventure Begins",
        genre: "Action/Adventure",
        duration: "2h 15m",
        rating: "PG-13",
        releaseDate: "March 15, 2024",
        poster: "https://images.unsplash.com/photo-1489599511652-3b80b4cc1ddc?w=400&h=600&fit=crop",
        description: "An epic adventure that takes you on a journey through unknown territories filled with danger and excitement."
    },
    {
        id: 2,
        title: "Mystery of the Night",
        genre: "Mystery/Thriller",
        duration: "1h 58m",
        rating: "R",
        releaseDate: "February 28, 2024",
        poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
        description: "A gripping mystery that will keep you on the edge of your seat until the very last scene."
    },
    {
        id: 3,
        title: "Comedy Central",
        genre: "Comedy",
        duration: "1h 42m",
        rating: "PG",
        releaseDate: "January 10, 2024",
        poster: "https://images.unsplash.com/photo-1489599511652-3b80b4cc1ddc?w=400&h=600&fit=crop",
        description: "A hilarious comedy that will have you laughing from start to finish with its witty dialogue and perfect timing."
    },
    {
        id: 4,
        title: "Space Odyssey",
        genre: "Sci-Fi",
        duration: "2h 32m",
        rating: "PG-13",
        releaseDate: "April 5, 2024",
        poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
        description: "An incredible journey through space and time that explores the mysteries of the universe."
    },
    {
        id: 5,
        title: "Love Story",
        genre: "Romance/Drama",
        duration: "1h 55m",
        rating: "PG-13",
        releaseDate: "February 14, 2024",
        poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
        description: "A heartwarming love story that explores the depths of human emotion and connection."
    },
    {
        id: 6,
        title: "The Last Hero",
        genre: "Action/Drama",
        duration: "2h 8m",
        rating: "PG-13",
        releaseDate: "March 22, 2024",
        poster: "https://images.unsplash.com/photo-1489599511652-3b80b4cc1ddc?w=400&h=600&fit=crop",
        description: "The final chapter in an epic saga that has captivated audiences worldwide."
    }
];

// Initialize Movies Grid
function initMoviesGrid() {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    
    grid.innerHTML = movies.map(movie => `
        <div class="movie-card bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer" onclick="goToMovieDetail(${movie.id})">
            <img src="${movie.poster}" alt="${movie.title}" class="w-full h-64 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-bold text-gray-800 mb-2">${movie.title}</h3>
                <p class="text-gray-600 text-sm mb-1">${movie.genre}</p>
                <p class="text-gray-600 text-sm mb-3">${movie.duration}</p>
                <button class="w-full gradient-bg text-white py-2 rounded-lg hover:opacity-90 transition">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
}

function goToMovieDetail(movieId) {
    window.location.href = `pages/movie-detail.html?id=${movieId}`;
}