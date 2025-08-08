import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IoMdClose } from 'react-icons/io';
import './EditMovieModal.css';

interface EditMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MovieFormData) => void;
  movieData: {
    Title: string;
    Year: string;
    Runtime: string;
    Genre: string;
    Director: string;
    imdbID: string;
  } | null;
}

interface MovieFormData {
  Title: string;
  Year: string;
  Runtime: string;
  Genre: string;
  Director: string;
}

const EditMovieModal: React.FC<EditMovieModalProps> = ({
  isOpen,
  onClose,
  onSave,
  movieData,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MovieFormData>();

  useEffect(() => {
    if (movieData && isOpen) {
      reset({
        Title: movieData.Title,
        Year: movieData.Year,
        Runtime: movieData.Runtime,
        Genre: movieData.Genre,
        Director: movieData.Director,
      });
    }
  }, [movieData, isOpen, reset]);

  const onSubmit = (data: MovieFormData) => {
    onSave(data);
    onClose();
  };

  const validateYear = (value: string) => {
    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year)) return 'Year must be a valid number';
    if (year < 1888) return 'Year must be 1888 or later (first movie year)';
    if (year > currentYear + 5)
      return `Year cannot be more than 5 years in the future`;
    return true;
  };

  if (!isOpen || !movieData) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='edit-modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='edit-modal-header'>
          <h2>Edit Movie</h2>
          <button
            className='modal-close'
            onClick={onClose}
            aria-label='Close modal'
          >
            <IoMdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='edit-form'>
          <div className='form-group'>
            <label htmlFor='title'>Title</label>
            <input
              id='title'
              type='text'
              {...register('Title', {
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
              })}
              className={errors.Title ? 'error' : ''}
            />
            {errors.Title && (
              <span className='error-message'>{errors.Title.message}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='year'>Year</label>
            <input
              id='year'
              type='text'
              {...register('Year', {
                required: 'Year is required',
                validate: validateYear,
              })}
              className={errors.Year ? 'error' : ''}
            />
            {errors.Year && (
              <span className='error-message'>{errors.Year.message}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='runtime'>Runtime</label>
            <input
              id='runtime'
              type='text'
              {...register('Runtime', {
                required: 'Runtime is required',
                minLength: {
                  value: 3,
                  message: 'Runtime must be at least 3 characters',
                },
              })}
              className={errors.Runtime ? 'error' : ''}
            />
            {errors.Runtime && (
              <span className='error-message'>{errors.Runtime.message}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='genre'>Genre</label>
            <input
              id='genre'
              type='text'
              {...register('Genre', {
                required: 'Genre is required',
                minLength: {
                  value: 3,
                  message: 'Genre must be at least 3 characters',
                },
              })}
              className={errors.Genre ? 'error' : ''}
            />
            {errors.Genre && (
              <span className='error-message'>{errors.Genre.message}</span>
            )}
          </div>

          <div className='form-group'>
            <label htmlFor='director'>Director</label>
            <input
              id='director'
              type='text'
              {...register('Director', {
                required: 'Director is required',
                minLength: {
                  value: 3,
                  message: 'Director must be at least 3 characters',
                },
              })}
              className={errors.Director ? 'error' : ''}
            />
            {errors.Director && (
              <span className='error-message'>{errors.Director.message}</span>
            )}
          </div>

          <div className='form-actions'>
            <button type='button' onClick={onClose} className='btn-cancel'>
              Cancel
            </button>
            <button type='submit' className='btn-save'>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMovieModal;
