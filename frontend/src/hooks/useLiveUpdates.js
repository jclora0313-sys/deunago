import { useEffect } from "react";

function useLiveUpdates({
  user,
  actualizarUbicacionRunnerEnVivo,
  cargarRunnersEnVivo,
  cargarMandadosActivos,
}) {
  useEffect(() => {
    if (user?.role !== "RUNNER") return;

    actualizarUbicacionRunnerEnVivo();

    const interval = setInterval(() => {
      actualizarUbicacionRunnerEnVivo();
    }, 15000);

    return () => clearInterval(interval);
  }, [user?.role, actualizarUbicacionRunnerEnVivo]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    cargarRunnersEnVivo();
    cargarMandadosActivos();

    const interval = setInterval(() => {
      cargarRunnersEnVivo();
      cargarMandadosActivos();
    }, 15000);

    return () => clearInterval(interval);
  }, [
    user?.role,
    cargarRunnersEnVivo,
    cargarMandadosActivos,
  ]);
}

export default useLiveUpdates;