import { getToken } from "./token-storage";

const BASE_URL = "https://api.vercel.com";

async function fetchVercel(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("No Vercel token found");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

export async function getUser() {
  return fetchVercel("/v2/user");
}

export async function getTeams() {
  return fetchVercel("/v2/teams");
}

export async function getDeployments(queryParams: URLSearchParams | string) {
  const qs = queryParams.toString();
  return fetchVercel(`/v13/deployments?${qs}`);
}

export async function getDeployment(id: string, queryParam: string = "") {
  return fetchVercel(`/v13/deployments/${id}${queryParam}`);
}

export async function getProject(projectName: string, queryParam: string = "") {
  return fetchVercel(`/v9/projects/${projectName}${queryParam}`);
}

export async function deleteProject(projectName: string, queryParam: string = "") {
  return fetchVercel(`/v9/projects/${projectName}${queryParam}`, {
    method: "DELETE",
  });
}

export async function promoteDeployment(projectId: string, deploymentId: string, queryParam: string = "") {
  return fetchVercel(`/v10/projects/${projectId}/promote/${deploymentId}${queryParam}`, {
    method: "POST",
  });
}

export async function rollbackDeployment(projectId: string, deploymentId: string, queryParam: string = "") {
  return fetchVercel(`/v9/projects/${projectId}/rollback/${deploymentId}${queryParam}`, {
    method: "POST",
  });
}

export async function cancelDeployment(deploymentId: string, queryParam: string = "") {
  return fetchVercel(`/v12/deployments/${deploymentId}/cancel${queryParam}`, {
    method: "PATCH",
  });
}

export async function createAlias(deploymentId: string, queryParam: string, alias: string) {
  return fetchVercel(`/v2/deployments/${deploymentId}/aliases${queryParam}`, {
    method: "POST",
    body: JSON.stringify({ alias }),
  });
}

export async function createProject(queryParam: string, body: any) {
  return fetchVercel(`/v10/projects${queryParam}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createDeployment(queryParam: string, body: any) {
  return fetchVercel(`/v13/deployments${queryParam}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
