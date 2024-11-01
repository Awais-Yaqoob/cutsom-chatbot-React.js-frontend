import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [allQuestions, setAllQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isOpenIcon, setIsOpenIcon] = useState(true); // Initial icon view
    const [isExpandedHeader, setIsExpandedHeader] = useState(false); // Expanded header view
    const [isOpenChatBox, setIsOpenChatBox] = useState(false); // Chatbot with header at top
    const messagesEndRef = useRef(null);

    const apiUrl = `https://vetetodaystg.wpenginepowered.com/wp-json/chatbot/v1`;

    useEffect(() => {
        fetch(`${apiUrl}/questions`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.length > 0) {
                    setAllQuestions(data);
                    const initialQuestion = data.find(item => !item.parent_id);
                    if (initialQuestion) {
                        setMessages([{
                            text: initialQuestion.question,
                            options: initialQuestion.response_data,
                            id: initialQuestion.id,
                            response_type: initialQuestion.response_type,
                        }]);
                    }
                }
            })
            .catch((error) => console.error("Error fetching chatbot questions:", error));
    }, []);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);
    

    const handleIconClick = () => {
        setIsOpenIcon(false);
        setIsExpandedHeader(true);
    };

    const handleHeaderClick = () => {
        setIsExpandedHeader(false);
        setIsOpenChatBox(true);
    };

    const handleChatboxClose = () => {
        setIsOpenChatBox(false);
        setIsExpandedHeader(true);
    };

    const handleExpandedHeaderClose = () => {
        setIsExpandedHeader(false);
        setIsOpenIcon(true);
    };

    const handleOptionClick = (optionText, optionId) => {
        const nextQuestions = allQuestions.filter((item) => {
            if (item.parent_id) {
                let parentIds;
                try {
                    parentIds = JSON.parse(item.parent_id);
                } catch {
                    parentIds = [item.parent_id];
                }
                const normalizedParentIds = Array.isArray(parentIds)
                    ? parentIds.map(Number)
                    : [Number(parentIds)];
                return normalizedParentIds.includes(Number(optionId));
            }
            return false;
        });

        if (nextQuestions.length > 0) {
            nextQuestions.forEach((nextQuestion) => {
                if (nextQuestion.response_type === 'redirect' && nextQuestion.response_data) {
                    window.open(nextQuestion.response_data, "_blank");
                } else {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            text: nextQuestion.question,
                            options: getOptionsForQuestion(nextQuestion.id),
                            id: nextQuestion.id,
                            response_type: nextQuestion.response_type,
                        },
                    ]);
                }
            });
        }
    };


    const getOptionsForQuestion = (questionId) => {
        const childQuestions = allQuestions.filter((item) => {
            if (item.parent_id) {
                let parentIds;
                try {
                    parentIds = JSON.parse(item.parent_id);
                } catch {
                    parentIds = [item.parent_id];
                }
                const normalizedParentIds = Array.isArray(parentIds)
                    ? parentIds.map(Number)
                    : [Number(parentIds)];
                return normalizedParentIds.includes(Number(questionId));
            }
            return false;
        });
        return childQuestions.map((child) => ({
            id: child.id,
            text: child.question,
        }));
    };
    
    return (
        <>
            {/* Icon */}
            {isOpenIcon && (
                <div className="customQY-chatbot-icon" onClick={handleIconClick}>
                    <img className="customQY-icon-image" src="https://vetetodaystg.wpenginepowered.com/wp-content/uploads/2024/07/Untitled-design-2024-05-11T004813.70.png" alt="Chat Icon" />
                    <span className="customQY-active-indicator"></span>
                </div>
            )}

            {/* Expanded Header */}
            {isExpandedHeader && (
                <div className="customQY-chatbot-icon open" onClick={handleHeaderClick}>
                    <div className="customQY-header-content">
                        <div className='customQY-header-container'>
                        <img className="customQY-icon-image-open" src="https://vetetodaystg.wpenginepowered.com/wp-content/uploads/2024/07/Untitled-design-2024-05-11T004813.70.png" alt="Chat Icon" />
                        <div>
                            <div className="customQY-header-static">Virtual Assistant!</div>
                            <div className="customQY-header-dynamic">Your Company</div>
                        </div></div>
                        <span className="close-icon" onClick={(e) => { e.stopPropagation(); handleExpandedHeaderClose(); }}></span>
                    </div>
                </div>
            )}

            {/* Chatbot with Header Inside */}
            {isOpenChatBox && (
                <div className="customQY-chatbot open">
                    <div className="customQY-header-container">
                        <div className="customQY-header-content">
                            <img className="customQY-icon-image-open" src="https://vetetodaystg.wpenginepowered.com/wp-content/uploads/2024/07/Untitled-design-2024-05-11T004813.70.png" alt="Chat Icon" />
                            <div>
                                <div className="customQY-header-static">Virtual Assistant!</div>
                                <div className="customQY-header-dynamic">Your Company</div>
                            </div></div>
                            <span className="close-icon" onClick={(e) => { e.stopPropagation(); handleChatboxClose(); }}></span>
                        
                    </div>
                    <div className="customQY-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className="customQY-message">
                                <p>{msg.text}</p>
                                <div className="customQY-options">
                                    {msg.options && msg.options.map((option, idx) => (
                                        <button
                                            key={idx}
                                            className="customQY-button"
                                            onClick={() => handleOptionClick(option.text, option.id)}
                                        >
                                            {option.text || option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef}></div> {/* Scroll-to-end reference */}
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
