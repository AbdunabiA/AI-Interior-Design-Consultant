import React from 'react';
import MagicWandIcon from './icons/MagicWandIcon';

const Header: React.FC = () => {
    return (
        <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 w-full">
            <div className="container mx-auto flex items-center gap-3">
                <MagicWandIcon className="w-8 h-8 text-cyan-400" />
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Interior Design Consultant</h1>
            </div>
        </header>
    );
};

export default Header;
