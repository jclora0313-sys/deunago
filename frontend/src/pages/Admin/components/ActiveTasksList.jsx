function ActiveTasksList({
  activeTasks = [],
  getBadgeClass,
  getStatusText,
  cargarMandadosActivos,
}) {
  if (activeTasks.length === 0) return null;

  return (
    <div className="card">
      <h2>📦 Mandados activos</h2>

      {activeTasks.map((task) => (
        <div key={task.id} className="task-card">
          <div className={getBadgeClass(task.status)}>
            {getStatusText(task.status)}
          </div>

          <h3>Mandado #{task.id}</h3>

          <p>{task.description}</p>
          <p>Precio: RD${task.estimatedPrice}</p>
          <p>Ganancia runner: RD${task.runnerEarnings}</p>

          <button
            onClick={cargarMandadosActivos}
            className="button button-primary"
          >
            Actualizar
          </button>
        </div>
      ))}
    </div>
  );
}

export default ActiveTasksList;