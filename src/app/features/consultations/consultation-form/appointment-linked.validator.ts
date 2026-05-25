import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Injectable } from '@angular/core';
import { AppointmentsService } from '../../appointments/services/appointments.service';
import { map, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppointmentLinkedValidator {
  constructor(private appointmentsService: AppointmentsService) {}

  validate(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return of(null);
      return this.appointmentsService.getAppointment(control.value).pipe(
        map((appointment) => {
          // If appointment already has a consultation, error
          if ((appointment as any).consultation) {
            return { appointmentLinked: true };
          }
          return null;
        }),
        catchError(() => of(null))
      );
    };
  }
}
