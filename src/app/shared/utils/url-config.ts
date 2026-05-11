import { environment } from '../../../environments/environment';

let baseUrl = environment.apiBaseUrl;
export class URLConfig {
  // Auth EndPoints
  public static regStep1 = baseUrl + 'register/step1';
  public static verifyOtp = baseUrl + 'verify-otp';
  public static resendOtp = baseUrl + 'resend-otp';
  public static regStep2 = baseUrl + 'register/step2';
  public static regStep3 = baseUrl + 'register/step3';
  public static forgotPassword = baseUrl + 'reset-password';
  public static resetPassword = baseUrl + 'forgot-password';
  public static signIn = baseUrl + 'sign-in';
  public static refreshAccessToken = baseUrl + 'refresh-access-token';
  public static logout = baseUrl + 'logout';

  // Property EndPoints
  public static getAllProperties = baseUrl + 'properties/browse/';
  public static getSpecificProperty = (id: any) => {
    return baseUrl + `properties/browse/${id}/`;
  };

  // buyer profile
  public static buyerProfile = baseUrl + 'profile/buyer';

  public static changePassword = baseUrl + 'change-password';

  // properties urls
  public static createProperty = baseUrl + 'properties/';

  public static getAllSellerProperties = baseUrl + 'properties/';
  public static getSellerSpecificProperty = (id: any) => {
    return baseUrl + `properties/${id}`;
  };

  public static deleteSellerProperty = (id: any) => {
    return baseUrl + `properties/${id}`;
  };

  public static pauseSellerProperty = (id: any) => {
    return baseUrl + `properties/${id}/pause/`;
  };

  public static reactivateSellerProperty = (id: any) => {
    return baseUrl + `properties/${id}/reactivate/`;
  };

  public static getCurrentUser = baseUrl + 'get-current-user';

  public static sellerProfile = baseUrl + 'profile/seller';
  public static sellerDocs = baseUrl + 'profile/seller/docs';
  public static sellerAvailabilities = baseUrl + 'seller/availabilities/';

  // Appointments & Availability
  public static getPropertyAvailability = (id: any) =>
    baseUrl + `properties/browse/${id}/availability/`;
  public static appointments = baseUrl + 'appointments/';

  public static confirmAppointment = (id: any) => `${baseUrl}appointments/${id}/confirm/`;
  public static cancelAppointment = (id: any) => `${baseUrl}appointments/${id}/cancel/`;
  public static completeAppointment = (id: any) => `${baseUrl}appointments/${id}/complete/`;

  // Payments & Rentals
  public static processPayment = baseUrl + 'payments/process/';
  public static rentalAgreements = baseUrl + 'rental-agreements/';
  public static paymentHistory = baseUrl + 'payments/';

  // admin urls
  public static getDashboardStats = baseUrl + 'admin/stats';
  public static propertiesStats = baseUrl + 'admin/properties/stats';
  public static paymentStats = baseUrl + 'admin/finance/stats';
  public static getAllUsers = baseUrl + 'admin/users';

  public static suspendUser = (id: any) => `${baseUrl}admin/users/${id}/suspend/`;
  public static activateUser = (id: any) => `${baseUrl}admin/users/${id}/activate/`;

  public static getAllPropertiesByAdmin = baseUrl + 'admin/properties';
  public static getSpecificPropertyByAdmin = (id: any) => `${baseUrl}admin/properties/${id}/`;

  public static inactivePropertyByAdmin = (id: any) => {
    return baseUrl + `admin/properties/${id}/suspend/`;
  };
  public static reactivatePropertyByAdmin = (id: any) => {
    return baseUrl + `admin/properties/${id}/activate/`;
  };

  // Verification Endpoints
  public static verifyProperty = (id: any) => `${baseUrl}admin/properties/${id}/verify/`;
  public static rejectPropertyVerification = (id: any) =>
    `${baseUrl}admin/properties/${id}/reject_verification/`;
  public static getAdminSellerVerifications = () => `${baseUrl}admin/verifications/sellers/`;
  public static getPendingPropertiesVerifications = () => `${baseUrl}admin/properties`;

  // Finance URLs

  public static getSalesTransactions = baseUrl + 'admin/finance/sales';
  public static getRentalTransactions = baseUrl + 'admin/finance/rentals';
}
