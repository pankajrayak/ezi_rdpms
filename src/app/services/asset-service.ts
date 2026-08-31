import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_ENDPOINT } from '@rdpms/shared/utility';

@Service()
export class AssetService {

  private http = inject(HttpClient);
  private contextPath = API_ENDPOINT.BACKEND_PREFIX;

}
