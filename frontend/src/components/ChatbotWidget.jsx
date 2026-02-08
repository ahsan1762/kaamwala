import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import api from '../api';
import './ChatbotWidget.css';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Hi! I'm the KaamWala bot. How can I help you today?
        You can try asking the bot:\n
        How do I pay?\n
        Register\n
        Help`,
            isBot: true
        }
    ]);

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: inputValue,
            isBot: false
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await api.post('/chatbot', { message: userMsg.text });

            const botReply =
                typeof res.data.reply === 'string'
                    ? res.data.reply
                    : 'Sorry, I did not understand that.';

            const botMsg = {
                id: Date.now() + 1,
                text: botReply,
                isBot: true
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: 'Sorry, I am having trouble connecting right now.',
                    isBot: true
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-widget">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <Bot size={20} />
                            <span>KaamWala Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}
                            >
                                {msg.isBot && (
                                    <div className="avatar bot-avatar">
                                        <Bot size={14} />
                                    </div>
                                )}

                                <div className="message-bubble">
                                    {msg.text}
                                </div>

                                {!msg.isBot && (
                                    <div className="avatar user-avatar">
                                        <User size={14} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chat-message bot">
                                <div className="avatar bot-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="message-bubble typing">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask a question..."
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                        />
                        <button type="submit" disabled={isLoading}>
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            <button
                className="chatbot-toggle"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
};

export default ChatbotWidget;
