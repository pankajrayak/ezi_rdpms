import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { API_ENDPOINT } from '@rdpms/shared/utility';
import { Observable } from 'rxjs';

export interface AlertDetail {
  zone?: string;
  division?: string;
  station?: string;
  alertType?: string;
  assetType?: string;
  assetNumber?: string;
  cause?: string;
  alertFeedback?: string;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;
}

@Service()
export class AlertService {

  private http = inject(HttpClient);
  private contextPath = API_ENDPOINT.BACKEND_PREFIX;

  getAlertListResource(){
    return httpResource<any[]>(() => {
      return  { url: `${this.contextPath}/alerts`,  method: 'GET' }
    });
  }
  
  getAlertHistoryListResource() {
    return httpResource<any[]>(() => {
      return  { url: `${this.contextPath}/alerts/history`,  method: 'GET' }
    });
  }

  postAlert(payload: any): Observable<any> {
    return this.http.post<any>(`${this.contextPath}/alerts/test-trigger`, payload);
  }

  postAlertFeedback(alertId: any, payload: any): Observable<any> {
    return this.http.post<any>(`${this.contextPath}/alerts/${alertId}/feedback`, payload);
  }
  
  getAlertLiveStatusSummary(param: Partial<AlertDetail>): Observable<any> {
    let url = `${this.contextPath}/alert_live_status_count`;
    if(param.zone) { url += `/${param.zone}` }
    if(param.division) { url += `/${param.division}` }
    if(param.station) { url += `/${param.station}` }
    if(param.alertType) { url += `/${param.alertType}` }
    if(param.assetType) { url += `/${param.assetType}` }

    return this.http.get(url);
  }

  getAlertLiveStatusList(param: Partial<AlertDetail>): Observable<any> {
    let url = `${this.contextPath}/live_alert_status`;
    if(param.zone) { url += `/${param.zone}` }
    if(param.division) { url += `/${param.division}` }
    if(param.station) { url += `/${param.station}` }
    if(param.alertType) { url += `/${param.alertType}` }
    if(param.assetType) { url += `/${param.assetType}` }

    return this.http.get(url);
  }

  getAlertDetailList(param: Partial<AlertDetail>): Observable<any> {
    let url = `${this.contextPath}/view_alert_detail_report`;
    if(param.zone) { url += `/${param.zone}` }
    if(param.division) { url += `/${param.division}` }
    if(param.station) { url += `/${param.station}` }
    if(param.alertType) { url += `/${param.alertType}` }
    if(param.assetType) { url += `/${param.assetType}` }
    if(param.assetNumber) { url += `/${param.assetNumber}` }
    if(param.cause) { url += `/${param.cause}` }
    if(param.alertFeedback) { url += `/${param.alertFeedback}` }
    if(param.fromDate) { url += `/${param.fromDate}` }
    if(param.fromTime) { url += `/${param.fromTime}` }
    if(param.toDate) { url += `/${param.toDate}` }
    if(param.toTime) { url += `/${param.toTime}` }
    
    return this.http.get(url);
  }
}
