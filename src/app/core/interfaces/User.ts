export interface User {
    id:string,
    email:string,
    username:string,
    full_name:string,
    role: 'buyer' | 'seller' | 'admin';
}