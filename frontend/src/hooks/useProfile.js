import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getUploadHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "multipart/form-data",
  },
});

export default function useProfile(showToast) {
  const [profile, setProfile] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [vehicleType, setVehicleType] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [bio, setBio] = useState("");

  const cargarPerfil = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/users/me`,
        getAuthHeaders()
      );

      setProfile(res.data);
      setProfileName(res.data.name || "");
      setProfileAddress(res.data.mainAddress || "");
      setVehicleType(res.data.vehicleType || "");
      setVehiclePlate(res.data.vehiclePlate || "");
      setBio(res.data.bio || "");
    } catch (error) {
      console.error("Error cargando perfil:", error);

      showToast(
        error.response?.data?.message ||
          "No se pudo cargar el perfil",
        "error"
      );
    }
  };

  const guardarPerfil = async () => {
    try {
      const res = await axios.patch(
        `${API_URL}/users/me`,
        {
          name: profileName,
          mainAddress: profileAddress,
          vehicleType,
          vehiclePlate,
          bio,
        },
        getAuthHeaders()
      );

      setProfile(res.data);
      showToast("Perfil actualizado", "success");
    } catch (error) {
      console.error("Error actualizando perfil:", error);

      showToast(
        error.response?.data?.message ||
          "Error actualizando perfil",
        "error"
      );
    }
  };

  const subirFotoPerfil = async () => {
    try {
      if (!profilePhotoFile) {
        showToast("Selecciona una foto", "error");
        return;
      }

      const formData = new FormData();
      formData.append("file", profilePhotoFile);

      const res = await axios.post(
        `${API_URL}/users/me/photo`,
        formData,
        getUploadHeaders()
      );

      setProfile(res.data);
      setProfilePhotoFile(null);

      showToast("Foto de perfil subida", "success");
    } catch (error) {
      console.error("Error subiendo foto:", error);

      showToast(
        error.response?.data?.message ||
          "Error subiendo foto",
        "error"
      );
    }
  };

  return {
    profile,
    setProfile,

    profileName,
    setProfileName,

    profileAddress,
    setProfileAddress,

    profilePhotoFile,
    setProfilePhotoFile,

    vehicleType,
    setVehicleType,

    vehiclePlate,
    setVehiclePlate,

    bio,
    setBio,

    cargarPerfil,
    guardarPerfil,
    subirFotoPerfil,
  };
}