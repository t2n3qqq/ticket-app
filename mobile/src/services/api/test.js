import apiClient from '../apiClient';

class Test {
  baseUrl = '/test';

  get() {
    return apiClient.get(`${this.baseUrl}`);
  }

  // list(conditions) {
  //   return apiClient.get(`${this.baseUrl}`, conditions);
  // }

  // close(contractId) {
  //   return apiClient.put(`${this.baseUrl}/${contractId}/close`);
  // }
}

export default new Test();
