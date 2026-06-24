import React from 'react';
import './Pagination.css';
import { IconChevronRight } from '../../assets/Icons';

function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="app-pagination__wrapper">
            <button
                className="app-pagination__btn app-pagination__btn--nav"
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <IconChevronRight width="20" style={{ transform: 'rotate(180deg)' }} />
            </button>

            <div className="app-pagination__list">
                {getPageNumbers().map((number, index) => (
                    number === '...' ? (
                        <span key={`dots-${index}`} className="app-pagination__dots">...</span>
                    ) : (
                        <button
                            key={index}
                            className={`app-pagination__btn app-pagination__btn--number ${currentPage === number ? 'app-pagination__btn--active' : ''}`}
                            onClick={() => onPageChange(number)}
                        >
                            {number}
                        </button>
                    )
                ))}
            </div>

            <button
                className="app-pagination__btn app-pagination__btn--nav"
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <IconChevronRight width="20" />
            </button>
        </div>
    );
}

export default Pagination;