import React from 'react';

const MagicWandIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.25278V6.25278C12 6.25278 12 6.25278 12 6.25278C12 4.45643 13.4564 3 15.2528 3V3C17.0491 3 18.5056 4.45643 18.5056 6.25278V6.25278C18.5056 6.25278 18.5056 6.25278 18.5056 6.25278" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.7472V17.7472C12 19.5436 10.5436 21 8.74722 21V21C6.95086 21 5.49444 19.5436 5.49444 17.7472V17.7472C5.49444 17.7472 5.49444 17.7472 5.49444 17.7472" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.7472 12H17.7472C19.5436 12 21 10.5436 21 8.74722V8.74722C21 6.95086 19.5436 5.49444 17.7472 5.49444H17.7472C17.7472 5.49444 17.7472 5.49444 17.7472 5.49444" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.25278 12H6.25278C4.45643 12 3 13.4564 3 15.2528V15.2528C3 17.0491 4.45643 18.5056 6.25278 18.5056H6.25278C6.25278 18.5056 6.25278 18.5056 6.25278 18.5056" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18L6 6" />
    </svg>
);

export default MagicWandIcon;