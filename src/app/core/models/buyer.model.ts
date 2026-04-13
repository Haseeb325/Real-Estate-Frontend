// import { BuyerProfileDto } from './buyer.dto';

// export class BuyerProfile {
//   id: string;
//   phone: string;
//   image: string;
//   address: string;
//   city: string;
//   state: string;
//   country: string;

//   constructor(dto: Partial<BuyerProfileDto>) {
//     this.id = dto.id || '';
//     this.phone = dto.phone || '';
//     this.image = dto.profile_image || 'assets/default-avatar.png'; // Default image logic
//     this.address = dto.address || '';
//     this.city = dto.city || '';
//     this.state = dto.state || '';
//     this.country = dto.country || 'Pakistan'; // Default value logic
//   }

//   // Professional Helper
//   get fullLocation(): string {
//     if (!this.city && !this.country) return 'No address provided';
//     return `${this.city}, ${this.state}, ${this.country}`;
//   }

//   /**
//    * Use this for standard JSON POST/PATCH
//    */
//   toJson() {
//     return {
//       phone: this.phone,
//       address: this.address,
//       city: this.city,
//       state: this.state,
//       country: this.country,
//       // Note: Usually, we don't send the image string back in JSON 
//       // if it's a Cloudinary URL; we use FormData for uploads.
//     };
//   }
// }



import { BuyerProfileDto } from "./buyer.dto";

// export class BuyerProfile {
//     id:string = ''
//     phone:string = ''
//     profile_image:string = ''
//     address:string = ''
//     city:string = ''
//     state:string=''
//     country:string = 'Pakistan'

// // we can also set direct in only constructor and in fromJson we can set direct in constructor above variables are optional 
//     constructor(
//         private _id = this.id,
//         private _phone = this.phone,
//         private _profile_image = this.profile_image,
//         private _address = this.address,
//         private _city = this.city,
//         private _state = this.state,
//         private _country = this.country,

//     ){}


//     // getters
//     get UserId(){ return this._id }
    
//     get PhoneNumber() {return this._phone}
    
//     get ProfileImage() {return this._profile_image}
    
//     get Address() {return this._address}

//     get City() {return this._city}
    
//     get State() {return this._state}
    
//     get Country() {return this._country}
    
//     get Location() {return this._address + this._city + this._state + this._country }


//     // Factory Methods


//     static fromJson(dto:BuyerProfileDto): BuyerProfile{
//         const model = new BuyerProfile()
//         model.id = dto.id 
//         model.phone = dto.phone || ''
//         model.profile_image = dto.profile_image || ''
//         model.address = dto.address || ''
//         model.city = dto.city || ''
//         model.state = dto.state || ''
//         model.country = dto.country || 'Pakistan'

//         return model

//         // we can also do this 
//     //      return new PatientModel(
//     //   json.patientId,
//     //   json.mrPrefix,
//     //   json.consultantId,

//     }


// //     * 3. toJson for JSON POSTS (Exclude Image)
// //    * We exclude the image here because Cloudinary URLs are read-only for the API. we will not do toJson when data will be formData we will add check while we post and all set in advance crud also  
// //    */

//      toJson(){
//         return {
//            phone:this._phone,
//            address:this._address,
//            city:this._city,
//            state:this._state,
//            country:this._country
//         }
//      }




// }


// import { BuyerProfileDto } from "./buyer.dto";

export class BuyerProfile {
  /**
   * PROFESSIONAL CONSTRUCTOR
   * Using 'private' inside the constructor arguments automatically:
   * 1. Declares the private variable (e.g., this._id)
   * 2. Assigns the value passed to it
   */
  constructor(
    private _id: string = '',
    private _phone: string = '',
    private _profile_image: string = '',
    private _address: string = '',
    private _city: string = '',
    private _state: string = '',
    private _country: string = 'Pakistan'
  ) {}

  // --- GETTERS ---
  // These allow your UI to access data safely (e.g., user.phone)
  get id() { return this._id; }
  get phone() { return this._phone; }
  get profileImage() { return this._profile_image; }
  get address() { return this._address; }
  get city() { return this._city; }
  get state() { return this._state; }
  get country() { return this._country; }

  // Logic-based getter for UI convenience
  get fullLocation(): string {
    return `${this._address}, ${this._city}, ${this._state}, ${this._country}`;
  }

  // --- FACTORY METHOD ---
  /**
   * This is what your Service calls: BuyerProfile.fromJson(apiData)
   * It maps the API's snake_case to our Model's private variables.
   */
  static fromJson(dto: BuyerProfileDto): BuyerProfile {
    return new BuyerProfile(
      dto.id,
      dto.phone || '',
      dto.profile_image || '',
      dto.address || '',
      dto.city || '',
      dto.state || '',
      dto.country || 'Pakistan'
    );
  }

  // --- SERIALIZATION ---
  /**
   * Use this when sending JSON data back to Django.
   * Note: profile_image is excluded because the API expects a File via FormData
   * for image updates, not a URL string.
   */
  toJson() {
    return {
      phone: this._phone,
      address: this._address,
      city: this._city,
      state: this._state,
      country: this._country
    };
  }
}