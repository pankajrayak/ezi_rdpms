import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header-component/page-header-component';
import { finalize, of } from 'rxjs';
import { GlobalUtil } from '../../../utility/global-util';
import { DataService } from '../../../utility/json-data-service';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { rxResource } from '@angular/core/rxjs-interop';

interface sensorFormModel {
  zone: string;
  division: string;
  station: string;
  assetType: string;
  assetNumber: string;
  fromDate: string;
  toDate: string;
  view: string;
}

@Component({
  selector: 'app-asset-utilization-component',
  imports: [CommonModule, FormField, PageHeaderComponent],
  templateUrl: './asset-utilization-component.html',
  styleUrl: './asset-utilization-component.css',
})
export class AssetUtilizationComponent {
  
  private dataService = inject(DataService);
  public globalUtility = inject(GlobalUtil);
  
  formModel: sensorFormModel = { zone: '', division: '', station: '', assetType: 'All', assetNumber: '', fromDate: '',  toDate: '', view: 'Table' };

  model = signal(this.formModel);

  f = form(this.model, (s) => {
    disabled(s, () => this.isSubmitting());

    required(s.zone);
    
    required(s.division);
    disabled(s.division, () => !this.model().zone || this.divisionsRes.isLoading());

    required(s.station);
    disabled(s.station, ({ valueOf }) => !valueOf(s.division) || this.stationsRes.isLoading());
    
    required(s.assetType);
    required(s.assetNumber);
    required(s.fromDate);
    required(s.view);
  });

  zonesRes = rxResource({ stream: () => this.dataService.getZones() ?? of([]) });
  assetTypesRes = rxResource({ stream: () => this.dataService.getAssetTypes() ?? of([]) });
  assetNumbersRes = rxResource({ stream: () => of(['001', '002', '003', '004']) })
  viewsRes = rxResource({ stream: () => of(['Table', 'Pie', 'Bar', 'Graph']) })
  
  divisionsRes = rxResource({
    params: () => this.model().zone,
    stream: ({ params: z }) => z ? this.dataService.getDivisions(z) : of([]),
  });

  stationsRes = rxResource({
    params: () => this.model().division,
    stream: ({ params: d }) => d ? this.dataService.getStations(d) : of([])
  });

  stationEffect = effect(() =>{
    const error = this.stationsRes.error();
    if(error){ console.error('station not found', error); }
  })

  isSubmitting = signal(false);
  records = signal(<any>[]);

  onZoneChange(){
    this.f.division().reset(); this.f.station().reset();
    this.model.update(m => ({ ...m, division: '', station: '' }));
  }

  onDivisionChange(){
    this.f.station().reset();
    this.model.update(m => ({ ...m, station: '' }));
  }

  onDateTimeChange(event: Event){
    const input = (event.target as HTMLInputElement);
    if(!input.value){ input.value = ''; input.blur(); input.focus(); }
  }
  
  onSubmit() {
    if(this.f().invalid()) { this.markAllTouched(); return; }

    console.log(this.f().value(), this.model());
    this.isSubmitting.set(true);
    this.dataService.searchData(this.model()).pipe(
      finalize(() => { this.isSubmitting.set(false); })
    ).subscribe({
      next: (res) => console.log('Search complete', res),
      error: (err) => { this.resetForm(); }
    });
  }

  markAllTouched() {
    this.f.zone().markAsTouched();
    this.f.division().markAsTouched();
    this.f.station().markAsTouched();
    this.f.assetType().markAsTouched();
    this.f.assetNumber().markAsTouched();
    this.f.fromDate().markAsTouched();
    this.f.toDate().markAsTouched();
    this.f.view().markAsTouched();
  }

  resetForm() {
    // this.model.set(this.formModel);
    this.f().reset(this.formModel);
  }

  updateRecord(id: number){
    this.records.update(records => {
      records.map((item: any) => item.id === id ? { ...item, active: !item.active} : item );
    });
  }
}