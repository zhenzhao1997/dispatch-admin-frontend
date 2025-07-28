import React from 'react';

/**
 * A generic modal component to provide the backdrop and container.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content to display inside the modal.
 * @param {Function} props.onClose - Function to call when the backdrop is clicked.
 * @param {string} [props.width='w-1/3'] - Tailwind CSS class for the modal width.
 */
function Modal({ children, onClose, width = 'w-1/3' }) {
    // Stop propagation to prevent closing modal when clicking inside the content
    const handleContentClick = (e) => e.stopPropagation();

    return (
        // The modal backdrop, click to close
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center" onClick={onClose}>
            {/* The modal container */}
            <div className={`relative mx-auto p-5 border shadow-lg rounded-md bg-white ${width}`} onClick={handleContentClick}>
                {children}
            </div>
        </div>
    );
}

export default Modal;