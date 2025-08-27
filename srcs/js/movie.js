document.addEventListener('DOMContentLoaded', async function () {
    const apiUrl = 'https://itdi.io.vn/services/movies/get-all-movies.php';
    const grid = document.getElementById('moviesGrid');
    try {
        const res = await fetch(apiUrl);
        const result = await res.json();
        if (!result.success) throw new Error('Không lấy được dữ liệu phim!');
        const movies = result.data;
        grid.innerHTML = '';

        if (!movies || movies.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500">Không có phim nào.</div>';
            return;
        }

        for (const movie of movies) {
            grid.innerHTML += `
                <div class="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                    <!-- Poster Image with Overlay -->
                    <div class="relative overflow-hidden">
                        <img src="${movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}" 
                             alt="${movie.title}" 
                             class="h-80 w-full object-cover group-hover:scale-105 transition-transform duration-300">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <!-- Rating Badge -->
                        <div class="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center">
                            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            ${movie.rating || 'N/A'}
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <!-- Title -->
                        <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                            ${movie.title}
                        </h3>
                        
                        <!-- Movie Info -->
                        <div class="space-y-2 mb-4">
                            <div class="flex items-center text-gray-600 text-sm">
                                <svg class="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v2a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"/>
                                </svg>
                                <span class="font-medium">${movie.genre || 'Không rõ'}</span>
                            </div>
                            
                            <div class="flex items-center text-gray-600 text-sm">
                                <svg class="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>${movie.duration || 'Không rõ'}</span>
                            </div>
                            
                            <div class="flex items-center text-gray-600 text-sm">
                                <svg class="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z"/>
                                </svg>
                                <span>${movie.release_date || 'Không rõ'}</span>
                            </div>
                        </div>
                        
                        <!-- Description -->
                        <p class="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                            ${movie.description || 'Không có mô tả'}
                        </p>
                        
                        <!-- Action Button -->
                        <button onclick="viewMovieDetail(${movie.id})" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Xem chi tiết
                        </button>
                        
                    </div>
                </div>
            `;
        }
    } catch (err) {
        grid.innerHTML = `<div class="col-span-full text-center text-red-500">${err.message}</div>`;
    }
});

// Function để chuyển đến trang chi tiết
function viewMovieDetail(movieId) {
    window.location.href = `pages/detail-movie.html?id=${movieId}`;
}