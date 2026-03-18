export interface PurchaseOrderItem {
  id: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PurchaseOrderData {
  type: 'PACTUE' | 'PNAE' | 'PDDE';
  researchNumber: string;
  year: string;
  contractor: string;
  winnerProponent: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  responsibleName: string;
  responsibleRole: string;
  location: string;
  date: string;
}
