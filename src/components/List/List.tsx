import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import {
  fetchMovieDetails,
  searchMovies,
  toggleFavorite,
  updateMovieDetails,
} from '../../store/movieSlice';
import './List.css';
import { FaRegStar, FaStar, FaSpinner } from 'react-icons/fa';

// Import your fallback image - place the camera image in src/assets/
import fallbackPoster from '../../assets/fallback-poster.jpg';
import MovieDetailsModal from '../Modals/MovieDetailsModal/MovieDetailsModal';
import EditMovieModal from '../Modals/EditMovieModal/EditMovieModal';

const List: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    searches,
    currentSearchKeyword,
    loading,
    movieDetailsCache,
    detailsLoading,
    favoriteMovies,
    showFavoritesOnly,
  } = useSelector((state: RootState) => state.movies);

  const [currentPage, setCurrentPage] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const currentSearch = searches.find(
    (search) => search.searchKeyword === currentSearchKeyword
  );

  useEffect(() => {
    setCurrentPage(1);
    setImageErrors(new Set());
  }, [currentSearchKeyword]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (!currentSearch || !currentSearchKeyword) return;

    if (!currentSearch.searchResults[page]) {
      dispatch(searchMovies({ keyword: currentSearchKeyword, page }));
    }
    setCurrentPage(page);
  };

  const handleImageError = (imdbID: string) => {
    setImageErrors((prev) => new Set(prev).add(imdbID));
  };

  const handleMovieClick = async (imdbID: string) => {
    setSelectedMovieId(imdbID);
    if (!movieDetailsCache[imdbID]) {
      await dispatch(fetchMovieDetails(imdbID));
    }
  };

  const handleEditClick = async (e: React.MouseEvent, imdbID: string) => {
    e.stopPropagation();
    setEditingMovieId(imdbID);
    if (!movieDetailsCache[imdbID]) {
      await dispatch(fetchMovieDetails(imdbID));
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, imdbID: string) => {
    e.stopPropagation();
    console.log('Delete clicked for movie:', imdbID);
  };

  const handleFavoriteClick = (e: React.MouseEvent, imdbID: string) => {
    e.stopPropagation();
    dispatch(toggleFavorite(imdbID));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveEdit = (data: any) => {
    if (editingMovieId && movieDetailsCache[editingMovieId]) {
      const updatedMovie = {
        ...movieDetailsCache[editingMovieId],
        ...data,
      };
      dispatch(updateMovieDetails(updatedMovie));
    }
  };

  if (!currentSearchKeyword || !currentSearch) {
    return (
      <div className='list-container' ref={listContainerRef}>
        <div className='empty-state'>
          <p>No search results to display. Please search for movies above.</p>
        </div>
      </div>
    );
  }

  // Get movies and apply favorites filter if needed
  let movies = currentSearch.searchResults[currentPage] || [];
  let totalFilteredResults = currentSearch.totalResults;

  if (showFavoritesOnly) {
    // When showing favorites, we need to gather all favorite movies from all pages
    const allFavoriteMovies: typeof movies = [];
    Object.values(currentSearch.searchResults).forEach((pageMovies) => {
      pageMovies.forEach((movie) => {
        if (favoriteMovies.includes(movie.imdbID)) {
          allFavoriteMovies.push(movie);
        }
      });
    });

    // Calculate pagination for favorites
    const itemsPerPage = 10;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    movies = allFavoriteMovies.slice(startIndex, endIndex);
    totalFilteredResults = allFavoriteMovies.length;
  }

  const totalPages = Math.ceil(totalFilteredResults / 10);

  if (loading && movies.length === 0) {
    return (
      <div className='list-container' ref={listContainerRef}>
        <div className='loading-state'>Loading movies...</div>
      </div>
    );
  }

  return (
    <div className='list-container' ref={listContainerRef}>
      <div className='search-info'>
        <h2>
          {showFavoritesOnly
            ? 'Favorite Movies'
            : `Search Results for: "${currentSearchKeyword}"`}
        </h2>
        <p className='results-count'>
          {showFavoritesOnly
            ? `Total Favorites: ${totalFilteredResults}`
            : `Total Results: ${currentSearch.totalResults}`}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className='empty-state'>
          <p>
            {showFavoritesOnly
              ? 'No favorite movies yet. Click the star icon on movies to add them to favorites.'
              : 'No movies found for this search.'}
          </p>
        </div>
      ) : (
        <>
          <div className='movies-grid'>
            {movies.map((movie) => {
              const isFavorite = favoriteMovies.includes(movie.imdbID);
              return (
                <div
                  key={movie.imdbID}
                  className='movie-card'
                  onClick={() => handleMovieClick(movie.imdbID)}
                >
                  <div className='movie-poster'>
                    {movie.Poster !== 'N/A' &&
                    !imageErrors.has(movie.imdbID) ? (
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
                      className={`favorite-icon ${isFavorite ? 'active' : ''}`}
                      onClick={(e) => handleFavoriteClick(e, movie.imdbID)}
                      title={
                        isFavorite
                          ? 'Remove from Favorites'
                          : 'Add to Favorites'
                      }
                    >
                      {isFavorite ? <FaStar /> : <FaRegStar />}
                    </div>
                  </div>
                  <div className='movie-info'>
                    <h3 className='movie-title'>{movie.Title}</h3>
                    <p className='movie-year'>{movie.Year}</p>
                    <div className='movie-actions'>
                      <button
                        onClick={(e) => handleEditClick(e, movie.imdbID)}
                        className='action-button edit-button'
                      >
                        {detailsLoading && editingMovieId === movie.imdbID ? (
                          <FaSpinner className='edit-spinner' fill='white' />
                        ) : (
                          'Edit'
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, movie.imdbID)}
                        className='action-button delete-button'
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Movie Details Modal */}
      <MovieDetailsModal
        isOpen={!!selectedMovieId && !editingMovieId}
        onClose={() => setSelectedMovieId(null)}
        movieDetails={
          selectedMovieId ? movieDetailsCache[selectedMovieId] : null
        }
        loading={detailsLoading}
      />

      {/* Edit Movie Modal */}
      <EditMovieModal
        isOpen={!!editingMovieId}
        onClose={() => setEditingMovieId(null)}
        onSave={handleSaveEdit}
        movieData={editingMovieId ? movieDetailsCache[editingMovieId] : null}
      />
    </div>
  );
};

export default List;
