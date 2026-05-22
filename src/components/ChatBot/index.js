import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatService from '../../services/chatService';
import images from '../../assets/img';
import './ChatBot.css';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Xin chào! 👋 Tôi là trợ lý AI thông minh. Bạn cần tìm phòng ở khu vực nào?", isBot: true }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen, isLoading]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessageText = inputValue;
        setInputValue('');

        setMessages(prev => [...prev, { id: Date.now(), text: userMessageText, isBot: false }]);
        setIsLoading(true);

        try {
            const responseObj = await ChatService.chatAI(userMessageText);
            console.log("Response Object gốc:", responseObj);

            const aiContent = responseObj?.data;

            setMessages(prev => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: aiContent?.text || "Dưới đây là kết quả tôi tìm được:",
                    isBot: true,
                    rooms: aiContent?.rooms || []
                }
            ]);

        } catch (error) {
            console.error("Lỗi khi chat với AI:", error);
            let errorMessage = "Hệ thống AI đang bận, bạn thử lại sau nhé!";
            if (error.response?.status === 401 || error.response?.status === 403) {
                errorMessage = "Vui lòng đăng nhập để trò chuyện cùng trợ lý AI.";
            }
            setMessages(prev => [...prev, { id: Date.now() + 1, text: errorMessage, isBot: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoomClick = (roomId) => {
        navigate(`/detail/${roomId}`);
        setIsOpen(false);
    };

    return (
        <div className="landlord-chatbot-wrapper">
            {!isOpen && (
                <button className="chatbot-toggle-btn animate-bounce-slow" onClick={toggleChat}>
                    <div className="bot-mini-avatar">
                        <img
                            src={images.chatbot}
                            alt="Chatbot Avatar"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="bot-mini-avatar">
                                <img
                                    src={images.chatbot}
                                    alt="Chatbot Avatar"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            </div>
                            <div>
                                <h4>Trợ lý AI TroSinhVien</h4>
                                <span className="status-online">Sẵn sàng tìm phòng</span>
                            </div>
                        </div>
                        <button className="chatbot-close-btn" onClick={toggleChat}>&times;</button>
                    </div>

                    <div className="chatbot-messages-area">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-wrapper-block ${msg.isBot ? 'bot-block' : 'user-block'}`}>
                                <div className={`chat-bubble-row ${msg.isBot ? 'bot' : 'user'}`}>
                                    {msg.isBot && (
                                        <div className="bot-mini-avatar">
                                            <img
                                                src={images.chatbot}
                                                alt="Chatbot Avatar"
                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    )}
                                    <div className="chat-message-text">
                                        {msg.text}
                                    </div>
                                </div>

                                {msg.isBot && msg.rooms && msg.rooms.length > 0 && (
                                    <div className="chatbot-rooms-container">
                                        {msg.rooms.map((room) => (
                                            <div
                                                className="chat-room-card"
                                                key={room.id}
                                                onClick={() => handleRoomClick(room.id)}
                                            >
                                                <div className="room-card-thumb">
                                                    <img
                                                        src={room.images?.[0] || "https://placehold.co/120x80?text=No+Image"}
                                                        alt={room.title}
                                                    />
                                                    <span className="room-card-price">
                                                        {(room.price / 1000000).toFixed(1)}tr/tháng
                                                    </span>
                                                </div>
                                                <div className="room-card-body">
                                                    <h5 className="room-card-title" title={room.title}>{room.title}</h5>
                                                    <p className="room-card-meta">📐 {room.area} m²</p>
                                                    <p className="room-card-address" title={room.address}>📍 {room.address}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chat-bubble-row bot">
                                <div className="bot-mini-avatar">
                                    <img
                                        src={images.chatbot}
                                        alt="Chatbot Avatar"
                                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="chat-message-text ai-typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="chatbot-input-form">
                        <input
                            type="text"
                            placeholder={isLoading ? "AI đang tìm phòng phù hợp..." : "Nhập yêu cầu tìm phòng..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="chatbot-send-btn" disabled={isLoading || !inputValue.trim()}>
                            ➔
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatBot;