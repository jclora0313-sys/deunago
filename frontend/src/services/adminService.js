import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const getAdminUsers = async (headers) => {
  const res = await axios.get(`${API_URL}/admin/users`, headers);
  return res.data;
};

export const getAdminStats = async (headers) => {
  const res = await axios.get(`${API_URL}/admin/stats`, headers);
  return res.data;
};

export const getAdminTasks = async (headers) => {
  const res = await axios.get(`${API_URL}/admin/tasks`, headers);
  return res.data;
};

export const validateRunnerIdentification = async (userId, headers) => {
  const res = await axios.patch(
    `${API_URL}/admin/users/${userId}/validate-identification`,
    {},
    headers
  );
  return res.data;
};

export const validateRunnerLicense = async (userId, headers) => {
  const res = await axios.patch(
    `${API_URL}/admin/users/${userId}/validate-license`,
    {},
    headers
  );
  return res.data;
};

export const approveRunner = async (userId, headers) => {
  const res = await axios.patch(
    `${API_URL}/admin/users/${userId}/approve-runner`,
    {},
    headers
  );
  return res.data;
};

export const validateTaskPayment = async (taskId, headers) => {
  const res = await axios.patch(
    `${API_URL}/admin/tasks/${taskId}/validate-payment`,
    {},
    headers
  );
  return res.data;
};

export const payRunner = async (taskId, headers) => {
  const res = await axios.patch(
    `${API_URL}/admin/tasks/${taskId}/pay-runner`,
    {},
    headers
  );
  return res.data;
};