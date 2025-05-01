export interface Property {
  id: number;
  name: string;
  contact: number;
  address: string;
  premise: string;
  area: string;
  rent: string;
  availability: string;
  condition: string;
  sqft: string|null;
  key: string;
  brokerage: string;
  status: string;
  description:string;
  description1:string;
  date:string;
}

export const dummyProperties: Property[] = [
  {
    id:1,
    name:"Shilpa kapoor",
    contact:9904355714,
    address:"25,sangam Park Society,NearHirabaugCrossing,Ambawadi",
    premise:"Sangam Park Society",
    area:"Ambawadi",
    rent:"7.50Thd",
    availability:"1Room Bungalow",
    condition:"Semi Furnished",
    key:"call to owner before 2 hours",
    brokerage:"no brokerage",
    status:"available",
    description:"online/bathrooms:1/1st floor rent /15 to 20 yeard old /facing north / maintenance including/boys allowed / 2 person allowed",
    description1:"fan , double bed , wardrobe, light, curtains, for bachelors , first floor",
    date:"16/04/2025",
    sqft:null,
  
  }
  
];
