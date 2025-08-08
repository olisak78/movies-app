import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { searchMovies } from '../../store/movieSlice';
import './List.css';
import { FaRegStar } from 'react-icons/fa';

// Import your fallback image - place the camera image in src/assets/
import fallbackPoster from '../../assets/fallback-poster.jpg';

const List: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { searches, currentSearchKeyword, loading } = useSelector(
    (state: RootState) => state.movies
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const currentSearch = searches.find(
    (search) => search.searchKeyword === currentSearchKeyword
  );

  useEffect(() => {
    setCurrentPage(1);
    setImageErrors(new Set()); // Reset image errors on new search
  }, [currentSearchKeyword]);

  const handlePageChange = (page: number) => {
    if (!currentSearch || !currentSearchKeyword) return;

    setCurrentPage(page);

    if (!currentSearch.searchResults[page]) {
      dispatch(searchMovies({ keyword: currentSearchKeyword, page }));
    }
  };

  const handleImageError = (imdbID: string) => {
    setImageErrors((prev) => new Set(prev).add(imdbID));
  };

  const handleEditClick = (imdbID: string) => {
    console.log('Edit clicked for movie:', imdbID);
  };

  const handleDeleteClick = (imdbID: string) => {
    console.log('Delete clicked for movie:', imdbID);
  };

  const handleFavoriteClick = (imdbID: string) => {
    console.log('Favorite clicked for movie:', imdbID);
  };

  if (!currentSearchKeyword || !currentSearch) {
    return (
      <div className='list-container'>
        <div className='empty-state'>
          <p>No search results to display. Please search for movies above.</p>
        </div>
      </div>
    );
  }

  const movies = currentSearch.searchResults[currentPage] || [];
  const totalPages = Math.ceil(currentSearch.totalResults / 10);

  if (loading && movies.length === 0) {
    return (
      <div className='list-container'>
        <div className='loading-state'>Loading movies...</div>
      </div>
    );
  }

  return (
    <div className='list-container'>
      <div className='search-info'>
        <h2>Search Results for: "{currentSearchKeyword}"</h2>
        <p className='results-count'>
          Total Results: {currentSearch.totalResults}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className='empty-state'>
          <p>No movies found for this search.</p>
        </div>
      ) : (
        <>
          <div className='movies-grid'>
            {movies.map((movie) => (
              <div key={movie.imdbID} className='movie-card'>
                <div className='movie-poster'>
                  {movie.Poster !== 'N/A' && !imageErrors.has(movie.imdbID) ? (
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      onError={() => handleImageError(movie.imdbID)}
                    />
                  ) : (
                    <div className='fallback-poster'>
                      <img
                        src={fallbackPoster}
                        alt={`${movie.Title} - No poster available`}
                        className='fallback-image'
                      />
                      <div className='fallback-overlay'>
                        <p>No poster available</p>
                      </div>
                    </div>
                  )}
                  <div
                    className='favorite-icon'
                    onClick={() => handleFavoriteClick(movie.imdbID)}
                    title='Add to Favorites'
                  >
                    <FaRegStar />
                  </div>
                </div>
                <div className='movie-info'>
                  <h3 className='movie-title'>{movie.Title}</h3>
                  <p className='movie-year'>{movie.Year}</p>
                  <div className='movie-actions'>
                    <button
                      onClick={() => handleEditClick(movie.imdbID)}
                      className='action-button edit-button'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(movie.imdbID)}
                      className='action-button delete-button'
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className='pagination'>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className='pagination-button'
              >
                Previous
              </button>

              <div className='page-numbers'>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 10) {
                    pageNum = i + 1;
                  } else if (currentPage <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 4) {
                    pageNum = totalPages - 9 + i;
                  } else {
                    pageNum = currentPage - 5 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`page-number ${
                        currentPage === pageNum ? 'active' : ''
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className='pagination-button'
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default List;
