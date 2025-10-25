import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import SendIcon from './icons/SendIcon';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

interface ChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const Chat: React.FC<ChatProps> = ({ chatHistory, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
      return (
          <div>
              <p>{message.content}</p>
              {message.products && message.products.length > 0 && (
                  <div className="mt-4 space-y-3">
                      <h4 className="font-semibold text-gray-300">Suggested Products:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {message.products.map((product, index) => (
                              <li key={index} className="bg-gray-700/50 p-3 rounded-lg">
                                  <a href={product.purchaseLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:underline">{product.itemName}</a>
                                  <p className="text-sm text-gray-400 mt-1">{product.description}</p>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>
      );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800/50 rounded-lg shadow-xl flex flex-col h-[60vh] mt-6">
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {chatHistory.map((message, index) => (
          <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.role === 'model' && <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-400" />}
            <div className={`max-w-md p-4 rounded-xl ${message.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                {renderMessageContent(message)}
            </div>
            {message.role === 'user' && <UserIcon className="w-8 h-8 flex-shrink-0 text-gray-400" />}
          </div>
        ))}
        {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
            <div className="flex items-start gap-4 justify-start">
                <BotIcon className="w-8 h-8 flex-shrink-0 text-cyan-400" />
                <div className="max-w-md p-4 rounded-xl bg-gray-700 text-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Refine your design or ask a question..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 text-white p-2 rounded-full hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;