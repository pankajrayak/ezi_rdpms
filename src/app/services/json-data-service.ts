import { HttpClient, HttpContext, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CACHE_TIME_MS, IS_CACHE_ENABLE } from '@rdpms/shared/utility';
import { map, Observable } from 'rxjs';
import { API_ENDPOINT } from '@rdpms/shared/utility';

@Injectable({ providedIn: 'root' })
export class DataService {

  private http = inject(HttpClient);
  private contextPath = API_ENDPOINT.BACKEND_PREFIX;

  getZonesResource(){
    return httpResource<any[]>(() => {
      const params: Record<string, string> = { }
      return  {url: 'json-data/zones.json',  method: 'GET', params: params }
    });
  }

  getZones(): Observable<any[]> {
    return this.http.get<any[]>('json-data/zones.json');
  }

  getDivisions(zone: string): Observable<any[]> {
    return this.http.get<Record<string, any[]>>('json-data/divisions.json').pipe(
      map(data => data[zone] || [])
    );
  }

  // Get Stations filtered by Division
  getStations(division: string): Observable<any[]> {
    return this.http.get<Record<string, any[]>>('json-data/stations.json').pipe(
      map(data => data[division] || [])
    );
  }

  getAlertTypes(): Observable<string[]> {
    const context =  new HttpContext().set(IS_CACHE_ENABLE, true).set(CACHE_TIME_MS, 1000 * 60 * 10);
    return this.http.get<string[]>('json-data/alert-types.json', { context: context });
  }

  getAssetTypes(): Observable<string[]> {
    return this.http.get<string[]>('json-data/asset-types.json');
  }

  searchData(payload: any) : Observable<any> {
    return this.http.post('https://example.com', payload);
  }

  getPagedRecord(page: number, size: number, fv: any) : Observable<any> {
    return this.http.get('json-data/data.json').pipe(
      map((records: any) => {
        const filtered = fv?.station ? records.filter((r: any) => r.stn.toLowerCase().includes(fv.station.toLowerCase())) : records;
        const start = (page - 1) * size;
        const end = start + size;
        const pagedData = filtered.slice(start, end);
        
        return { data: pagedData, total: filtered?.length, page: page, size: size }
      })
    );
  }

  updateRecord(id: number, payload: any) : Observable<any> {
    return this.http.put('https://example.com', payload);
  }

  deleteRecord(id: number) : Observable<any> {
    return this.http.delete('https://example.com');
  }

}
