import { HttpClient, HttpContext, HttpParams, httpResource } from '@angular/common/http';
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
      const params: Record<string, string> = {};
      if(zoneId && zoneId !== 'All'){ params['zoneId'] = zoneId; }

      return { url: `${this.contextPath}/divisions`, method: 'GET', params };
    });
  }

  getStationListResource(zoneIdSignal: Signal<string | undefined>, divisionIdSignal: Signal<string | undefined>) {
    return httpResource<any[]>(() => {
      const zoneId = zoneIdSignal();
      const divisionId = divisionIdSignal();
      
      const params: Record<string, string> = {};
      if(zoneId && zoneId !== 'All'){ params['zoneId'] = zoneId; }
      if(divisionId && divisionId !== 'All'){ params['divisionId'] = divisionId; }

      return { url: `${this.contextPath}/stations`, method: 'GET', params };
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
    let httpParams = new HttpParams();
    if(param.zone && param.zone !== 'All'){ httpParams = httpParams.append('zone', param.zone); }
    if(param.division && param.division !== 'All'){ httpParams = httpParams.append('division', param.division);}
    if(param.station && param.station !== 'All'){ httpParams = httpParams.append('station', param.station);}

    let options: any = {params: httpParams};
    return this.http.get(`${this.contextPath}/dashboard/rdpms_dashboard_status_count`, options);
  }

}
