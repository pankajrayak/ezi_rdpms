import { HttpClient, HttpContext, httpResource } from '@angular/common/http';
import { inject, Service, Signal } from '@angular/core';
import { API_ENDPOINT, IS_CACHE_ENABLE } from '@rdpms/shared/utility';
import { Observable } from 'rxjs';

@Service()
export class InputService {

  private http = inject(HttpClient);
  private contextPath = API_ENDPOINT.BACKEND_PREFIX;

  getZoneListResource() {
    return httpResource<any[]>(() => {
      const context = new HttpContext().set(IS_CACHE_ENABLE, true);
      return { url: `${this.contextPath}/zones`, method: 'GET' }
      // return { url: `${this.contextPath}/zones`, method: 'GET', context: context }
    });
  }

  getDivisionListResource(zoneIdSignal: Signal<string | undefined>) {
    return httpResource<any[]>(() => {
      const zoneId = zoneIdSignal();
      if(!zoneId || zoneId === 'All') return undefined; 
      return { url: `${this.contextPath}/zones/${zoneId}/divisions`, method: 'GET' };
    });
  }

  getStationListResource(zoneIdSignal: Signal<string | undefined>, divisionIdSignal: Signal<string | undefined>) {
    return httpResource<any[]>(() => {
      const zoneId = zoneIdSignal();
      const divisionId = divisionIdSignal();
      if(!zoneId || !divisionId || zoneId === 'All' || divisionId === 'All') return undefined;
      return { url: `${this.contextPath}/zones/${zoneId}/divisions/${divisionId}/stations`, method: 'GET' };
    });
  }

  getAlertTypeListResource(){
    return httpResource<any[]>(() => {
      return { url: `${this.contextPath}/master/view_alert_type`,  method: 'GET' }
    });
  }

  getAssetTypeListResource(){
    return httpResource<any[]>(() => {
      return { url: `${this.contextPath}/view_asset_type`,  method: 'GET' }
    });
  }
  
  getGearSummary({zone, division, station}: any): Observable<any> {
    return this.http.get(`${this.contextPath}/get_gears_summary/${zone}/${division}/${station}`);
  }

  getDashboardStatusCount(param: any): Observable<any> {
    let url = `${this.contextPath}/dashboard/rdpms_dashboard_status_count`;
    if(param.zone) { url += `/${param.zone}` }
    if(param.division) { url += `/${param.division}` }
    if(param.station) { url += `/${param.station}` }
    if(param.alertType) { url += `/${param.alertType}` }
    if(param.assetType) { url += `/${param.assetType}` }

    return this.http.get(url);
  }

}
