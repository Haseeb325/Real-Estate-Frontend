// dto is actually a interface of actual values of backend response, while model is a class that we use in frontend to create objects and add methods to it.

import { User } from "../interfaces/User";

export interface BuyerProfileDto {
    id: string;
    user?:User,
    phone: string;
    profile_image: string;
    address: string;
    city: string;
    state: string;
    country: string;
}