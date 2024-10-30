import React, { useState, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [allQuestions, setAllQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenChatBox, setIsOpenChatBox] = useState(false);
    const [showTyping, setShowTyping] = useState(false);

    const apiUrl = `https://vetetodaystg.wpenginepowered.com/wp-json/chatbot/v1`;

    useEffect(() => {
        fetch(`${apiUrl}/questions`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.length > 0) {
                    setAllQuestions(data);
                    const initialQuestion = data.find(item => !item.parent_id);
                    if (initialQuestion) {
                        setShowTyping(true);
                        setTimeout(() => {
                            setMessages([{
                                text: initialQuestion.question,
                                options: initialQuestion.response_data || [],
                                id: initialQuestion.id,
                                response_type: initialQuestion.response_type,
                            }]);
                            setShowTyping(false);
                        }, 5000);
                    }
                }
            })
            .catch((error) => console.error("Error fetching chatbot questions:", error));
    }, []);

    const handleOptionClick = (optionText, optionId) => {
        // Filter for next questions based on parent_id match
        const nextQuestions = allQuestions.filter((item) => {
            if (item.parent_id) {
                let parentIds;
                try {
                    parentIds = JSON.parse(item.parent_id);
                } catch {
                    parentIds = item.parent_id;
                }
                return Array.isArray(parentIds)
                    ? parentIds.map(Number).includes(Number(optionId))
                    : Number(parentIds) === Number(optionId);
            }
            return false;
        });

        if (nextQuestions.length > 0) {
            const nextQuestion = nextQuestions[0];
            
            // Handle redirects for nested responses
            if (nextQuestion.response_type === 'redirect') {
                const redirectUrl = nextQuestion.response_data;
                if (typeof redirectUrl === 'string' && redirectUrl.startsWith('http')) {
                    window.open(redirectUrl, "_blank");
                    return;
                }
            } 

            // Display next message if not a redirect
            const nextMessages = nextQuestions.map((nextQuestion) => ({
                text: nextQuestion.question,
                options: Array.isArray(nextQuestion.response_data) ? nextQuestion.response_data : [],
                id: nextQuestion.id,
                response_type: nextQuestion.response_type,
            }));

            setMessages((prevMessages) => [
                ...prevMessages,
                ...nextMessages,
            ]);
        }
    };

    return (
        <>
            {/* Collapsible icon */}
            <div
                className={`customQY-chatbot-icon ${isOpen ? 'open' : ''}`}
                onClick={() => {
                    if (!isOpen) {
                        setIsOpen(true);
                    } else if (!isOpenChatBox) {
                        setIsOpenChatBox(true);
                    }
                }}
            >
                {!isOpen && (
                    <div>
                        <img className='customQY-icon-image' src="https://vetetodaystg.wpenginepowered.com/wp-content/uploads/2024/07/Untitled-design-2024-05-11T004813.70.png" alt="Chat Icon" />
                        <span className="customQY-active-indicator"></span>
                    </div>
                )}
                {isOpen && (
                    <div className='customQY-header-container'>
                        <div className='customQY-header-content'>
                            <img className='customQY-icon-image-open' src="https://vetetodaystg.wpenginepowered.com/wp-content/uploads/2024/07/Untitled-design-2024-05-11T004813.70.png" alt="Chat Icon" />
                            <div>
                                <div className='customQY-header-static'>Virtual Assistant!</div>
                                <div className='customQY-header-dynamic'>Vet Today</div>
                            </div>
                        </div>
                        <span
                            className="close-icon"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent parent onClick from triggering
                                setIsOpen(false);
                                setIsOpenChatBox(false);
                            }}
                        >
                            
                        </span>
                    </div>
                )}
            </div>

            {/* Chatbox display */}
            {isOpenChatBox && (
                <div className="customQY-chatbot open">
                    {showTyping ? (
                        <div className="customQY-typing">Typing</div>
                    ) : (
                        <div className="customQY-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className="customQY-message">
                                    <p>{msg.text}</p>
                                    <div className="customQY-options">
                                        {msg.options && msg.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                className="customQY-button"
                                                onClick={() => {
                                                    if (msg.response_type === 'redirect' && typeof option.text === 'string' && option.text.startsWith('http')) {
                                                        window.open(option.text, "_blank");
                                                    } else {
                                                        handleOptionClick(option.text, option.id);
                                                    }
                                                }}
                                            >
                                                {option.text || option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default Chatbot;
