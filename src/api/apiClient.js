import { httpClient } from "./httpClient";
import { mockRequest } from "./mock/mockServer";
import { USE_MOCK_API } from "./config";

/**
 * Thin, axios-shaped facade over the data layer. Every hook in `src/hooks/api`
 * is written against this interface, not against axios or the mock server directly -
 * so pointing the app at a real backend is a one-line change in `src/api/config.js`.
 */
export const apiClient = {
  async get(url, config = {}) {
    if (USE_MOCK_API) {
      const data = await mockRequest("get", url, { params: config.params });
      return { data };
    }
    return httpClient.get(url, config);
  },

  async post(url, body, config = {}) {
    if (USE_MOCK_API) {
      const data = await mockRequest("post", url, { params: config.params, data: body });
      return { data };
    }
    return httpClient.post(url, body, config);
  },

  async put(url, body, config = {}) {
    if (USE_MOCK_API) {
      const data = await mockRequest("put", url, { params: config.params, data: body });
      return { data };
    }
    return httpClient.put(url, body, config);
  },

  async patch(url, body, config = {}) {
    if (USE_MOCK_API) {
      const data = await mockRequest("patch", url, { params: config.params, data: body });
      return { data };
    }
    return httpClient.patch(url, body, config);
  },

  async delete(url, config = {}) {
    if (USE_MOCK_API) {
      const data = await mockRequest("delete", url, { params: config.params });
      return { data };
    }
    return httpClient.delete(url, config);
  },
};
