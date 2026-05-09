import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { AbstractControl, FormGroup, NgForm } from '@angular/forms';
import { ToastService } from '../core/services/toast-service';
import { ConstantUtil } from './constant-util';

@Injectable({
  providedIn: 'root',
})
export class GlobalUtil {

  constructor(@Inject(DOCUMENT) private readonly document: Document, private toastService: ToastService) {}

  isDefined<T>(value: T | undefined | null | string): value is T {
    return value !== undefined && value !== null && value !== '';
  }
  
  getISODate(date: any): string | undefined {
    const dt = new Date(date);
    return this.isValidDate(dt) ? dt.toISOString().split('T')[0] : undefined;
  }

  getCustomDate(date: any, offset = {days: 0, months: 0, years: 0}): string | undefined {
    const dt = new Date(date);
    if(!this.isValidDate(dt)){ return undefined; }

    dt.setFullYear(dt.getFullYear() + (offset.years || 0));
    dt.setMonth(dt.getMonth() + (offset.months || 0));
    dt.setDate(dt.getDate() + (offset.days || 0 ));

    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  getDateDiffInDays(d1: any, d2: any): number | undefined {
    const dt1 = new Date(d1);
    const dt2 = new Date(d2);

    if(!this.isValidDate(dt1) || !this.isValidDate(dt2)){ return undefined; }

    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((dt1.getTime() - dt2.getTime()) / msPerDay )
  }

  isValidDate(date: any): boolean{
    return date instanceof Date && !isNaN(date.getTime());
  }

  truncate(num: number, decimal = 3): number {
    const re = new RegExp(`^-?\\d+(?:\\.\\d{0, ${decimal}})?`);
    const match = num.toString().match(re);
    return match ? Number(match[0]) : 0;
  }

  isNumInRange(val: number, min: number, max: number): boolean {
    return val >= min && val <= max;
  }

  cleanString(val: any): string {
    return typeof val === 'string' ? val.replace(/[\s\t\r\n]+/g, ' ').trim() : val;
  }

  isHtml(str: string): boolean {
    return /<\/?[a-z][\s\S]*>/i.test(str);
  }

  removeEmptyKeys<T extends object>(obj : T): Partial<T> {
    if(!obj){ return {} as T; }

    return Object.entries(obj)
      .filter(([_, v]) => this.isDefined(v))
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v}), {});
  }

  saveFile(file: any, filename: string, extention?: string, prompt = false) {
    if(!extention){
      this.downloadBlob(file, filename);
      return;
    }

    const ext = extention.toLowerCase();
    const type = this.getMimeType(extention);

    if(ext === 'html'){
      const url = URL.createObjectURL(new Blob([file], { type }) );
      this.openSecureWindow(url);
    }else{
      this.downloadBlob(file, `${filename}.${ext}`);
      if(prompt){ this.toastService.show(`file downloaded successfully`); }
    }
  }

  downloadBlob(content: any, filename: string): void {
    const url = URL.createObjectURL(new Blob([content]));
    const link = this.document.createElement('a');

    Object.assign(link, { href: url, download: filename, style: 'display: none' });
    this.document.body.appendChild(link);
    link.click();

    this.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  openSecureWindow(url: string): void {
    const features = `width=${screen.availWidth}, height=${screen.availHeight},left=0,top=0,menubar=no,status=no`;
    const win = window.open(`${url}#toolbar=0&navpanes=0`, '_blank', features);

    if(!win || win.closed){
      this.toastService.show('Popup blocked! Please allow popups,');
      return;
    }

    win.focus();
    win.addEventListener('keydown', (e)=> e.key === 'Escape' && win.close());
  }

  getMimeType(ext: string): string {
    const mimeMap: Record<string, string> = {
      TXT: 'text/plain',
      CVS: 'text/csv;charset=utf-8;',
      PNG: 'image/png',
      JPEG: 'image/jpeg', JPG: 'image/jpeg',
      HTML: 'text/html', HTM: 'text/html',
      PDF: 'application/pdf',
      JSON: 'application/json',
      XML: 'application/xml',
      ZIP: 'application/zip',
      XLS: 'application/vnd.ms-excel',
      SLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }

    return mimeMap[ext?.toUpperCase()] || 'application/octet-stream';
  }

  async handleError(error: any, component='Unknown', method='Unknown', customMsg?: string): Promise<any> {
    console.error(`Error in ${component}.${method}:`, error);
    
    let message = customMsg;
    if(!message){
      message = (error?.error instanceof Blob)
        ? await this.getErrorMessageFromBlob(error.error) 
        : this.getErrorMessage(error.error);
    }
    
    this.toastService.show(message, { classname: 'bg-danger text-light', delay: 5000 }) ;
    return message;
  }

  getErrorMessage(error: any): string {
    if(error?.status === 0 ) return ConstantUtil.ERRORS.NETWORK;
    if(error?.status === 500) return ConstantUtil.ERRORS.SERVER;

    const rawError = error?.errorMessage || error?.message || error || '';

    if(typeof rawError === 'string') {
      try{
        const parsed = JSON.parse(rawError);
        return parsed.message || ConstantUtil.ERRORS.GENERAL;
      }catch {
        return rawError || ConstantUtil.ERRORS.GENERAL;
      }
    }
    return ConstantUtil.ERRORS.GENERAL;
  }

  async getErrorMessageFromBlob(blob: Blob): Promise<string> {
    try{
      const text = await blob.text();
      const json = JSON.parse(text);
      return json.errorMessage || json.message || ConstantUtil.ERRORS.GENERAL;
    }catch {
      return ConstantUtil.ERRORS.GENERAL;
    }
  }

}
