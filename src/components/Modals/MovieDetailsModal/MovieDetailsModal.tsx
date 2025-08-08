import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import './MovieDetailsModal.css';

interface MovieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieDetails: {
    Title: string;
    Year: string;
    Runtime: string;
    Genre: string;
    Director: string;
    Poster: string;
    imdbID: string;
  } | null;
  loading?: boolean;
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  isOpen,
  onClose,
  movieDetails,
  loading = false,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <button
          className='modal-close'
          onClick={onClose}
          aria-label='Close modal'
        >
          <IoMdClose />
        </button>

        {loading ? (
          <div className='modal-loading'>Loading movie details...</div>
        ) : movieDetails ? (
          <div className='movie-details'>
            <div className='details-poster'>
              {movieDetails.Poster !== 'N/A' ? (
                <img src={movieDetails.Poster} alt={movieDetails.Title} />
              ) : (
                <div className='no-poster-placeholder'>
                  <p>No poster available</p>
                </div>
              )}
            </div>
            <div className='details-info'>
              <h2 className='details-title'>{movieDetails.Title}</h2>
              <div className='details-item'>
                <span className='details-label'>Year:</span>
                <span className='details-value'>{movieDetails.Year}</span>
              </div>
              <div className='details-item'>
                <span className='details-label'>Runtime:</span>
                <span className='details-value'>{movieDetails.Runtime}</span>
              </div>
              <div className='details-item'>
                <span className='details-label'>Genre:</span>
                <span className='details-value'>{movieDetails.Genre}</span>
              </div>
              <div className='details-item'>
                <span className='details-label'>Director:</span>
                <span className='details-value'>{movieDetails.Director}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className='modal-error'>Failed to load movie details</div>
        )}
      </div>
    </div>
  );
};

export default MovieDetailsModal;
