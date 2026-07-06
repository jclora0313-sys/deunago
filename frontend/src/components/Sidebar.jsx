function Sidebar({ user, logoIcon, logout, activeSection, setActiveSection }) {
  const goToSection = (section, id) => {
    setActiveSection(section);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoIcon} alt="DeUnaGo" className="sidebar-logo" />
        <div>
          <strong>DeUnaGo</strong>
          <span>Santiago 🇩🇴</span>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      <button className={`sidebar-item ${activeSection === "dashboard" ? "active" : ""}`} onClick={() => goToSection("dashboard", "dashboard-section")}>🏠 Dashboard</button>
      <button className={`sidebar-item ${activeSection === "profile" ? "active" : ""}`} onClick={() => goToSection("profile", "profile-section")}>👤 Perfil</button>
      <button className={`sidebar-item ${activeSection === "tasks" ? "active" : ""}`} onClick={() => goToSection("tasks", "tasks-section")}>📦 Mandados</button>
      <button className={`sidebar-item ${activeSection === "chat" ? "active" : ""}`} onClick={() => goToSection("chat", "chat-section")}>💬 Chat</button>
      <button className={`sidebar-item ${activeSection === "notifications" ? "active" : ""}`} onClick={() => goToSection("notifications", "notifications-section")}>🔔 Notificaciones</button>

      {user.role === "ADMIN" && (
        <>
          <div className="sidebar-section-label">Administración</div>
          <button className={`sidebar-item ${activeSection === "users" ? "active" : ""}`} onClick={() => goToSection("users", "users-section")}>👥 Usuarios</button>
          <button className={`sidebar-item ${activeSection === "payments" ? "active" : ""}`} onClick={() => goToSection("payments", "payments-section")}>💰 Pagos</button>
          <button className={`sidebar-item ${activeSection === "map" ? "active" : ""}`} onClick={() => goToSection("map", "admin-map-section")}>🗺️ Mapa</button>
        </>
      )}

      <div className="sidebar-divider"></div>

      <div className="sidebar-user">
        <strong>{user.name}</strong>
        <span>{user.role}</span>
      </div>

      <button onClick={logout} className="sidebar-item sidebar-logout">
        🚪 Cerrar sesión
      </button>
    </aside>
  );
}

export default Sidebar;