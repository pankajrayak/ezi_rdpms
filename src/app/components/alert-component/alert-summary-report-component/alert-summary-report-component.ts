import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../../shared/components/page-header-component/page-header-component';
import { NgxPrintDirective } from 'ngx-print';
import { finalize } from 'rxjs';
import { DataService } from '../../../utility/json-data-service';

@Component({
  selector: 'alert-summary-report-component',
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, NgxPrintDirective],
  templateUrl: './alert-summary-report-component.html',
  styleUrl: './alert-summary-report-component.css',
})
export class AlertSummaryReportComponent {

  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  
  lists = { 
    zones: [] as any[], 
    divisions: [] as any[], 
    stations: [] as any[], 
    alertTypes: [] as any[],
    assetTypes: [] as any[],
  };
  
  searchForm: FormGroup = this.fb.nonNullable.group({
    zone: ['', Validators.required],
    division: [{ value: '', disabled: true }, Validators.required],
    station: [{ value: '', disabled: true }, Validators.required],
    alertType: ['All', Validators.required],
    assetType: ['All', Validators.required],
    assetNumber: ['All', Validators.required],
    cause: ['All', Validators.required],
    view: ['Table', Validators.required],
    fromDate: ['', Validators.required],
    fromTime: ['', Validators.required],
    toDate: [''],
    toTime: [''],
  });

  get form() { return this.searchForm.controls; }
  get zoneCtrl() { return this.form['zone']; }
  get divisionCtrl() { return this.form['division']; }
  get stationCtrl() { return this.form['station']; }
  get alertTypeCtrl() { return this.form['alertType']; }
  get assetTypeCtrl() { return this.form['assetType']; }
  get assetNumberCtrl() { return this.form['assetNumber']; }
  get causeCtrl() { return this.form['cause']; }
  get viewCtrl() { return this.form['view']; }
  get fromDateCtrl() { return this.form['fromDate']; }
  get fromTimeCtrl() { return this.form['fromTime']; }
  get toDateCtrl() { return this.form['toDate']; }
  get toTimeCtrl() { return this.form['toTime']; }

  ngOnInit() {
    this.dataService.getZones().subscribe((data: any) => this.lists.zones = data);
    this.dataService.getAlertTypes().subscribe((data: any) => this.lists.alertTypes = data);
    this.dataService.getAssetTypes().subscribe((data: any) => this.lists.assetTypes = data);
  }

  onZoneChange(): void {
    
    this.lists.divisions = []; this.lists.stations = [];
    this.divisionCtrl?.reset({ value: '', disabled: true });
    this.stationCtrl?.reset({ value: '', disabled: true });
    
    if(this.zoneCtrl?.valid && this.zoneCtrl.value) {
      this.dataService.getDivisions(this.zoneCtrl.value).subscribe((data: any) => {
        this.lists.divisions = data;
        this.divisionCtrl?.enable();
      });
    }
  }

  onDivisionChange() {
    this.lists.stations = [];
    this.stationCtrl?.reset({ value: '', disabled: true });
    
    if(this.divisionCtrl?.valid && this.divisionCtrl.value) {
      this.dataService.getStations(this.divisionCtrl.value).subscribe((data: any) => {
        this.lists.stations = data;
        this.stationCtrl?.enable();
      });
    }
  }

  onStationChange() { }

  onAlertTypeChange() { }

  onAssetTypeChange() { }

  onAssetNumberChange() { }

  onCauseChange() { }

  onSubmit() {
    if(!this.searchForm.valid) {
      this.searchForm.markAllAsTouched(); 
      return;
    }
    
    this.searchForm.disable();
    const payload = this.searchForm.getRawValue();
    this.dataService.searchData(payload)
    .pipe( finalize(() => this.searchForm.enable()) )
    .subscribe({
      next: (res) => console.log('Search complete', res),
      error: (err) => console.error('Search failed', err)
    })
  }
  
  records = [
    { sNo: 1, zone: 'Central', division: 'Mumbai', station: 'CSTM', alertType: 'Failure', assetType: 'Point Machine', assetNumber: 'PM-202A', cause: 'PT-OBS', alertFeedback: 'T', incDateTime: '2026-04-19 10:00 AM', duration: '02:45:00', feedbackDateTime: '2026-04-19 12:45 PM', maintainerName: 'Rahul Sharma', maintainerDesignation: 'Sr. Technician', maintainerMobile: '9876543210', maintainerRemark: 'Loose connection tightened at junction box.'},
    { sNo: 2, zone: 'Western', division: 'Ratlam', station: 'Ujjain Jn', alertType: 'Predictive', assetType: 'Track Ckt', assetNumber: 'TC-501', cause: 'Voltage Drop', alertFeedback: 'M', incDateTime: '2026-04-19 08:15 AM', duration: '01:20:00', feedbackDateTime: '2026-04-19 09:35 AM', maintainerName: 'Amit Verma', maintainerDesignation: 'JE S&T', maintainerMobile: '9123456789', maintainerRemark: 'Battery bank checked, charging stabilized.' },
    { sNo: 3, zone: 'Central', division: 'Nagpur', station: 'Ajni', alertType: 'Failure', assetType: 'Point Machine', assetNumber: 'PM-114', cause: 'PT-OBS', alertFeedback: 'F', incDateTime: '2026-04-18 11:45 PM', duration: '04:10:00', feedbackDateTime: '2026-04-19 03:55 AM', maintainerName: 'Suresh Raina', maintainerDesignation: 'Technician-I', maintainerMobile: '9988776655', maintainerRemark: 'Foreign object removed from point blade.' },
    { sNo: 4, zone: 'Western', division: 'Ahmedabad', station: 'Sabarmati', alertType: 'Predictive', assetType: 'Axle Counter', assetNumber: 'AC-309', cause: 'Communication Error', alertFeedback: 'T', incDateTime: '2026-04-18 02:20 PM', duration: '00:55:00', feedbackDateTime: '2026-04-18 03:15 PM', maintainerName: 'Deepak Jha', maintainerDesignation: 'ESM', maintainerMobile: '8877665544', maintainerRemark: 'Reset done, card working normally.'},
    { sNo: 5, zone: 'Central', division: 'Pune', station: 'Lonavala', alertType: 'Failure', assetType: 'Signal Main', assetNumber: 'SIG-L12', cause: 'Fuse Blown', alertFeedback: 'M', incDateTime: '2026-04-17 05:10 AM', duration: '01:05:00', feedbackDateTime: '2026-04-17 06:15 AM', maintainerName: 'Karan Singh', maintainerDesignation: 'Helper', maintainerMobile: '7766554433', maintainerRemark: 'Fuse replaced, signal aspect restored.' }
  ];

}