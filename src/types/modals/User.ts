export interface User {
  token?: undefined | string;
  preference?: any;
  userDetails?: Object;
  userNumber?: number;
  fcmToken?: undefined | string;
  contacts?: Array<any>;
}


export interface User {
  name: string
  info: string
  characterstics: string
  gender: string
  notes: string
  image: string
  knowFrom: string
  email: string
}

export interface contact {
  name: string
  info: string
  characterstics: string
  gender: string
  notes: string
  image: string
  bgcolor: string
  knowfrom: string
}
export interface Editcontact {
  _id: string
  name: string
  info: string
  characterstics: string
  gender: string
  notes: string
  image: string
  bgcolor: string
  knowfrom: string
}
export interface Deletecontact {
  id: string
}


export interface PaymentCards {
  paymentCards: object
}
