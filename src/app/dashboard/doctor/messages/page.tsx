import { Messages } from '@/components/fhir-ui/Messages';

export default function DoctorMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Secure communication with patients and staff.
        </p>
      </div>
      <Messages />
    </div>
  );
}
