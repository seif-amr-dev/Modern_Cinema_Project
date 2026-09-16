export interface Seat{
  id: string;
  price: number;
  number: number;
  row: string;
  type: 'normal' | 'vip';
  status: 'available' | 'booked' | 'selected';
}
export interface BookingRequest{
  showId: string;
  seatIds: string[];
  totalPrice: number;
}
export interface Ticket{
  bookingId: string;
  movieTitle: string;
  hallName: string;
  showTime: string;
  seats:Seat[];
  totalPrice: number;
}