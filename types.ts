export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  products?: Product[];
}

export interface Product {
  itemName: string;
  description: string;
  purchaseLink: string;
}

export interface DesignStyle {
    name: string;
    prompt: string;
    imageUrl: string;
}
