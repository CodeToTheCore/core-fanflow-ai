// frontend/src/components/AgentSettings.jsx
const connectLinkedIn = async (cookieValue) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/agent/linkedin/connect`, {
      token: cookieValue
    });
    alert("LinkedIn Agent is now Online and Intelligent.");
  };