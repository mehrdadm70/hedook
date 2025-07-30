export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: Address;
  children?: Child[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Child {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  interests: string[];
} 