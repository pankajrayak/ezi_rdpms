import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';

@Component({
  selector: 'app-sensor-live-component',
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './sensor-live-component.html',
  styleUrl: './sensor-live-component.scss',
})
export class SensorLiveComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);

  results: any;

  lists = {
    zones: [] as any[],
    divisions: [] as any[],
    stations: [] as any[],
    assetTypes: [] as any[],
    views: ['Table', 'Pie', 'Bar', 'Graph'] as any[],
  };

  searchForm: FormGroup = this.fb.nonNullable.group({
    zone: ['', Validators.required],
    division: [{ value: '', disabled: true }, Validators.required],
    station: [{ value: '', disabled: true }, Validators.required],
    assetType: ['All', Validators.required],
    view: ['Table', Validators.required],
  });

  get form() { return this.searchForm.controls; }
  get zoneCtrl() { return this.form['zone']; }
  get divisionCtrl() { return this.form['division']; }
  get stationCtrl() { return this.form['station']; }
  get assetTypeCtrl() { return this.form['assetType']; }
  get assetNumberCtrl() { return this.form['assetNumber']; }
  get viewCtrl() { return this.form['view']; }

  ngOnInit() {
    this.dataService.getZones().subscribe((res) => (this.lists.zones = res));
    this.dataService.getAssetTypes().subscribe((res) => (this.lists.assetTypes = res));
  }

  onZoneChange() {
    this.lists.divisions = [];
    this.lists.stations = [];
    this.divisionCtrl?.reset({ value: '', disabled: true });
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.zoneCtrl?.valid && this.zoneCtrl.value) {
      this.dataService.getDivisions(this.zoneCtrl.value).subscribe((res) => {
        this.lists.divisions = res;
        this.divisionCtrl?.enable();
      });
    }
  }

  onDivisionChange() {
    this.lists.stations = [];
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.divisionCtrl?.valid && this.divisionCtrl.value) {
      this.dataService.getStations(this.divisionCtrl.value).subscribe((res) => {
        this.lists.stations = res;
        this.stationCtrl?.enable();
      });
    }
  }

  onStationChange() {}

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searchForm.disable();
    this.results = {};
    this.getData();
  }

  getData() {
    this.dataService.getPagedRecord(1, 10, this.searchForm.getRawValue())
      .pipe(finalize(() => this.searchForm.enable()))
      .subscribe({
        next: (results) => { this.results = results || {}; },
        error: (err) => console.error('Search failed:', err),
      });
  }

  resetForm() {
    this.searchForm.reset();
  }
}
