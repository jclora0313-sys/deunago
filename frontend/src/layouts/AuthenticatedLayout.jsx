import Sidebar from "../components/Sidebar";
import NotificationsFeed from "../components/NotificationsFeed";
import ChatBox from "../components/ChatBox";

function AuthenticatedLayout({
  user,
  logoIcon,
  logout,
  activeSection,
  setActiveSection,

  notifications,
  cargarNotificaciones,
  marcarNotificacionLeida,

  activeChatTaskId,
  messages,
  profile,
  messageInputRef,
  messageText,
  setMessageText,
  cerrarChat,
  enviarMensaje,

  children,
}) {
  return (
    <div className="app-layout">
      <Sidebar
        user={user}
        logoIcon={logoIcon}
        logout={logout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="app-content">
        <NotificationsFeed
          notifications={notifications}
          cargarNotificaciones={cargarNotificaciones}
          marcarNotificacionLeida={marcarNotificacionLeida}
        />

        <div id="chat-section"></div>

        <ChatBox
          activeChatTaskId={activeChatTaskId}
          messages={messages}
          user={user}
          profile={profile}
          messageInputRef={messageInputRef}
          messageText={messageText}
          setMessageText={setMessageText}
          cerrarChat={cerrarChat}
          enviarMensaje={enviarMensaje}
        />

        {children}
      </main>
    </div>
  );
}

export default AuthenticatedLayout;
