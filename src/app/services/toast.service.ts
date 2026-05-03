import { Injectable } from '@angular/core';
import { ToastService as AngularToastService } from 'angular-toastify';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastify: AngularToastService) {}

  success(msg: string) {
    this.toastify.success(msg);
  }

  error(msg: string) {
    this.toastify.error(msg);
  }

  info(msg: string) {
    this.toastify.info(msg);
  }
}
