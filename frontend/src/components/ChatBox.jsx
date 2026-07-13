function ChatBox({
  activeChatTaskId,
  messages,
  user,
  profile,
  messageInputRef,
  messageText,
  setMessageText,
  cerrarChat,
  enviarMensaje,
}) {
  if (!activeChatTaskId) return null;

  return (
    <div className="card">
      <h2>💬 Chat del mandado #{activeChatTaskId}</h2>

      <button
        onClick={cerrarChat}
        className="button button-danger"
      >
        Cerrar chat
      </button>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p className="empty">No hay mensajes.</p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={
              msg.senderId === user.id
                ? "chat-bubble chat-bubble-me"
                : "chat-bubble chat-bubble-other"
            }
          >
            <div className="chat-sender-row">
              {(msg.sender?.profilePhotoUrl ||
                profile?.profilePhotoUrl) && (
                <img
                  src={
                    msg.senderId === user.id
                      ? profile?.profilePhotoUrl
                      : msg.sender?.profilePhotoUrl
                  }
                  alt="Perfil"
                  className="chat-avatar"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}

              <span className="chat-sender">
                {msg.senderId === user.id ? "Tú" : "Otro"}
              </span>
            </div>

            {msg.text}
          </div>
        ))}
      </div>

      <input
        ref={messageInputRef}
        className="input"
        placeholder="Escribe un mensaje"
        value={messageText}
        onChange={(event) => {
          setMessageText(event.target.value);

          setTimeout(() => {
            messageInputRef.current?.focus();
          }, 0);
        }}
      />

      <button
        onClick={enviarMensaje}
        className="button button-success"
      >
        Enviar mensaje
      </button>
    </div>
  );
}

export default ChatBox;