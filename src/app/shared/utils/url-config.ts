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

  public static getCurrentUser = baseUrl + 'get-current-user';

  public static sellerProfile = baseUrl + 'profile/seller';
  public static sellerDocs = baseUrl + 'profile/seller/docs';
  public static sellerAvailabilities = baseUrl + 'seller/availabilities/';
}
