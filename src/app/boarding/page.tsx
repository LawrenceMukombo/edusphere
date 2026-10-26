import { redirect } from 'next/navigation';

export default function BoardingPage() {
  redirect('/modules/operations?tab=hostel');
}
