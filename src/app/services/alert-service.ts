import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
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
  view?: string;
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
    let httpParams = new HttpParams();
    if(param.zone && param.zone !== 'All'){ httpParams = httpParams.append('zone', param.zone); }
    if(param.division && param.division !== 'All'){ httpParams = httpParams.append('division', param.division);}
    if(param.station && param.station !== 'All'){ httpParams = httpParams.append('station', param.station);}
    if(param.alertType && param.alertType !== 'All'){ httpParams = httpParams.append('alertType', param.alertType);}
    if(param.assetType && param.assetType !== 'All'){ httpParams = httpParams.append('assetType', param.assetType); }
    
    let options: any = {params: httpParams};
    return this.http.get(`${this.contextPath}/alert_live_status_count`, options);
  }

  getAlertLiveStatusList(param: Partial<AlertDetail>, timeStamp?: string): Observable<any> {
    let httpParams = new HttpParams();
    if(timeStamp){ httpParams = httpParams.append('receivedDateTime', timeStamp); }
    if(param.zone && param.zone !== 'All'){ httpParams = httpParams.append('zone', param.zone); }
    if(param.division && param.division !== 'All'){ httpParams = httpParams.append('division', param.division);}
    if(param.station && param.station !== 'All'){ httpParams = httpParams.append('station', param.station);}
    if(param.alertType && param.alertType !== 'All'){ httpParams = httpParams.append('alertType', param.alertType);}
    if(param.assetType && param.assetType !== 'All'){ httpParams = httpParams.append('assetType', param.assetType); }

    let options: any = {params: httpParams};
    return this.http.get(`${this.contextPath}/live_alert_status`, options);
  }

  getAlertDetailList(param: Partial<AlertDetail>): Observable<any> {
    let httpParams = new HttpParams();
    if(param.zone && param.zone !== 'All'){ httpParams = httpParams.append('zone', param.zone); }
    if(param.division && param.division !== 'All'){ httpParams = httpParams.append('division', param.division);}
    if(param.station && param.station !== 'All'){ httpParams = httpParams.append('station', param.station);}
    if(param.alertType && param.alertType !== 'All'){ httpParams = httpParams.append('alertType', param.alertType);}
    if(param.assetType && param.assetType !== 'All'){ httpParams = httpParams.append('assetType', param.assetType); }
    if(param.assetNumber) {httpParams = httpParams.append('assetNumber', param.assetNumber);}
    if(param.cause) { httpParams = httpParams.append('cause', param.cause);}
    if(param.alertFeedback) {httpParams = httpParams.append('alertFeedback', param.alertFeedback);}
    if(param.fromDate) {httpParams = httpParams.append('fromDate', param.fromDate);}
    if(param.fromTime) {httpParams = httpParams.append('fromTime', param.fromTime);}
    if(param.toDate) {httpParams = httpParams.append('toDate', param.toDate);}
    if(param.toTime) {httpParams = httpParams.append('toTime', param.toTime);}
    
    let options: any = {params: httpParams};
    return this.http.get(`${this.contextPath}/view_alert_detail_report`, options);
  }}
