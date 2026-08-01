function RunnerDocuments({
  user,
  setIdentificationFile,
  setLicenseFile,
  subirIdentificacion,
  subirLicencia,
}) {
  return (
    <>
      <div className="upload-card">
        <h3>🪪 Identificación</h3>

        {user.identificationUrl && (
          <a
            href={user.identificationUrl}
            target="_blank"
            rel="noreferrer"
            className="document-link"
          >
            Ver identificación subida
          </a>
        )}

        <input
          type="file"
          className="input"
          onChange={(event) =>
            setIdentificationFile(event.target.files?.[0] || null)
          }
        />

        <button
          onClick={subirIdentificacion}
          className="button button-primary"
        >
          Subir identificación
        </button>
      </div>

      <div className="upload-card">
        <h3>🚗 Licencia de conducir</h3>

        {user.licenseUrl && (
          <a
            href={user.licenseUrl}
            target="_blank"
            rel="noreferrer"
            className="document-link"
          >
            Ver licencia subida
          </a>
        )}

        <input
          type="file"
          className="input"
          onChange={(event) =>
            setLicenseFile(event.target.files?.[0] || null)
          }
        />

        <button
          onClick={subirLicencia}
          className="button button-primary"
        >
          Subir licencia
        </button>
      </div>
    </>
  );
}

export default RunnerDocuments;