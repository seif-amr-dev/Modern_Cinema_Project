export type SeatType = 'standard' | 'vip';

export interface HallSeat {
  row: string;
  number: number;
  type: SeatType;
}

export interface Hall {
  _id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  seatMap: HallSeat[];
  isActive: boolean;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHallRequest {
  name: string;
  rows: number;
  seatsPerRow: number;
}

export interface UpdateHallRequest {
  name?: string;
  rows?: number;
  seatsPerRow?: number;
}

export interface HallListResponse {
  success: boolean;
  count: number;
  results: Hall[];
}

export interface HallResponse {
  success: boolean;
  result: Hall;
}

export interface HallMessageResponse {
  success: boolean;
  message: string;
}