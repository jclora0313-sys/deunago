import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export default function useChat(showToast) {
  const [activeChatTaskId, setActiveChatTaskId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const abrirChat = async (taskId) => {
    try {
      const res = await axios.get(
        `${API_URL}/tasks/${taskId}/messages`,
        getAuthHeaders()
      );

      setActiveChatTaskId(taskId);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error abriendo chat:", error);

      showToast(
        error.response?.data?.message ||
          "No se pudo abrir el chat del mandado",
        "error"
      );
    }
  };

  const enviarMensaje = async () => {
    if (!messageText.trim()) {
      showToast("Escribe un mensaje", "error");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/tasks/${activeChatTaskId}/messages`,
        { text: messageText },
        getAuthHeaders()
      );

      setMessageText("");
    } catch (error) {
      console.error("Error enviando mensaje:", error);

      showToast(
        error.response?.data?.message ||
          "No se pudo enviar el mensaje",
        "error"
      );
    }
  };

  const cerrarChat = () => {
    setActiveChatTaskId(null);
    setMessages([]);
    setMessageText("");
  };

  return {
    activeChatTaskId,
    setActiveChatTaskId,
    messages,
    setMessages,
    messageText,
    setMessageText,
    abrirChat,
    enviarMensaje,
    cerrarChat,
  };
}