import { Timestamp } from './firebase';

export interface ContentSection {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  updatedAt: Timestamp;
}
