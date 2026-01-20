import { Messages } from '@/components/fhir-ui/Messages';

export default function PatientMessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Communicate with your care team.
        </p>
      </div>
      <Messages />
    </div>
  );
}
