function SplashScreen({ logoIcon, logoFull }) {
  return (
    <div className="splash-screen">
      <div className="splash-glow"></div>

      <img
        src={logoIcon}
        alt="DeUnaGo"
        className="splash-icon"
      />

      <img
        src={logoFull}
        alt="DeUnaGo"
        className="splash-logo"
      />

      <p className="splash-text">
        Tu mandado en minutos.
      </p>
    </div>
  );
}

export default SplashScreen;