// import { signalStore, withComputed, withMethods, patchState } from '@ngrx/signals';
// import { Appointment } from '../../core/interfaces/appointment';
// import { URLConfig } from '../utils/url-config';
// import { withCrudEntities } from '../signals/crud.feature';
// import { firstValueFrom } from 'rxjs';
// import { inject } from '@angular/core';
// import { ApiService } from '../api.service';

// /**
//  * Modern Signal-based Store for Appointments.
//  * Demonstrates composition of modular CRUD features and custom logic.
//  */
// export const AppointmentsStore = signalStore(
//   { providedIn: 'root' },

//   // Base CRUD logic
//   withCrudEntities<Appointment>({
//     entityName: 'Appointment',
//     baseUrl: URLConfig.appointments,
//     cacheTtl: 300000, // 5 minutes
//   }),

//   // Custom computed signals (Replaces manual filtering in old service)
//   withComputed((store) => ({
//     upcoming: () => store.entities().filter((a) => a.status === 'pending' || a.status === 'confirmed'),
//     completed: () => store.entities().filter((a) => a.status === 'completed'),
//     cancelled: () => store.entities().filter((a) => a.status === 'cancelled'),
//   })),

//   // Custom methods (Replaces performAction)
//   withMethods((store) => {
//     const apiService = inject(ApiService);

//     return {
//       async performAction(id: string | number, action: 'confirm' | 'cancel' | 'complete') {
//         return store.runRequest(async () => {
//           let url = '';
//           switch (action) {
//             case 'confirm': url = URLConfig.confirmAppointment(id); break;
//             case 'cancel': url = URLConfig.cancelAppointment(id); break;
//             case 'complete': url = URLConfig.completeAppointment(id); break;
//           }

//           const response: any = await firstValueFrom(apiService.post(url, {}));

//           // Refresh the specific entity in state after action
//           // Instead of reloading everything, we can just update the status locally
//           // or reload all if preferred.
//           await store.loadAll({}, true);

//           return response.data;
//         }, { successMessage: `Appointment ${action}ed successfully`, useGlobalLoading: true });
//       }
//     };
//   })
// );
