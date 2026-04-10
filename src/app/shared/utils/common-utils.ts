import { Injectable } from "@angular/core";

@Injectable({
    providedIn:'root'
})

export class CommonUtils{
    
}


// Utility to safely access nested properties without throwing errors
// output: getNestedValue(user, 'profile.address.street') => returns street or undefined if any part of the path is missing

export function getNestedValue(obj:any, path:string){
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

// Build full Cloudinary URL from partial path
export function getCloudinaryUrl(imagePath: string): string {
    if (!imagePath) return '';
    
    // If already a full URL, return as is
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // If partial Cloudinary path, construct full URL
    const cloudinaryUrl = 'https://res.cloudinary.com/';
    const cloudName = 'dibifnrfx'; // Replace with your Cloudinary cloud name
    
    return `${cloudinaryUrl}${cloudName}/${imagePath}`;
}