// Simplified logic for the Talking Intern
const handleChat = async (input) => {
    const response = await axios.post('/api/agent/chat', { 
      message: input,
      role: 'Marketing Intern' 
    });
    setChatHistory([...chatHistory, { user: input, ai: response.data.reply }]);
  };