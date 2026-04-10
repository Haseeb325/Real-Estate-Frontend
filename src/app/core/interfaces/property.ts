
export interface Property {
    id?:number,
    title:string,
    property_type:'house' | 'apartment' | 'plots_and_land' | 'commercial';
    sale_type:string,
    sale_price?:string,
    rent_price?:string,
    location:string,
    location_text:string,
    hero_image:string,
    user?:User,
    status?:string,
    is_verified?:boolean,
}

export interface User {
    id?:string,
    email:string,
    username:string,
    full_name:string,
    role:string
}
export interface PropertImage{
    id?:number,
    image:string
}
export interface Feature {
    id?:number,
    name:string
}

export interface Commercial {
    id:string,
    features:Feature[],
    commercial_type?:string,
    commercial_subtype?:string,
    ownership?:string,
    builtup_area:number,
    useable_area:string,
    floor_number:string,
    frontage:string,
    bathrooms?:number,
    has_kitchen?:boolean,
    furnishing?:string,
    parking_details:string,
    building_grade:string,
    description:string,
    created_at?:string,
    updated_at?:string
}

export interface House {
    id:string,
    features:Feature[],
    bedrooms:number,
    bathrooms:number,
    builtup_area:number,
    year_built:number,
    parking?:string,
    plot_size?:number,
    floors?:number,
    description:string,
    sub_type?:string,
    created_at?:string,
    updated_at?:string
}

export interface Apartment {
    id:string,
    features:Feature[],
    bedrooms:number,
    bathrooms:number,
    builtup_area:number,
    furnishing?:string,
    parking?:string,
    has_balcony:boolean,
    occupant_preference:string,
    description:string,
    created_at?:string,
    updated_at?:string
}

export interface PlotAndLand {
    id:string,
    features:Feature[],
    plot_type:string,
    permitted_use?:string,
    ownership?:string,
    area:number,
    frontage?:string,
    depth?:string,
    facing?:string,
    has_corner_plot?:boolean,
    road_width?:string,
    approval_by?:string,
    possession_status?:string,
    description:string,
    created_at?:string,
    updated_at?:string
}

export interface PropertyDetail extends Property{
    images?:PropertImage[],
    security_deposit?:string,
    is_availabe?:boolean,
    house?:House | null,
    commercial?:Commercial | null,
    apartment?:Apartment | null,
    plots_and_land?:PlotAndLand | null,
    created_at?:string,
    updated_at?:string
}