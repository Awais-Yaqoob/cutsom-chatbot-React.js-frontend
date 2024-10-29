import React, { useState, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [allQuestions, setAllQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

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
                            options: initialQuestion.response_data || [],
                            id: initialQuestion.id,
                            response_type: initialQuestion.response_type,
                        }]);
                    }
                }
            })
            .catch((error) => console.error("Error fetching chatbot questions:", error));
    }, []);

    const handleOptionClick = (optionText, optionId) => {
        const nextQuestions = allQuestions.filter((item) => {
            if (item.parent_id) {
                let parentIds;
                try {
                    parentIds = JSON.parse(item.parent_id);
                } catch {
                    parentIds = item.parent_id;
                }
                const isChild = Array.isArray(parentIds)
                    ? parentIds.map(Number).includes(Number(optionId))
                    : Number(parentIds) === Number(optionId);

                if (isChild) {
                    return true;
                }
            }
            return false;
        });

        if (nextQuestions.length > 0) {
            const nextQuestion = nextQuestions[0];
            if (nextQuestion.response_type === 'redirect') {
                const redirectUrl = nextQuestion.response_data;
                if (redirectUrl) {
                    window.open(redirectUrl, "_blank");
                }
            } 

            const nextMessages = nextQuestions.map((nextQuestion) => ({
                text: nextQuestion.question,
                options: nextQuestion.response_data || [],
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
        <div className={`customQY-chatbot ${isOpen ? 'open' : 'closed'}`}>
            <div className="customQY-header" onClick={() => setIsOpen(!isOpen)}>
                Chat with us!
            </div>
            {isOpen && (
                <div className="customQY-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className="customQY-message">
                            <p>{msg.text}</p>
                            <div className="customQY-options">
                                {msg.options && msg.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        className="customQY-button"
                                        onClick={() =>
                                            msg.response_type === 'redirect'
                                                ? window.open(option.text, "_blank")
                                                : handleOptionClick(option.text, option.id)
                                        }
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
    );
};

export default Chatbot;
