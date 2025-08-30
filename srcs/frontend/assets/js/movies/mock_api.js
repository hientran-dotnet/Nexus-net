
// mock_api.js
// A tiny in-memory mock to simulate API responses without any backend.
// Later, replace these functions with real fetch() calls to your PHP endpoints.

(function(global){
  const today = new Date(); today.setHours(0,0,0,0);
  function addDays(base, d){ const x=new Date(base); x.setDate(x.getDate()+d); return x; }
  function isoDate(d){ return d.toISOString().slice(0,10); }
  function at(d, h, m){ const x=new Date(d); x.setHours(h,m,0,0); return x.toISOString(); }

  const MOVIES = [
    {
      id: 101,
      title: "Hồn Trương Ba, Da Hàng Thịt",
      duration_min: 115,
      rating: "T13",
      poster_url: "assets/images/banner1.jpg",
      description: "Một câu chuyện giả tưởng, hài hước và châm biếm."
    },
    {
      id: 102,
      title: "Doraemon: Nobita và Vùng Đất Lý Tưởng Trên Trời",
      duration_min: 109,
      rating: "P",
      poster_url: "assets/images/banner2.jpg",
      description: "Hành trình phiêu lưu trên bầu trời đầy mơ mộng."
    }
  ];

  // Create 7 days of simple schedules for each movie
  const SHOWTIMES = [];
  for(const mv of MOVIES){
    for(let i=0;i<7;i++){
      const d = addDays(today, i);
      const base = isoDate(d);
      // 3 rooms / 2 formats demo
      const combos = [
        {auditorium_name:"Phòng 1", format:"2D", price: 85000, hours:[9, 13, 17, 20]},
        {auditorium_name:"Phòng 2", format:"2D", price: 85000, hours:[10, 14, 18, 21]},
        {auditorium_name:"Phòng 3", format:"IMAX", price: 120000, hours:[11, 15, 19]}
      ];
      for(const c of combos){
        for(const h of c.hours){
          SHOWTIMES.push({
            id: Number(`${mv.id}${i}${h}`),       // simple id
            movie_id: mv.id,
            starts_at: at(d, h, 0),
            ends_at:  at(d, h+2, 0),
            auditorium_name: c.auditorium_name,
            format: c.format,
            base_price: c.price
          });
        }
      }
    }
  }

  // Public API-like functions
  async function getMovieById(id){
    const m = MOVIES.find(x=> String(x.id) === String(id));
    if(!m) throw new Error("movie not found");
    return { ok:true, movie:m };
  }

  async function getShowtimesByMovieAndDate(movieId, dateISO){
    const list = SHOWTIMES.filter(s => String(s.movie_id)===String(movieId) && s.starts_at.slice(0,10)===dateISO);
    return { ok:true, showtimes: list };
  }

  async function listMovies(){
    return { ok:true, movies: MOVIES };
  }

  global.MockAPI = { getMovieById, getShowtimesByMovieAndDate, listMovies };
})(window);
