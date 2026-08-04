function LandingPage({
  logoFull,
  mode,
  setMode,
  name,
  setName,
  phone,
  setPhone,
  password,
  setPassword,
  role,
  setRole,
  login,
  register,
}) {
  return (
    <>
      <div className="landing-logo-wrap">
        <img
          src={logoFull}
          alt="DeUnaGo"
          className="landing-logo-img"
        />
      </div>

      <div className="landing-rating">
        ⭐⭐⭐⭐⭐
        <span>4.9/5 • Cientos de mandados completados</span>
      </div>

      <div className="landing-shell landing-modern">
        <div className="landing-orbits">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <section className="landing-hero">
          <div className="landing-badge">
            🇩🇴 Disponible actualmente en Santiago de los Caballeros
          </div>

          <h1 className="landing-title">
            El mandadero que necesitas,
            <span> cuando lo necesitas.</span>
          </h1>

          <p className="landing-description">
            Solicita mandados en Santiago de los Caballeros en pocos
            segundos. Sigue el recorrido en tiempo real, conversa con tu
            mandadero y recibe todo con seguridad y rapidez.
          </p>

          <div className="landing-stats">
            <div className="landing-stat">
              <strong>⚡</strong>
              <span>Entrega rápida</span>
            </div>

            <div className="landing-stat">
              <strong>🛵</strong>
              <span>Runners verificados</span>
            </div>

            <div className="landing-stat">
              <strong>📍</strong>
              <span>Tracking en vivo</span>
            </div>
          </div>

          <div className="landing-benefits">
            <div>✅ Seguimiento en tiempo real</div>
            <div>🛵 Mandaderos previamente verificados</div>
            <div>🔒 Pagos seguros y comprobantes digitales</div>
            <div>⚡ Servicio disponible en Santiago</div>
          </div>

          <div className="landing-actions">
            <button
              onClick={() => setMode("register")}
              className="button button-primary"
            >
              Crear cuenta
            </button>

            <button
              onClick={() => setMode("login")}
              className="button button-blue"
            >
              Iniciar sesión
            </button>
          </div>

          <div className="landing-features">
            <div>
              <strong>📍 Tracking</strong>
              <span>Ubicación en tiempo real</span>
            </div>

            <div>
              <strong>💳 Pago digital</strong>
              <span>Control de pagos y comisión</span>
            </div>

            <div>
              <strong>🛵 Mandaderos</strong>
              <span>Validación de documentos</span>
            </div>
          </div>
        </section>

        <section className="auth-card landing-auth-card">
          <div className="auth-tabs">
            <button
              onClick={() => setMode("login")}
              className={
                mode === "login"
                  ? "auth-tab active"
                  : "auth-tab"
              }
            >
              Login
            </button>

            <button
              onClick={() => setMode("register")}
              className={
                mode === "register"
                  ? "auth-tab active"
                  : "auth-tab"
              }
            >
              Registro
            </button>
          </div>

          {mode === "login" && (
            <>
              <h2>Bienvenido</h2>

              <p className="auth-subtitle">
                Inicia sesión para continuar
              </p>

              <input
                className="input"
                placeholder="Teléfono"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />

              <input
                className="input"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <button
                onClick={login}
                className="button button-primary auth-main-btn"
              >
                Iniciar sesión
              </button>
            </>
          )}

          {mode === "register" && (
            <>
              <h2>Crear cuenta</h2>

              <p className="auth-subtitle">
                Empieza a usar DeUnaGo hoy
              </p>

              <input
                className="input"
                placeholder="Nombre"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
              />

              <input
                className="input"
                placeholder="Teléfono"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
              />

              <input
                className="input"
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              <select
                className="input"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
              >
                <option value="CLIENT">Cliente</option>
                <option value="RUNNER">Mandadero</option>
              </select>

              <button
                onClick={register}
                className="button button-primary auth-main-btn"
              >
                Crear cuenta
              </button>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default LandingPage;