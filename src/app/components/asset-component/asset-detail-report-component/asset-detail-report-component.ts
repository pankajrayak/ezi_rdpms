import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderComponent } from '@rdpms/shared/components';
import { DataService } from '@rdpms/shared/utility';
import { NgxPrintDirective } from 'ngx-print';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-asset-detail-report-component',
  imports: [CommonModule, FormsModule, PageHeaderComponent, NgbPaginationModule, NgxPrintDirective],
  templateUrl: './asset-detail-report-component.html',
  styleUrl: './asset-detail-report-component.scss',
})
export class AssetDetailReportComponent implements OnInit, AfterViewInit {
  private dataService = inject(DataService);
  @ViewChild('searchForm') searchForm!: NgForm;

  results: any;

  lists = {
    zones: [] as any[],
    divisions: [] as any[],
    stations: [] as any[],
    assetTypes: [] as any[],
    assetMakes: ['1', '2'] as any[],
    views: ['Table', 'Pie', 'Bar', 'Graph'] as any[],
  };

  form = { zone: '', division: '', station: '', assetType: '', assetMake: '', view: 'Table' };

  get zoneCtrl() { return this.searchForm.controls['zone']; }
  get divisionCtrl() { return this.searchForm.controls['division']; }
  get stationCtrl() { return this.searchForm.controls['station']; }
  get assetTypectrl() { return this.searchForm.controls['assetType']; }
  get assetMakeCtrl() { return this.searchForm.controls['assetMake']; }
  get viewCtrl() { return this.searchForm.controls['view']; }

  ngOnInit() {
    this.dataService.getZones().subscribe((res) => (this.lists.zones = res));
    this.dataService.getAssetTypes().subscribe((res) => (this.lists.assetTypes = res));
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchForm.setValue(this.form);
      this.divisionCtrl?.disable();
      this.stationCtrl?.disable();
    }, 0);
  }

  onZoneChange() {
    this.lists.divisions = [];
    this.lists.stations = [];
    this.divisionCtrl?.reset({ value: '', disabled: true });
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.zoneCtrl?.valid && this.zoneCtrl?.value) {
      this.dataService.getDivisions(this.zoneCtrl?.value).subscribe((res) => {
        this.lists.divisions = res;
        this.divisionCtrl?.enable();
      });
    }
  }

  onDivisionChange() {
    this.lists.stations = [];
    this.stationCtrl?.reset({ value: '', disabled: true });

    if (this.divisionCtrl?.valid && this.divisionCtrl?.value) {
      this.dataService.getStations(this.divisionCtrl?.value).subscribe((res) => {
        this.lists.stations = res;
        this.stationCtrl?.enable();
      });
    }
  }

  onSubmit() {
    if (this.searchForm.invalid) {
      this.searchForm.control.markAllAsTouched();
      return;
    }
    this.searchForm.form.disable();
    this.results = {};
    this.getData();
  }

  getData() {
    this.dataService
      .getPagedRecord(1, 10, { station: 'CSMT' })
      .pipe(finalize(() => this.searchForm.control.enable()))
      .subscribe({
        next: (results) => {
          this.results = results || {};
          this.resetForm();
        },
        error: (err) => console.error('Search failed:', err),
      });
  }

  resetForm() {
    this.ngAfterViewInit();
    this.resetFormStyles();
  }

  resetFormStyles() {
    if (this.searchForm) {
      this.searchForm.control.markAsPristine();
      this.searchForm.control.markAsUntouched();
      this.searchForm.control.updateValueAndValidity();
    }
  }
}
